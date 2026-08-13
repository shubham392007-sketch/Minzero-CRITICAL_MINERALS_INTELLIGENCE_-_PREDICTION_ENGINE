import logging
import pandas as pd
from pathlib import Path
from typing import Tuple, Dict, Any
from backend.app.config import get_data_path, MASTER_CSV, MINERALS_REF_CSV, DATA_DICT_CSV

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class DataLoader:
    """Reusable data loading module for Minzero datasets."""

    def __init__(self, master_filename: str = MASTER_CSV, ref_filename: str = MINERALS_REF_CSV, dict_filename: str = DATA_DICT_CSV):
        self.master_path = get_data_path(master_filename)
        self.ref_path = get_data_path(ref_filename)
        self.dict_path = get_data_path(dict_filename)

    def load_master_data(self) -> pd.DataFrame:
        """Load and perform initial schema cleaning on the master supply dataset."""
        logger.info(f"Loading master dataset from: {self.master_path}")
        if not self.master_path.exists():
            raise FileNotFoundError(f"Master dataset file not found at {self.master_path}")

        df = pd.read_csv(self.master_path)
        logger.info(f"Loaded raw dataset shape: {df.shape}")

        # Check and fix schema typos (e.g. 'ear' -> 'year')
        typo_mapping = {"ear": "year", "minera": "mineral", "countr": "country"}
        renamed = {}
        for col in df.columns:
            if col in typo_mapping:
                renamed[col] = typo_mapping[col]
        if renamed:
            logger.info(f"Corrected column typos: {renamed}")
            df.rename(columns=renamed, inplace=True)

        # Standardize column names (strip whitespace, lowercase)
        df.columns = [c.strip().lower() for c in df.columns]

        # Enforce basic numeric types
        numeric_cols = [
            "year", "is_rare_earth", "mine_production_tonnes", "production_share_pct",
            "reserves_tonnes", "years_of_reserves", "refined_share_pct",
            "price_usd_per_tonne", "demand_growth_pct", "export_control_active",
            "hhi", "top_country_share_pct", "supply_risk_score",
            "high_supply_risk", "disruption", "disruption_next_year"
        ]

        for col in numeric_cols:
            if col in df.columns:
                df[col] = pd.to_numeric(df[col], errors="coerce")

        logger.info("Successfully loaded and standardized master dataset.")
        return df

    def load_minerals_reference(self) -> pd.DataFrame:
        """Load minerals reference metadata."""
        logger.info(f"Loading minerals reference from: {self.ref_path}")
        if not self.ref_path.exists():
            logger.warning(f"Reference file not found at {self.ref_path}, returning empty DataFrame.")
            return pd.DataFrame()
        df = pd.read_csv(self.ref_path)
        df.columns = [c.strip().lower() for c in df.columns]
        return df

    def load_data_dictionary(self) -> pd.DataFrame:
        """Load data dictionary definition."""
        logger.info(f"Loading data dictionary from: {self.dict_path}")
        if not self.dict_path.exists():
            logger.warning(f"Data dictionary file not found at {self.dict_path}, returning empty DataFrame.")
            return pd.DataFrame()
        df = pd.read_csv(self.dict_path)
        df.columns = [c.strip().lower() for c in df.columns]
        return df

def load_all_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Convenience function to load all 3 datasets."""
    loader = DataLoader()
    master_df = loader.load_master_data()
    ref_df = loader.load_minerals_reference()
    dict_df = loader.load_data_dictionary()
    return master_df, ref_df, dict_df
