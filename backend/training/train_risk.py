import os
import json
import logging
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor
import shap
import optuna

from backend.app.config import MODELS_DIR, RANDOM_STATE, LEAKAGE_EXCLUSIONS, RISK_THRESHOLDS
from backend.app.preprocessing.data_loader import load_all_data
from backend.app.preprocessing.feature_engineering import engineer_features

optuna.logging.set_verbosity(optuna.logging.WARNING)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODEL_SAVE_DIR = MODELS_DIR / "risk"

def classify_risk_score(score: float) -> str:
    """Categorize numeric risk score into configurable risk bands."""
    for category, (low, high) in RISK_THRESHOLDS.items():
        if low <= score < high:
            return category
    if score >= 85.0:
        return "Critical"
    return "Low"

def train_risk_model():
    """Train, optimize, evaluate, and save Model 2 (Supply Risk Prediction)."""
    logger.info("--- Starting Model 2: Supply Risk Prediction Training ---")
    MODEL_SAVE_DIR.mkdir(parents=True, exist_ok=True)

    master_df, _, _ = load_all_data()
    df = engineer_features(master_df)

    # Exclude target & leakage columns
    exclude_cols = LEAKAGE_EXCLUSIONS["risk"] + [
        "year", "mineral", "country", "end_use", "price_next_year"
    ]
    feature_cols = [c for c in df.columns if c not in exclude_cols and not df[c].dtype == "object"]

    logger.info(f"Selected {len(feature_cols)} features for supply risk prediction.")

    # Chronological temporal split
    train_mask = (df["year"] <= 2022)
    val_mask = (df["year"] >= 2023) & (df["year"] <= 2024)
    test_mask = (df["year"] == 2025)

    X_train = df.loc[train_mask, feature_cols].copy()
    y_train = df.loc[train_mask, "supply_risk_score"].copy()

    X_val = df.loc[val_mask, feature_cols].copy()
    y_val = df.loc[val_mask, "supply_risk_score"].copy()

    X_test = df.loc[test_mask, feature_cols].copy()
    y_test = df.loc[test_mask, "supply_risk_score"].copy()

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest Regressor": RandomForestRegressor(random_state=RANDOM_STATE, n_estimators=150, max_depth=8),
        "XGBoost Regressor": XGBRegressor(random_state=RANDOM_STATE, n_estimators=150, max_depth=5),
        "LightGBM Regressor": LGBMRegressor(random_state=RANDOM_STATE, verbose=-1, n_estimators=150, max_depth=5),
        "CatBoost Regressor": CatBoostRegressor(random_state=RANDOM_STATE, verbose=0, iterations=150, depth=5)
    }

    comparison_results = []
    best_model_name = None
    best_r2 = -999.0

    for name, model in candidate_models.items():
        model.fit(X_train_scaled, y_train)

        val_preds = model.predict(X_val_scaled)
        val_mae = mean_absolute_error(y_val, val_preds)
        val_rmse = np.sqrt(mean_squared_error(y_val, val_preds))
        val_r2 = r2_score(y_val, val_preds)

        test_preds = model.predict(X_test_scaled)
        test_mae = mean_absolute_error(y_test, test_preds)
        test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))
        test_r2 = r2_score(y_test, test_preds)

        logger.info(f"Model: {name:<25} | Val R²: {val_r2:.4f} | Test MAE: {test_mae:.4f} | Test RMSE: {test_rmse:.4f} | Test R²: {test_r2:.4f}")

        comparison_results.append({
            "model": name,
            "val_mae": round(float(val_mae), 4),
            "val_rmse": round(float(val_rmse), 4),
            "val_r2": round(float(val_r2), 4),
            "test_mae": round(float(test_mae), 4),
            "test_rmse": round(float(test_rmse), 4),
            "test_r2": round(float(test_r2), 4)
        })

        if val_r2 > best_r2:
            best_r2 = val_r2
            best_model_name = name

    # Tune XGBoost Regressor with Optuna
    def objective(trial):
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 50, 300),
            "max_depth": trial.suggest_int("max_depth", 3, 10),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.2, log=True),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0)
        }
        tuned_xgb = XGBRegressor(**params, random_state=RANDOM_STATE)
        tuned_xgb.fit(X_train_scaled, y_train)
        preds = tuned_xgb.predict(X_val_scaled)
        return r2_score(y_val, preds)

    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=15)
    logger.info(f"Optuna Best Trial Risk R²: {study.best_value:.4f}")

    # Retrain on Train+Val, evaluate on Test
    X_train_val = pd.concat([X_train, X_val])
    y_train_val = pd.concat([y_train, y_val])

    scaler_final = StandardScaler()
    X_train_val_scaled = scaler_final.fit_transform(X_train_val)
    X_test_final_scaled = scaler_final.transform(X_test)

    final_params = study.best_params
    final_params["random_state"] = RANDOM_STATE

    final_model = XGBRegressor(**final_params)
    final_model.fit(X_train_val_scaled, y_train_val)

    test_preds = final_model.predict(X_test_final_scaled)
    # Clip risk score predictions to valid [0, 100] range
    test_preds_clipped = np.clip(test_preds, 0.0, 100.0)

    final_mae = mean_absolute_error(y_test, test_preds_clipped)
    final_rmse = np.sqrt(mean_squared_error(y_test, test_preds_clipped))
    final_r2 = r2_score(y_test, test_preds_clipped)

    # Feature Importance
    importances = final_model.feature_importances_
    feat_imp = sorted(
        [{"feature": col, "importance": round(float(imp), 4)} for col, imp in zip(feature_cols, importances)],
        key=lambda x: x["importance"], reverse=True
    )

    # SHAP Explainer
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
        "model_name": "XGBoost Regressor (Optuna Tuned)",
        "problem_type": "Regression",
        "target": "supply_risk_score",
        "features": feature_cols,
        "n_features": len(feature_cols),
        "train_period": "2015-2024",
        "test_period": "2025",
        "metrics": {
            "mae": round(float(final_mae), 4),
            "rmse": round(float(final_rmse), 4),
            "r2_score": round(float(final_r2), 4)
        },
        "model_comparison": comparison_results,
        "feature_importances": feat_imp[:15],
        "shap_importances": shap_importance[:15],
        "risk_thresholds": RISK_THRESHOLDS,
        "synthetic_data_warning": "Predictions demonstrate ML methodology on a synthetic dataset and should not be used as real-world geopolitical forecasts."
    }

    with open(MODEL_SAVE_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model 2 (Risk) saved successfully to {MODEL_SAVE_DIR}. Final R² = {final_r2:.4f}, MAE = {final_mae:.4f}")
    return metadata

if __name__ == "__main__":
    train_risk_model()
