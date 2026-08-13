import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List
from backend.app.config import YEAR_MIN, YEAR_MAX

logger = logging.getLogger(__name__)

class DataValidator:
    """Data validation suite for Minzero datasets."""

    def __init__(self, year_min: int = YEAR_MIN, year_max: int = YEAR_MAX):
        self.year_min = year_min
        self.year_max = year_max

    def validate(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Perform comprehensive data quality and validation checks."""
        report = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "is_valid": True,
            "issues": [],
            "warnings": [],
            "stats": {}
        }

        # 1. Check Uniqueness of (mineral, country, year)
        key_cols = ["mineral", "country", "year"]
        if all(c in df.columns for c in key_cols):
            duplicates = df.duplicated(subset=key_cols, keep=False)
            dup_count = duplicates.sum()
            report["stats"]["duplicate_key_rows"] = int(dup_count)
            if dup_count > 0:
                report["is_valid"] = False
                msg = f"Found {dup_count} duplicate rows for key combination (mineral, country, year)."
                report["issues"].append(msg)
                logger.error(msg)
            else:
                logger.info("Key uniqueness check passed: (mineral, country, year) is unique.")

        # 2. Year Range Check
        if "year" in df.columns:
            invalid_years = df[(df["year"] < self.year_min) | (df["year"] > self.year_max)]
            if len(invalid_years) > 0:
                report["is_valid"] = False
                msg = f"Found {len(invalid_years)} rows outside valid year range ({self.year_min}-{self.year_max})."
                report["issues"].append(msg)
                logger.error(msg)
            else:
                logger.info(f"Year range check passed: all years in {self.year_min}-{self.year_max}.")

        # 3. Missing Value Analysis
        null_counts = df.isnull().sum()
        null_report = null_counts[null_counts > 0].to_dict()
        report["stats"]["missing_values"] = {k: int(v) for k, v in null_report.items()}
        for col, count in null_report.items():
            if col == "disruption_next_year":
                # Expected missing for year 2026
                logger.info(f"Column '{col}' has {count} missing values (expected for latest year 2026).")
            else:
                report["warnings"].append(f"Column '{col}' has {count} missing values.")
                logger.warning(f"Column '{col}' has {count} missing values.")

        # 4. Invalid Value Range Checks
        if "mine_production_tonnes" in df.columns:
            neg_prod = (df["mine_production_tonnes"] < 0).sum()
            if neg_prod > 0:
                report["is_valid"] = False
                report["issues"].append(f"Found {neg_prod} negative mine production values.")

        if "price_usd_per_tonne" in df.columns:
            neg_price = (df["price_usd_per_tonne"] <= 0).sum()
            if neg_price > 0:
                report["is_valid"] = False
                report["issues"].append(f"Found {neg_price} non-positive price values.")

        # Percentage columns range check (0 to 100)
        pct_cols = ["production_share_pct", "refined_share_pct", "top_country_share_pct"]
        for col in pct_cols:
            if col in df.columns:
                invalid_pct = df[(df[col] < 0) | (df[col] > 100)][col]
                if len(invalid_pct) > 0:
                    report["warnings"].append(f"Column '{col}' has {len(invalid_pct)} values outside [0, 100]%.")

        # 5. Outlier Detection (IQR Method on numerical features)
        num_cols = df.select_dtypes(include=[np.number]).columns
        outlier_summary = {}
        for col in num_cols:
            if col in ["year", "is_rare_earth", "export_control_active", "high_supply_risk", "disruption", "disruption_next_year"]:
                continue
            q1 = df[col].quantile(0.25)
            q3 = df[col].quantile(0.75)
            iqr = q3 - q1
            lower_bound = q1 - 3.0 * iqr  # Using 3x IQR for extreme outliers
            upper_bound = q3 + 3.0 * iqr
            outliers = ((df[col] < lower_bound) | (df[col] > upper_bound)).sum()
            if outliers > 0:
                outlier_summary[col] = int(outliers)
        report["stats"]["extreme_outliers"] = outlier_summary

        # Summary Log
        status = "PASSED" if report["is_valid"] else "FAILED WITH ISSUES"
        logger.info(f"Data Validation Complete. Status: {status}. Total Rows: {len(df)}")
        return report

def validate_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    """Convenience function to run validation on a dataset."""
    validator = DataValidator()
    return validator.validate(df)
