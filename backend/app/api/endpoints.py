import json
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List

from backend.app.schemas.schemas import (
    PredictionInputPayload, DisruptionPredictResponse, RiskPredictResponse,
    PricePredictResponse, ShockDetectResponse, HealthResponse
)
from backend.app.services.analytics_service import AnalyticsService
from backend.app.services.prediction_service import PredictionService
from backend.app.config import MODELS_DIR

logger = logging.getLogger(__name__)

router = APIRouter()

# Singletons initialized on startup
analytics_service = AnalyticsService()
prediction_service = PredictionService()

@router.get("/health", response_model=HealthResponse)
def health_check():
    loaded = {
        k: (v is not None) for k, v in prediction_service.models.items()
    }
    return HealthResponse(
        status="OK",
        version="1.0.0",
        models_loaded=loaded
    )

@router.get("/minerals")
def get_minerals():
    return analytics_service.get_minerals_list()

@router.get("/countries")
def get_countries():
    return analytics_service.get_countries_list()

@router.get("/years")
def get_years():
    return analytics_service.get_years_list()

@router.get("/mineral/{mineral}")
def get_mineral_profile(mineral: str):
    profile = analytics_service.get_mineral_profile(mineral)
    if "error" in profile:
        raise HTTPException(status_code=404, detail=profile["error"])
    return profile

@router.get("/country/{country}")
def get_country_profile(country: str):
    profile = analytics_service.get_country_profile(country)
    if "error" in profile:
        raise HTTPException(status_code=404, detail=profile["error"])
    return profile

# Prediction Endpoints
@router.post("/predict/disruption", response_model=DisruptionPredictResponse)
def predict_disruption(payload: PredictionInputPayload):
    try:
        return prediction_service.predict_disruption(payload)
    except Exception as e:
        logger.error(f"Error in disruption prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/risk", response_model=RiskPredictResponse)
def predict_risk(payload: PredictionInputPayload):
    try:
        return prediction_service.predict_risk(payload)
    except Exception as e:
        logger.error(f"Error in risk prediction: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/predict/price", response_model=PricePredictResponse)
def predict_price(payload: PredictionInputPayload):
    try:
        return prediction_service.predict_price(payload)
    except Exception as e:
        logger.error(f"Error in price forecasting: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect/shock", response_model=ShockDetectResponse)
def detect_shock(payload: PredictionInputPayload):
    try:
        return prediction_service.detect_shock(payload)
    except Exception as e:
        logger.error(f"Error in shock detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Model Metadata & Comparison Endpoints
@router.get("/model/metrics")
def get_model_metrics():
    return {
        "disruption_model": prediction_service.metadata.get("disruption", {}),
        "risk_model": prediction_service.metadata.get("risk", {}),
        "price_model": prediction_service.metadata.get("price", {}),
        "shock_model": prediction_service.metadata.get("shock", {})
    }

@router.get("/model/features")
def get_model_features():
    return {
        "disruption_features": prediction_service.metadata.get("disruption", {}).get("features", []),
        "risk_features": prediction_service.metadata.get("risk", {}).get("features", []),
        "price_features": prediction_service.metadata.get("price", {}).get("features", []),
        "shock_features": prediction_service.metadata.get("shock", {}).get("features", [])
    }

# Analytics Endpoints
@router.get("/analytics/overview")
def get_analytics_overview():
    return analytics_service.get_overview()

@router.get("/analytics/concentration")
def get_analytics_concentration():
    return analytics_service.get_concentration()

@router.get("/analytics/export-controls")
def get_analytics_export_controls():
    return analytics_service.get_export_controls()

@router.get("/analytics/prices")
def get_analytics_prices():
    return analytics_service.get_prices()
