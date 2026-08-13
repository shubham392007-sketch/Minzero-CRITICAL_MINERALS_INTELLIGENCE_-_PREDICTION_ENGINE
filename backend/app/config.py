import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR_PRIMARY = BASE_DIR / "Critical Minerals & Rare Earths"
DATA_DIR_ALT = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

# Master dataset files
MASTER_CSV = "critical_minerals_supply_master.csv"
MINERALS_REF_CSV = "minerals_reference.csv"
DATA_DICT_CSV = "data_dictionary.csv"

# Global settings
RANDOM_STATE = 42
YEAR_MIN = 2015
YEAR_MAX = 2026

# Risk Category Thresholds (Configurable)
RISK_THRESHOLDS = {
    "Low": (0.0, 30.0),
    "Moderate": (30.0, 50.0),
    "Elevated": (50.0, 70.0),
    "High": (70.0, 85.0),
    "Critical": (85.0, 100.0)
}

# Column mappings
RAW_COLUMNS = [
    "year", "mineral", "country", "is_rare_earth", "end_use",
    "mine_production_tonnes", "production_share_pct", "reserves_tonnes",
    "years_of_reserves", "refined_share_pct", "price_usd_per_tonne",
    "demand_growth_pct", "export_control_active", "hhi",
    "top_country_share_pct", "supply_risk_score", "high_supply_risk",
    "disruption", "disruption_next_year"
]

# Feature Exclusions for Leakage Prevention
LEAKAGE_EXCLUSIONS = {
    "disruption": ["disruption", "supply_risk_score", "high_supply_risk", "disruption_next_year"],
    "risk": ["supply_risk_score", "high_supply_risk", "disruption_next_year", "disruption"],
    "price": ["price_next_year", "price_usd_per_tonne"],  # Current year price must be lagged for future prediction
    "shock": ["disruption", "disruption_next_year"]
}

def get_data_path(filename: str) -> Path:
    """Helper to locate data file from primary or alt location."""
    path1 = DATA_DIR_PRIMARY / filename
    if path1.exists():
        return path1
    path2 = DATA_DIR_ALT / filename
    if path2.exists():
        return path2
    # Default to primary
    return path1
