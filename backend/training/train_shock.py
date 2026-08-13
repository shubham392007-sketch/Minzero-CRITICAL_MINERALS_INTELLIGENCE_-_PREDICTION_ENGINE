import os
import json
import logging
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM

from backend.app.config import MODELS_DIR, RANDOM_STATE
from backend.app.preprocessing.data_loader import load_all_data
from backend.app.preprocessing.feature_engineering import engineer_features

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MODEL_SAVE_DIR = MODELS_DIR / "shock"

SHOCK_FEATURES = [
    "price_change_pct", "production_growth_pct", "demand_growth_pct",
    "production_share_pct", "refined_share_pct", "hhi",
    "top_country_share_pct", "export_control_active", "years_of_reserves",
    "price_volatility", "export_control_exposure"
]

def classify_shock_type(row: pd.Series) -> str:
    """Rule-based shock taxonomy to categorize detected anomalies."""
    reasons = []

    price_chg = abs(row.get("price_change_pct", 0))
    prod_chg = abs(row.get("production_growth_pct", 0))
    demand_chg = abs(row.get("demand_growth_pct", 0))
    export_ctl = row.get("export_control_active", 0)
    hhi_val = row.get("hhi", 0)

    if price_chg >= 20.0:
        reasons.append("Price Shock")
    if prod_chg >= 25.0:
        reasons.append("Production Shock")
    if demand_chg >= 15.0:
        reasons.append("Demand Shock")
    if export_ctl == 1:
        reasons.append("Geopolitical Shock")
    if hhi_val >= 0.5:
        reasons.append("Concentration Shock")

    if not reasons:
        return "Composite Supply Shock"
    if len(reasons) == 1:
        return reasons[0]
    return "Composite Supply Shock (" + " + ".join(reasons[:2]) + ")"

def classify_severity(score: float, is_anomaly: bool) -> str:
    """Classify anomaly score into severity bands: Normal, Watch, Warning, Critical."""
    if not is_anomaly:
        return "Normal"
    # score is raw decision function or negative anomaly score from IsolationForest
    # Lower/more negative score indicates higher degree of abnormality
    if score < -0.15:
        return "Critical"
    elif score < -0.08:
        return "Warning"
    else:
        return "Watch"

def train_shock_model():
    """Train, evaluate, and save Model 4 (Supply Shock Anomaly Detector)."""
    logger.info("--- Starting Model 4: Supply Shock Detection Training ---")
    MODEL_SAVE_DIR.mkdir(parents=True, exist_ok=True)

    master_df, _, _ = load_all_data()
    df = engineer_features(master_df)

    feature_cols = [c for c in SHOCK_FEATURES if c in df.columns]
    logger.info(f"Using {len(feature_cols)} features for unsupervised shock detection.")

    X = df[feature_cols].fillna(0).copy()

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Primary Model: Isolation Forest
    contamination_rate = 0.07  # ~7% expected anomaly rate
    iso_forest = IsolationForest(
        contamination=contamination_rate,
        random_state=RANDOM_STATE,
        n_estimators=200
    )
    iso_forest.fit(X_scaled)

    # Alternate Models for Comparison
    lof = LocalOutlierFactor(n_neighbors=20, contamination=contamination_rate, novelty=True)
    lof.fit(X_scaled)

    oc_svm = OneClassSVM(nu=contamination_rate, kernel="rbf", gamma="scale")
    oc_svm.fit(X_scaled)

    # Evaluation on full dataset
    scores = iso_forest.score_samples(X_scaled)  # Negative anomaly score
    preds = iso_forest.predict(X_scaled)  # -1 for anomaly, 1 for normal
    is_anomaly = (preds == -1)

    df["anomaly_score"] = scores
    df["is_anomaly"] = is_anomaly

    anomalies_detected = is_anomaly.sum()
    anomaly_rate = float(anomalies_detected) / len(df)

    logger.info(f"Isolation Forest Detected {anomalies_detected} anomalies ({anomaly_rate:.2%} of total dataset)")

    # Model comparison metrics
    lof_preds = lof.predict(X_scaled)
    svm_preds = oc_svm.predict(X_scaled)

    comparison_results = [
        {"model": "Isolation Forest", "anomaly_count": int(anomalies_detected), "anomaly_rate": round(anomaly_rate * 100, 2)},
        {"model": "Local Outlier Factor", "anomaly_count": int((lof_preds == -1).sum()), "anomaly_rate": round(float((lof_preds == -1).sum()) / len(df) * 100, 2)},
        {"model": "One-Class SVM", "anomaly_count": int((svm_preds == -1).sum()), "anomaly_rate": round(float((svm_preds == -1).sum()) / len(df) * 100, 2)}
    ]

    # Save artifacts
    joblib.dump(iso_forest, MODEL_SAVE_DIR / "model.pkl")
    joblib.dump(scaler, MODEL_SAVE_DIR / "scaler.pkl")

    metadata = {
        "model_name": "Isolation Forest Anomaly Detector",
        "problem_type": "Unsupervised Anomaly Detection",
        "features": feature_cols,
        "n_features": len(feature_cols),
        "contamination": contamination_rate,
        "total_observations": len(df),
        "anomalies_detected": int(anomalies_detected),
        "anomaly_rate_pct": round(anomaly_rate * 100, 2),
        "model_comparison": comparison_results,
        "severity_bands": ["Normal", "Watch", "Warning", "Critical"],
        "shock_types": ["Price Shock", "Production Shock", "Demand Shock", "Concentration Shock", "Geopolitical Shock", "Composite Supply Shock"],
        "synthetic_data_warning": "Detected anomalies represent mathematical outliers in a synthetic dataset, not real-world historical supply chain events."
    }

    with open(MODEL_SAVE_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model 4 (Shock Detection) saved successfully to {MODEL_SAVE_DIR}.")
    return metadata

if __name__ == "__main__":
    train_shock_model()
