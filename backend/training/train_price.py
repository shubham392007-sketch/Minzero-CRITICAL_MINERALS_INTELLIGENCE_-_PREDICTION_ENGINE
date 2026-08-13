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
import shap
import optuna

from backend.app.config import MODELS_DIR, RANDOM_STATE, LEAKAGE_EXCLUSIONS
from backend.app.preprocessing.data_loader import load_all_data
from backend.app.preprocessing.feature_engineering import engineer_features

optuna.logging.set_verbosity(optuna.logging.WARNING)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODEL_SAVE_DIR = MODELS_DIR / "price"

def calculate_mape(y_true, y_pred):
    """Mean Absolute Percentage Error (MAPE)."""
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    nonzero_mask = y_true != 0
    return np.mean(np.abs((y_true[nonzero_mask] - y_pred[nonzero_mask]) / y_true[nonzero_mask])) * 100.0

def train_price_model():
    """Train, optimize, evaluate, and save Model 3 (Mineral Price Forecasting)."""
    logger.info("--- Starting Model 3: Mineral Price Prediction Training ---")
    MODEL_SAVE_DIR.mkdir(parents=True, exist_ok=True)

    master_df, _, _ = load_all_data()
    df = engineer_features(master_df)

    # Exclude rows where price_next_year target is NaN (2026 data)
    df_price = df[df["price_next_year"].notnull()].copy()

    # Features used to predict next year's price
    exclude_cols = [
        "price_next_year", "disruption_next_year", "disruption", "year",
        "mineral", "country", "end_use"
    ]
    feature_cols = [c for c in df_price.columns if c not in exclude_cols and not df_price[c].dtype == "object"]

    logger.info(f"Selected {len(feature_cols)} features for price forecasting.")

    # Chronological temporal split
    train_mask = (df_price["year"] <= 2022)
    val_mask = (df_price["year"] >= 2023) & (df_price["year"] <= 2024)
    test_mask = (df_price["year"] == 2025)

    X_train = df_price.loc[train_mask, feature_cols].copy()
    y_train = df_price.loc[train_mask, "price_next_year"].copy()

    X_val = df_price.loc[val_mask, feature_cols].copy()
    y_val = df_price.loc[val_mask, "price_next_year"].copy()

    X_test = df_price.loc[test_mask, feature_cols].copy()
    y_test = df_price.loc[test_mask, "price_next_year"].copy()

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_val_scaled = scaler.transform(X_val)
    X_test_scaled = scaler.transform(X_test)

    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest Regressor": RandomForestRegressor(random_state=RANDOM_STATE, n_estimators=150, max_depth=8),
        "XGBoost Regressor": XGBRegressor(random_state=RANDOM_STATE, n_estimators=150, max_depth=5),
        "LightGBM Regressor": LGBMRegressor(random_state=RANDOM_STATE, verbose=-1, n_estimators=150, max_depth=5)
    }

    comparison_results = []
    best_model_name = None
    best_mape = 999.0

    for name, model in candidate_models.items():
        model.fit(X_train_scaled, y_train)

        val_preds = model.predict(X_val_scaled)
        val_mae = mean_absolute_error(y_val, val_preds)
        val_rmse = np.sqrt(mean_squared_error(y_val, val_preds))
        val_mape = calculate_mape(y_val, val_preds)
        val_r2 = r2_score(y_val, val_preds)

        test_preds = model.predict(X_test_scaled)
        test_mae = mean_absolute_error(y_test, test_preds)
        test_rmse = np.sqrt(mean_squared_error(y_test, test_preds))
        test_mape = calculate_mape(y_test, test_preds)
        test_r2 = r2_score(y_test, test_preds)

        logger.info(f"Model: {name:<25} | Val MAPE: {val_mape:.2f}% | Test MAE: ${test_mae:.2f} | Test RMSE: ${test_rmse:.2f} | Test MAPE: {test_mape:.2f}% | Test R²: {test_r2:.4f}")

        comparison_results.append({
            "model": name,
            "val_mae": round(float(val_mae), 2),
            "val_rmse": round(float(val_rmse), 2),
            "val_mape": round(float(val_mape), 2),
            "val_r2": round(float(val_r2), 4),
            "test_mae": round(float(test_mae), 2),
            "test_rmse": round(float(test_rmse), 2),
            "test_mape": round(float(test_mape), 2),
            "test_r2": round(float(test_r2), 4)
        })

        if val_mape < best_mape:
            best_mape = val_mape
            best_model_name = name

    # Tune XGBoost Regressor for Price Forecasting
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
        return calculate_mape(y_val, preds)

    study = optuna.create_study(direction="minimize")
    study.optimize(objective, n_trials=15)
    logger.info(f"Optuna Best Trial Price MAPE: {study.best_value:.2f}%")

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
    final_mae = mean_absolute_error(y_test, test_preds)
    final_rmse = np.sqrt(mean_squared_error(y_test, test_preds))
    final_mape = calculate_mape(y_test, test_preds)
    final_r2 = r2_score(y_test, test_preds)

    # Feature Importance & SHAP
    importances = final_model.feature_importances_
    feat_imp = sorted(
        [{"feature": col, "importance": round(float(imp), 4)} for col, imp in zip(feature_cols, importances)],
        key=lambda x: x["importance"], reverse=True
    )

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
        "problem_type": "One-Step-Ahead Price Forecasting",
        "target": "price_next_year",
        "features": feature_cols,
        "n_features": len(feature_cols),
        "train_period": "2015-2024",
        "test_period": "2025",
        "metrics": {
            "mae": round(float(final_mae), 2),
            "rmse": round(float(final_rmse), 2),
            "mape_pct": round(float(final_mape), 2),
            "r2_score": round(float(final_r2), 4)
        },
        "model_comparison": comparison_results,
        "feature_importances": feat_imp[:15],
        "shap_importances": shap_importance[:15],
        "synthetic_data_warning": "Predictions demonstrate ML methodology on a synthetic dataset and should not be used as real-world commodity price forecasts."
    }

    with open(MODEL_SAVE_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model 3 (Price) saved successfully to {MODEL_SAVE_DIR}. Final MAPE = {final_mape:.2f}%, MAE = ${final_mae:.2f}")
    return metadata

if __name__ == "__main__":
    train_price_model()
