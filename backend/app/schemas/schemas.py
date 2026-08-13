from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class HealthResponse(BaseModel):
    status: str
    version: str
    models_loaded: Dict[str, bool]

class PredictionInputPayload(BaseModel):
    country: str = Field(..., example="China")
    mineral: str = Field(..., example="Lithium")
    year: int = Field(2025, example=2025)
    mine_production_tonnes: float = Field(..., example=50000.0)
    production_share_pct: float = Field(..., example=40.0)
    reserves_tonnes: float = Field(..., example=1000000.0)
    years_of_reserves: float = Field(..., example=20.0)
    refined_share_pct: float = Field(..., example=65.0)
    price_usd_per_tonne: float = Field(..., example=15000.0)
    demand_growth_pct: float = Field(..., example=8.5)
    export_control_active: int = Field(0, example=1)
    hhi: float = Field(..., example=0.45)
    top_country_share_pct: float = Field(..., example=55.0)

class DriverFactor(BaseModel):
    feature: str
    impact: str  # "Increases Risk" / "Decreases Risk" / "Neutral"
    score: float
    description: str

# Model 1 Response
class DisruptionPredictResponse(BaseModel):
    country: str
    mineral: str
    year: int
    disruption_probability: float
    disruption_probability_pct: str
    predicted_disruption: int
    risk_level: str  # "LOW", "MODERATE", "ELEVATED", "HIGH RISK", "CRITICAL RISK"
    top_contributing_features: List[DriverFactor]
    ai_insight: str
    synthetic_data_warning: str

# Model 2 Response
class RiskPredictResponse(BaseModel):
    country: str
    mineral: str
    year: int
    predicted_supply_risk_score: float
    risk_category: str  # "Low", "Moderate", "Elevated", "High", "Critical"
    top_risk_drivers: List[DriverFactor]
    ai_insight: str
    synthetic_data_warning: str

# Model 3 Response
class PricePredictResponse(BaseModel):
    country: str
    mineral: str
    year: int
    current_price: float
    predicted_next_year_price: float
    expected_price_change_pct: float
    forecast_direction: str  # "Increasing", "Decreasing", "Stable"
    ai_insight: str
    synthetic_data_warning: str

# Model 4 Response
class ShockDetectResponse(BaseModel):
    country: str
    mineral: str
    year: int
    anomaly_score: float
    is_anomaly: bool
    shock_severity: str  # "Normal", "Watch", "Warning", "Critical"
    shock_type: str  # "Price Shock", "Production Shock", etc.
    main_drivers: List[str]
    ai_insight: str
    synthetic_data_warning: str

class AnalyticsOverviewResponse(BaseModel):
    total_observations: int
    total_minerals: int
    total_countries: int
    year_range: List[int]
    high_risk_supply_chains_count: int
    active_export_controls_count: int
    detected_shocks_count: int

class ModelMetricsResponse(BaseModel):
    disruption_model: Dict[str, Any]
    risk_model: Dict[str, Any]
    price_model: Dict[str, Any]
    shock_model: Dict[str, Any]
