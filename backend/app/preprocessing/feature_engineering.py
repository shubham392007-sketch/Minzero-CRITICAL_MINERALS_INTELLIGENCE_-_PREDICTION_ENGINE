import logging
import pandas as pd
import numpy as np
from typing import List, Tuple, Dict, Any

logger = logging.getLogger(__name__)

class FeatureEngineer:
    """Feature engineering pipeline for Minzero critical minerals dataset."""

    def __init__(self):
        pass

    def add_domain_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create domain-specific cross-sectional features for each observation."""
        df = df.copy()

        # Reserve adequacy (log transform for stability)
        if "years_of_reserves" in df.columns:
            df["reserve_adequacy"] = np.log1p(np.maximum(df["years_of_reserves"], 0))

        # Refining dependency (refining share vs mining production share)
        if "refined_share_pct" in df.columns and "production_share_pct" in df.columns:
            df["refining_dependency"] = df["refined_share_pct"] / (df["production_share_pct"] + 0.01)

        # Export control exposure
        if "export_control_active" in df.columns and "top_country_share_pct" in df.columns:
            df["export_control_exposure"] = df["export_control_active"] * (df["top_country_share_pct"] / 100.0)

        # Country dominance index
        if "production_share_pct" in df.columns and "export_control_active" in df.columns:
            df["country_dominance"] = (df["production_share_pct"] / 100.0) * (1.0 + df["export_control_active"])

        # Production concentration index
        if "hhi" in df.columns and "top_country_share_pct" in df.columns:
            df["production_concentration"] = df["hhi"] * (df["top_country_share_pct"] / 100.0)

        # Supply dependency (refining exposure combined with concentration)
        if "refining_dependency" in df.columns and "hhi" in df.columns:
            df["supply_dependency"] = df["refining_dependency"] * df["hhi"]

        return df

    def add_temporal_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create temporal lag and rolling features grouped by (mineral, country)."""
        df = df.copy()

        # Sort chronologically by mineral, country, and year
        df = df.sort_values(by=["mineral", "country", "year"]).reset_index(drop=True)

        group_cols = ["mineral", "country"]

        # 1. Year-over-year raw changes and percentage changes
        df["year_over_year_production_change"] = df.groupby(group_cols)["mine_production_tonnes"].diff()
        df["production_growth_pct"] = df.groupby(group_cols)["mine_production_tonnes"].pct_change() * 100.0

        df["year_over_year_price_change"] = df.groupby(group_cols)["price_usd_per_tonne"].diff()
        df["price_change_pct"] = df.groupby(group_cols)["price_usd_per_tonne"].pct_change() * 100.0

        # Demand pressure (demand growth relative to production growth)
        if "demand_growth_pct" in df.columns:
            df["demand_pressure"] = df["demand_growth_pct"] - df["production_growth_pct"].fillna(0)

        # 2. Lag Features (Shifted by 1 and 2 years)
        lags_to_create = [
            ("price_usd_per_tonne", 1, "price_lag_1"),
            ("price_usd_per_tonne", 2, "price_lag_2"),
            ("mine_production_tonnes", 1, "production_lag_1"),
            ("mine_production_tonnes", 2, "production_lag_2"),
            ("production_share_pct", 1, "production_share_lag_1"),
            ("demand_growth_pct", 1, "demand_growth_lag_1"),
            ("hhi", 1, "hhi_lag_1"),
            ("top_country_share_pct", 1, "top_country_share_lag_1"),
            ("export_control_active", 1, "export_control_lag_1"),
            ("price_change_pct", 1, "price_growth_lag_1")
        ]

        for source_col, lag, new_col in lags_to_create:
            if source_col in df.columns:
                df[new_col] = df.groupby(group_cols)[source_col].shift(lag)

        # 3. Rolling Features (Using expanding or rolling window strictly backwards)
        df["price_rolling_mean"] = df.groupby(group_cols)["price_usd_per_tonne"].transform(
            lambda x: x.shift(1).rolling(window=3, min_periods=1).mean()
        )
        df["price_rolling_std"] = df.groupby(group_cols)["price_usd_per_tonne"].transform(
            lambda x: x.shift(1).rolling(window=3, min_periods=1).std()
        ).fillna(0)
        df["price_volatility"] = df["price_rolling_std"] / (df["price_rolling_mean"] + 1.0)

        df["production_rolling_mean"] = df.groupby(group_cols)["mine_production_tonnes"].transform(
            lambda x: x.shift(1).rolling(window=3, min_periods=1).mean()
        )
        df["production_rolling_std"] = df.groupby(group_cols)["mine_production_tonnes"].transform(
            lambda x: x.shift(1).rolling(window=3, min_periods=1).std()
        ).fillna(0)

        # Create price_next_year target for price model
        df["price_next_year"] = df.groupby(group_cols)["price_usd_per_tonne"].shift(-1)

        # Fill initial lag NaNs with sensible defaults or forward/backward fill within group
        fill_cols = [
            "production_growth_pct", "price_change_pct", "price_lag_1", "price_lag_2",
            "production_lag_1", "production_lag_2", "production_share_lag_1",
            "demand_growth_lag_1", "hhi_lag_1", "top_country_share_lag_1",
            "export_control_lag_1", "price_growth_lag_1", "year_over_year_production_change",
            "year_over_year_price_change", "demand_pressure", "price_volatility",
            "reserve_adequacy", "refining_dependency", "export_control_exposure",
            "country_dominance", "production_concentration", "supply_dependency",
            "price_rolling_mean", "price_rolling_std", "production_rolling_mean", "production_rolling_std"
        ]

        for col in fill_cols:
            if col in df.columns:
                df[col] = df.groupby(group_cols)[col].bfill().ffill().fillna(0)

        # Replace any residual inf/-inf and NaN with 0.0 across all numerical columns
        num_cols = df.select_dtypes(include=[np.number]).columns
        for c in num_cols:
            if c not in ["disruption_next_year", "price_next_year"]:  # Preserve target NaNs for splitting
                df[c] = df[c].replace([np.inf, -np.inf], np.nan).fillna(0.0)

        logger.info("Successfully engineered temporal lag and domain features cleanly (no NaNs in features).")
        return df

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Run complete feature engineering pipeline."""
        df = self.add_domain_features(df)
        df = self.add_temporal_features(df)
        return df

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Convenience function to run feature engineering."""
    fe = FeatureEngineer()
    return fe.transform(df)
