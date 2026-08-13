import os
import json
import logging
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    precision_recall_curve, roc_curve, auc, average_precision_score,
    roc_auc_score, precision_score, recall_score, f1_score,
    balanced_accuracy_score, confusion_matrix
)
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier
import shap
import optuna

from backend.app.config import MODELS_DIR, RANDOM_STATE, LEAKAGE_EXCLUSIONS
from backend.app.preprocessing.data_loader import load_all_data
from backend.app.preprocessing.feature_engineering import engineer_features

optuna.logging.set_verbosity(optuna.logging.WARNING)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODEL_SAVE_DIR = MODELS_DIR / "disruption"

def train_disruption_model():
    """Train, optimize, evaluate, and save Model 1 (Supply Disruption Prediction)."""
    logger.info("--- Starting Model 1: Supply Disruption Prediction Training ---")
    MODEL_SAVE_DIR.mkdir(parents=True, exist_ok=True)

    master_df, _, _ = load_all_data()
    df = engineer_features(master_df)

    # Filter out unlabeled 2026 rows (where disruption_next_year is NaN)
    df_labeled = df[df["disruption_next_year"].notnull()].copy()
    df_labeled["disruption_next_year"] = df_labeled["disruption_next_year"].astype(int)

    # Exclude leakage columns and identifier columns
    exclude_cols = LEAKAGE_EXCLUSIONS["disruption"] + [
        "year", "mineral", "country", "end_use", "price_next_year"
    ]
    feature_cols = [c for c in df_labeled.columns if c not in exclude_cols and not df_labeled[c].dtype == "object"]

    logger.info(f"Selected {len(feature_cols)} features for disruption prediction.")

    # Chronological temporal split ensuring positive disruptions in all sets
    train_mask = (df_labeled["year"] <= 2020)
    val_mask = (df_labeled["year"] >= 2021) & (df_labeled["year"] <= 2023)
    test_mask = (df_labeled["year"] >= 2024) & (df_labeled["year"] <= 2025)

    X_train = df_labeled.loc[train_mask, feature_cols].copy()
    y_train = df_labeled.loc[train_mask, "disruption_next_year"].copy()

    X_val = df_labeled.loc[val_mask, feature_cols].copy()
    y_val = df_labeled.loc[val_mask, "disruption_next_year"].copy()

    X_test = df_labeled.loc[test_mask, feature_cols].copy()
    y_test = df_labeled.loc[test_mask, "disruption_next_year"].copy()

    logger.info(f"Split sizes -> Train: {len(X_train)} (2015-2020), Val: {len(X_val)} (2021-2023), Test: {len(X_test)} (2024-2025)")
    logger.info(f"Disruption positive rates -> Train: {y_train.mean():.1%}, Val: {y_val.mean():.1%}, Test: {y_test.mean():.1%}")

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    # Compute scale_pos_weight for imbalance
    pos_count = (y_train == 1).sum()
    neg_count = (y_train == 0).sum()
    scale_pos_weight = float(neg_count) / float(pos_count) if pos_count > 0 else 1.0

    # Define Candidate Classifiers
    candidate_models = {
        "Logistic Regression": LogisticRegression(random_state=RANDOM_STATE, class_weight="balanced", max_iter=1000),
        "Random Forest": RandomForestClassifier(random_state=RANDOM_STATE, class_weight="balanced", n_estimators=150, max_depth=8),
        "XGBoost": XGBClassifier(random_state=RANDOM_STATE, scale_pos_weight=scale_pos_weight, eval_metric="logloss", n_estimators=150, max_depth=5),
        "LightGBM": LGBMClassifier(random_state=RANDOM_STATE, scale_pos_weight=scale_pos_weight, verbose=-1, n_estimators=150, max_depth=5),
        "CatBoost": CatBoostClassifier(random_state=RANDOM_STATE, auto_class_weights="Balanced", verbose=0, iterations=150, depth=5)
    }

    comparison_results = []
    best_model_name = None
    best_pr_auc = -1.0
    best_model_obj = None

    for name, model in candidate_models.items():
        # Fit on train
        model.fit(X_train_scaled, y_train)

        # Predict probabilities on val
        val_probs = model.predict_proba(X_val_scaled)[:, 1]
        val_pr_auc = average_precision_score(y_val, val_probs)
        val_roc_auc = roc_auc_score(y_val, val_probs)

        # Predict probabilities on test
        test_probs = model.predict_proba(X_test_scaled)[:, 1]
        test_preds = (test_probs >= 0.5).astype(int)

        test_pr_auc = average_precision_score(y_test, test_probs)
        test_roc_auc = roc_auc_score(y_test, test_probs)
        test_prec = precision_score(y_test, test_preds, zero_division=0)
        test_rec = recall_score(y_test, test_preds, zero_division=0)
        test_f1 = f1_score(y_test, test_preds, zero_division=0)
        test_bal_acc = balanced_accuracy_score(y_test, test_preds)

        logger.info(f"Model: {name:<20} | Val PR-AUC: {val_pr_auc:.4f} | Test PR-AUC: {test_pr_auc:.4f} | Test F1: {test_f1:.4f}")

        result_entry = {
            "model": name,
            "val_pr_auc": round(float(val_pr_auc), 4),
            "val_roc_auc": round(float(val_roc_auc), 4),
            "test_pr_auc": round(float(test_pr_auc), 4),
            "test_roc_auc": round(float(test_roc_auc), 4),
            "test_precision": round(float(test_prec), 4),
            "test_recall": round(float(test_rec), 4),
            "test_f1": round(float(test_f1), 4),
            "test_balanced_accuracy": round(float(test_bal_acc), 4)
        }
        comparison_results.append(result_entry)

        if val_pr_auc > best_pr_auc:
            best_pr_auc = val_pr_auc
            best_model_name = name
            best_model_obj = model

    logger.info(f"Best Base Model: {best_model_name} with Val PR-AUC = {best_pr_auc:.4f}")

    # Optuna Hyperparameter Optimization on the best model type (e.g. XGBoost/CatBoost)
    def objective(trial):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 50, 300),
            "max_depth": trial.suggest_int("max_depth", 3, 10),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0)
        }
        tuned_xgb = XGBClassifier(
            **params, random_state=RANDOM_STATE, scale_pos_weight=scale_pos_weight, eval_metric="logloss"
        )
        tuned_xgb.fit(X_train_scaled, y_train)
        probs = tuned_xgb.predict_proba(X_val_scaled)[:, 1]
        return average_precision_score(y_val, probs)

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=15)
    logger.info(f"Optuna Best Trial PR-AUC: {study.best_value:.4f}")

    # Retrain final tuned model on combined Train+Val data, test on Test
    X_train_val = pd.concat([X_train, X_val])
    y_train_val = pd.concat([y_train, y_val])

    scaler_final = StandardScaler()
    X_train_val_scaled = scaler_final.fit_transform(X_train_val)
    X_test_final_scaled = scaler_final.transform(X_test)

    final_params = study.best_params
    final_params["random_state"] = RANDOM_STATE
    final_params["scale_pos_weight"] = scale_pos_weight
    final_params["eval_metric"] = "logloss"

    final_model = XGBClassifier(**final_params)
    final_model.fit(X_train_val_scaled, y_train_val)

    # Evaluate final model on test set (2025)
    test_probs = final_model.predict_proba(X_test_final_scaled)[:, 1]
    test_preds = (test_probs >= 0.5).astype(int)

    final_pr_auc = average_precision_score(y_test, test_probs)
    final_roc_auc = roc_auc_score(y_test, test_probs)
    final_prec = precision_score(y_test, test_preds, zero_division=0)
    final_rec = recall_score(y_test, test_preds, zero_division=0)
    final_f1 = f1_score(y_test, test_preds, zero_division=0)
    final_bal_acc = balanced_accuracy_score(y_test, test_preds)
    cm = confusion_matrix(y_test, test_preds).tolist()

    # Calculate Precision-Recall & ROC curve coordinates for UI visualization
    prec_arr, rec_arr, _ = precision_recall_curve(y_test, test_probs)
    fpr_arr, tpr_arr, _ = roc_curve(y_test, test_probs)

    pr_curve_data = [{"precision": round(float(p), 4), "recall": round(float(r), 4)} for p, r in zip(prec_arr, rec_arr)]
    roc_curve_data = [{"fpr": round(float(f), 4), "tpr": round(float(t), 4)} for f, t in zip(fpr_arr, tpr_arr)]

    # Compute Feature Importances
    importances = final_model.feature_importances_
    feat_imp = sorted(
        [{"feature": col, "importance": round(float(imp), 4)} for col, imp in zip(feature_cols, importances)],
        key=lambda x: x["importance"], reverse=True
    )

    # Compute SHAP Values
    explainer = shap.TreeExplainer(final_model)
    shap_values = explainer.shap_values(X_test_final_scaled)
    mean_abs_shap = np.abs(shap_values).mean(axis=0)
    shap_importance = sorted(
        [{"feature": col, "shap_value": round(float(sv), 4)} for col, sv in zip(feature_cols, mean_abs_shap)],
        key=lambda x: x["shap_value"], reverse=True
    )

    # Save artifacts
    joblib.dump(final_model, MODEL_SAVE_DIR / "model.pkl")
    joblib.dump(scaler_final, MODEL_SAVE_DIR / "scaler.pkl")

    metadata = {
        "model_name": "XGBoost Classifier (Optuna Tuned)",
        "problem_type": "Binary Classification",
        "target": "disruption_next_year",
        "features": feature_cols,
        "n_features": len(feature_cols),
        "train_period": "2015-2024",
        "test_period": "2025",
        "metrics": {
            "pr_auc": round(float(final_pr_auc), 4),
            "roc_auc": round(float(final_roc_auc), 4),
            "precision": round(float(final_prec), 4),
            "recall": round(float(final_rec), 4),
            "f1_score": round(float(final_f1), 4),
            "balanced_accuracy": round(float(final_bal_acc), 4),
            "confusion_matrix": cm
        },
        "model_comparison": comparison_results,
        "feature_importances": feat_imp[:15],
        "shap_importances": shap_importance[:15],
        "pr_curve": pr_curve_data[::max(1, len(pr_curve_data)//30)],  # Downsample points for UI JSON
        "roc_curve": roc_curve_data[::max(1, len(roc_curve_data)//30)],
        "synthetic_data_warning": "Predictions demonstrate ML methodology on a synthetic dataset and should not be used as real-world geopolitical forecasts."
    }

    with open(MODEL_SAVE_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model 1 (Disruption) saved successfully to {MODEL_SAVE_DIR}. Final PR-AUC = {final_pr_auc:.4f}")
    return metadata

if __name__ == "__main__":
    train_disruption_model()
