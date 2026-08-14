import json
import logging
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Tuple

from backend.app.config import MODELS_DIR, RISK_THRESHOLDS
from backend.app.schemas.schemas import (
    PredictionInputPayload, DisruptionPredictResponse, RiskPredictResponse,
    PricePredictResponse, ShockDetectResponse, DriverFactor
)
from backend.app.preprocessing.data_loader import load_all_data
from backend.app.preprocessing.feature_engineering import FeatureEngineer
from backend.app.services.insight_service import InsightService
from backend.app.services.explanation_service import ExplanationService

logger = logging.getLogger(__name__)

SYNTHETIC_WARNING = "Predictions demonstrate ML methodology on a synthetic dataset and should not be used as real-world geopolitical or commodity forecasts."

class PredictionService:
    """Orchestrates machine learning model loading and inference across the 4 Minzero modules."""

    def __init__(self, models_base_dir: Path = MODELS_DIR):
        self.base_dir = models_base_dir
        self.feature_engineer = FeatureEngineer()

        try:
            self.master_df, _, _ = load_all_data()
        except Exception as e:
            logger.warning(f"Could not load master dataset for baseline lookup: {e}")
            self.master_df = None

        self.models = {}
        self.scalers = {}
        self.metadata = {}

        self.load_all_models()

    def load_model_group(self, group: str):
        group_dir = self.base_dir / group
        model_path = group_dir / "model.pkl"
        scaler_path = group_dir / "scaler.pkl"
        meta_path = group_dir / "metadata.json"

        if model_path.exists() and meta_path.exists():
            self.models[group] = joblib.load(model_path)
            self.scalers[group] = joblib.load(scaler_path) if scaler_path.exists() else None
            with open(meta_path, "r") as f:
                self.metadata[group] = json.load(f)
            logger.info(f"Successfully loaded Model '{group}' ({self.metadata[group].get('model_name')}).")
        else:
            logger.warning(f"Model group '{group}' files not found at {group_dir}.")

    def load_all_models(self):
        for group in ["disruption", "risk", "price", "shock"]:
            self.load_model_group(group)

    def _prepare_features(self, payload: PredictionInputPayload, group: str) -> Tuple[pd.DataFrame, np.ndarray, List[str]]:
        """Convert payload to engineered DataFrame matching training features."""
        data_dict = payload.model_dump()

        # Populate baseline dataset values if available and not explicitly overridden
        if self.master_df is not None and not self.master_df.empty:
            match = self.master_df[
                (self.master_df["mineral"].str.lower() == payload.mineral.lower()) &
                (self.master_df["country"].str.lower() == payload.country.lower())
            ]
            if not match.empty:
                year_match = match[match["year"] == payload.year]
                base_row = year_match.iloc[0] if not year_match.empty else match.iloc[-1]
                fields_set = payload.model_fields_set
                for col, val in base_row.items():
                    if col in data_dict and col not in fields_set:
                        data_dict[col] = val

        df_single = pd.DataFrame([data_dict])

        # Engineer features
        df_engineered = self.feature_engineer.transform(df_single)

        meta = self.metadata.get(group, {})
        required_features = meta.get("features", [])

        # Ensure all required feature columns exist
        for col in required_features:
            if col not in df_engineered.columns:
                df_engineered[col] = 0.0

        X = df_engineered[required_features].fillna(0.0).copy()

        # Clean inf values
        num_cols = X.select_dtypes(include=[np.number]).columns
        for c in num_cols:
            X[c] = X[c].replace([np.inf, -np.inf], np.nan).fillna(0.0)

        scaler = self.scalers.get(group)
        if scaler is not None:
            X_scaled = scaler.transform(X)
        else:
            X_scaled = X.values

        return X, X_scaled, required_features

    def predict_disruption(self, payload: PredictionInputPayload) -> DisruptionPredictResponse:
        model = self.models.get("disruption")
        if not model:
            raise RuntimeError("Disruption prediction model is not loaded.")

        X_raw, X_scaled, feature_cols = self._prepare_features(payload, "disruption")
        prob = float(model.predict_proba(X_scaled)[0, 1])
        pred_class = int(prob >= 0.5)

        if prob >= 0.75:
            risk_level = "CRITICAL RISK"
        elif prob >= 0.50:
            risk_level = "HIGH RISK"
        elif prob >= 0.25:
            risk_level = "ELEVATED"
        else:
            risk_level = "LOW RISK"

        meta = self.metadata.get("disruption", {})
        top_importances = meta.get("feature_importances", [])
        factors_raw = ExplanationService.get_local_feature_attributions(
            feature_cols, X_raw.values[0], top_importances, top_k=4
        )
        drivers = [DriverFactor(**f) for f in factors_raw]

        insight = InsightService.generate_disruption_insight(
            prob, risk_level, payload.export_control_active or 0, payload.hhi or 0.5, factors_raw
        )

        return DisruptionPredictResponse(
            country=payload.country,
            mineral=payload.mineral,
            year=payload.year,
            disruption_probability=round(prob, 4),
            disruption_probability_pct=f"{prob * 100.0:.1f}%",
            predicted_disruption=pred_class,
            risk_level=risk_level,
            top_contributing_features=drivers,
            ai_insight=insight,
            synthetic_data_warning=SYNTHETIC_WARNING
        )

    def predict_risk(self, payload: PredictionInputPayload) -> RiskPredictResponse:
        model = self.models.get("risk")
        if not model:
            raise RuntimeError("Supply risk prediction model is not loaded.")

        X_raw, X_scaled, feature_cols = self._prepare_features(payload, "risk")
        score = float(model.predict(X_scaled)[0])
        score_clipped = float(np.clip(score, 0.0, 100.0))

        # Categorize
        category = "Low"
        for cat, (low, high) in RISK_THRESHOLDS.items():
            if low <= score_clipped < high:
                category = cat
                break
        if score_clipped >= 85.0:
            category = "Critical"

        meta = self.metadata.get("risk", {})
        top_importances = meta.get("feature_importances", [])
        factors_raw = ExplanationService.get_local_feature_attributions(
            feature_cols, X_raw.values[0], top_importances, top_k=4
        )
        drivers = [DriverFactor(**f) for f in factors_raw]

        insight = InsightService.generate_risk_insight(
            score_clipped, category, payload.export_control_active or 0,
            payload.refined_share_pct or 50.0, payload.years_of_reserves or 20.0
        )

        return RiskPredictResponse(
            country=payload.country,
            mineral=payload.mineral,
            year=payload.year,
            predicted_supply_risk_score=round(score_clipped, 2),
            risk_category=category,
            top_risk_drivers=drivers,
            ai_insight=insight,
            synthetic_data_warning=SYNTHETIC_WARNING
        )

    def predict_price(self, payload: PredictionInputPayload) -> PricePredictResponse:
        model = self.models.get("price")
        if not model:
            raise RuntimeError("Price prediction model is not loaded.")

        X_raw, X_scaled, feature_cols = self._prepare_features(payload, "price")
        pred_price = float(model.predict(X_scaled)[0])
        curr_price = float(payload.price_usd_per_tonne or 15000.0)

        chg_pct = ((pred_price - curr_price) / curr_price) * 100.0 if curr_price > 0 else 0.0

        if chg_pct > 2.0:
            direction = "Increasing"
        elif chg_pct < -2.0:
            direction = "Decreasing"
        else:
            direction = "Stable"

        insight = InsightService.generate_price_insight(
            curr_price, pred_price, chg_pct, payload.demand_growth_pct or 10.0
        )

        return PricePredictResponse(
            country=payload.country,
            mineral=payload.mineral,
            year=payload.year,
            current_price=round(curr_price, 2),
            predicted_next_year_price=round(pred_price, 2),
            expected_price_change_pct=round(chg_pct, 2),
            forecast_direction=direction,
            ai_insight=insight,
            synthetic_data_warning=SYNTHETIC_WARNING
        )

    def detect_shock(self, payload: PredictionInputPayload) -> ShockDetectResponse:
        model = self.models.get("shock")
        if not model:
            raise RuntimeError("Supply shock detection model is not loaded.")

        X_raw, X_scaled, feature_cols = self._prepare_features(payload, "shock")
        score = float(model.score_samples(X_scaled)[0])
        pred = int(model.predict(X_scaled)[0])
        is_anomaly = (pred == -1)

        if not is_anomaly:
            severity = "Normal"
        elif score < -0.15:
            severity = "Critical"
        elif score < -0.08:
            severity = "Warning"
        else:
            severity = "Watch"

        # Shock Type & Drivers
        drivers = []
        p_price = payload.price_usd_per_tonne or 15000.0
        p_hhi = payload.hhi or 0.5
        p_ec = payload.export_control_active or 0

        if abs(p_price) > 0:
            drivers.append(f"Price: ${p_price:,.0f}/t")
        if p_ec == 1:
            drivers.append("Active Export Restrictions")
        if p_hhi >= 0.4:
            drivers.append(f"High HHI Concentration ({p_hhi:.2f})")

        from backend.training.train_shock import classify_shock_type
        row_series = pd.Series(payload.model_dump())
        shock_type = classify_shock_type(row_series) if is_anomaly else "Baseline Operations"

        insight = InsightService.generate_shock_insight(
            is_anomaly, severity, shock_type, drivers
        )

        return ShockDetectResponse(
            country=payload.country,
            mineral=payload.mineral,
            year=payload.year,
            anomaly_score=round(score, 4),
            is_anomaly=is_anomaly,
            shock_severity=severity,
            shock_type=shock_type,
            main_drivers=drivers,
            ai_insight=insight,
            synthetic_data_warning=SYNTHETIC_WARNING
        )
