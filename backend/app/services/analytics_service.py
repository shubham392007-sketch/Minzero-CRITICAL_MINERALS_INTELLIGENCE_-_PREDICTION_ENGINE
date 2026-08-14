import logging
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional

from backend.app.preprocessing.data_loader import load_all_data
from backend.app.preprocessing.feature_engineering import engineer_features
from backend.app.config import RISK_THRESHOLDS

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Provides analytical metrics, concentration calculations, risk mappings, and country/mineral profiles."""

    def __init__(self):
        self.master_df, self.ref_df, self.dict_df = load_all_data()
        self.df = engineer_features(self.master_df)

    def _normalize_country(self, country: str) -> str:
        c_low = country.lower().strip()
        alias_map = {
            "congo (drc)": "drc",
            "congo": "drc",
            "democratic republic of congo": "drc",
            "democratic republic of the congo": "drc",
            "south africa": "southafrica",
            "south korea": "southkorea",
            "new caledonia": "newcaledonia",
            "united states": "usa",
            "united states of america": "usa",
            "us": "usa"
        }
        return alias_map.get(c_low, c_low)

    def get_minerals_list(self) -> List[Dict[str, Any]]:
        """Return unique minerals list with metadata."""
        minerals = sorted(self.df["mineral"].unique().tolist())
        results = []
        for m in minerals:
            m_sub = self.df[self.df["mineral"] == m]
            is_re = int(m_sub["is_rare_earth"].iloc[0]) if "is_rare_earth" in m_sub.columns else 0
            end_use = str(m_sub["end_use"].iloc[0]) if "end_use" in m_sub.columns else "N/A"
            avg_risk = float(m_sub["supply_risk_score"].mean()) if "supply_risk_score" in m_sub.columns else 0.0
            results.append({
                "mineral": m,
                "is_rare_earth": is_re,
                "end_use": end_use,
                "avg_risk_score": round(avg_risk, 1)
            })
        return results

    def get_countries_list(self) -> List[Dict[str, Any]]:
        """Return unique countries list with mineral production counts."""
        countries = sorted(self.df["country"].unique().tolist())
        results = []
        for c in countries:
            c_sub = self.df[self.df["country"] == c]
            minerals_count = int(c_sub["mineral"].nunique())
            export_controls = int((c_sub["export_control_active"] == 1).sum())
            avg_risk = float(c_sub["supply_risk_score"].mean())
            results.append({
                "country": c,
                "minerals_produced_count": minerals_count,
                "active_export_controls_count": export_controls,
                "avg_risk_score": round(avg_risk, 1)
            })
        return results

    def get_years_list(self) -> List[int]:
        """Return available years range."""
        return sorted(self.df["year"].unique().tolist())

    def get_dataset_row(self, mineral: str, country: str, year: int = 2025) -> Dict[str, Any]:
        """Return raw/engineered features for a specific mineral-country-year observation."""
        c_norm = self._normalize_country(country)
        m_norm = mineral.lower().strip()

        # 1. Exact or normalized country match
        sub = self.df[
            (self.df["mineral"].str.lower() == m_norm) &
            (
                (self.df["country"].str.lower() == c_norm) |
                (self.df["country"].str.lower().str.contains(c_norm, regex=False))
            )
        ]

        # 2. Fallback to mineral average if specific country doesn't mine that mineral in dataset
        if sub.empty:
            sub = self.df[self.df["mineral"].str.lower() == m_norm]

        if sub.empty:
            return {"error": f"No data found for mineral '{mineral}'."}

        y_sub = sub[sub["year"] == year]
        row = y_sub.iloc[0] if not y_sub.empty else sub.iloc[-1]

        return {
            "mineral": row["mineral"],
            "country": country,
            "year": int(row["year"]),
            "mine_production_tonnes": round(float(row.get("mine_production_tonnes", 50000.0)), 1),
            "production_share_pct": round(float(row.get("production_share_pct", 40.0)), 1),
            "reserves_tonnes": round(float(row.get("reserves_tonnes", 1000000.0)), 1),
            "years_of_reserves": round(float(row.get("years_of_reserves", 20.0)), 1),
            "refined_share_pct": round(float(row.get("refined_share_pct", 65.0)), 1),
            "price_usd_per_tonne": round(float(row.get("price_usd_per_tonne", 15000.0)), 2),
            "demand_growth_pct": round(float(row.get("demand_growth_pct", 8.5)), 1),
            "export_control_active": int(row.get("export_control_active", 0)),
            "hhi": round(float(row.get("hhi", 0.45)), 4),
            "top_country_share_pct": round(float(row.get("top_country_share_pct", 55.0)), 1),
            "supply_risk_score": round(float(row.get("supply_risk_score", 50.0)), 1),
            "disruption": int(row.get("disruption", 0))
        }

    def get_overview(self) -> Dict[str, Any]:
        """Return high-level summary metrics for the main dashboard."""
        high_risk_count = int((self.df["supply_risk_score"] >= 70.0).sum())
        export_controls_count = int((self.df["export_control_active"] == 1).sum())
        disruptions_count = int((self.df["disruption"] == 1).sum())

        return {
            "total_observations": len(self.df),
            "total_minerals": self.df["mineral"].nunique(),
            "total_countries": self.df["country"].nunique(),
            "year_range": [int(self.df["year"].min()), int(self.df["year"].max())],
            "high_risk_supply_chains_count": high_risk_count,
            "active_export_controls_count": export_controls_count,
            "detected_shocks_count": disruptions_count
        }

    def get_concentration(self) -> List[Dict[str, Any]]:
        """Return market concentration metrics (HHI and top country share) by mineral."""
        grouped = self.df.groupby("mineral").agg({
            "hhi": "mean",
            "top_country_share_pct": "mean",
            "production_share_pct": "max",
            "refined_share_pct": "max",
            "is_rare_earth": "first"
        }).reset_index()

        results = []
        for _, row in grouped.iterrows():
            results.append({
                "mineral": row["mineral"],
                "hhi": round(float(row["hhi"]), 4),
                "top_country_share_pct": round(float(row["top_country_share_pct"]), 1),
                "max_mine_share_pct": round(float(row["production_share_pct"]), 1),
                "max_refined_share_pct": round(float(row["refined_share_pct"]), 1),
                "is_rare_earth": int(row["is_rare_earth"])
            })
        return sorted(results, key=lambda x: x["hhi"], reverse=True)

    def get_export_controls(self) -> List[Dict[str, Any]]:
        """Return active export control events timeline."""
        ec_df = self.df[self.df["export_control_active"] == 1].copy()
        results = []
        for _, row in ec_df.iterrows():
            results.append({
                "year": int(row["year"]),
                "mineral": row["mineral"],
                "country": row["country"],
                "production_share_pct": round(float(row["production_share_pct"]), 1),
                "price_usd_per_tonne": round(float(row["price_usd_per_tonne"]), 2),
                "supply_risk_score": round(float(row["supply_risk_score"]), 1)
            })
        return sorted(results, key=lambda x: (x["year"], x["mineral"]))

    def get_prices(self) -> List[Dict[str, Any]]:
        """Return average mineral price trends over time."""
        grouped = self.df.groupby(["year", "mineral"])["price_usd_per_tonne"].mean().reset_index()
        results = []
        for _, row in grouped.iterrows():
            results.append({
                "year": int(row["year"]),
                "mineral": row["mineral"],
                "avg_price_usd": round(float(row["price_usd_per_tonne"]), 2)
            })
        return results

    def get_mineral_profile(self, mineral: str) -> Dict[str, Any]:
        """Return detailed intelligence profile for a specific mineral."""
        m_df = self.df[self.df["mineral"].str.lower() == mineral.lower()].copy()
        if m_df.empty:
            return {"error": f"Mineral '{mineral}' not found."}

        latest_year = m_df["year"].max()
        latest_m = m_df[m_df["year"] == latest_year]

        country_breakdown = []
        for _, r in latest_m.iterrows():
            country_breakdown.append({
                "country": r["country"],
                "mine_production_tonnes": round(float(r["mine_production_tonnes"]), 1),
                "production_share_pct": round(float(r["production_share_pct"]), 1),
                "refined_share_pct": round(float(r["refined_share_pct"]), 1),
                "supply_risk_score": round(float(r["supply_risk_score"]), 1),
                "export_control_active": int(r["export_control_active"])
            })

        # Yearly price and production trends
        timeline = []
        for y, y_df in m_df.groupby("year"):
            timeline.append({
                "year": int(y),
                "total_production_tonnes": round(float(y_df["mine_production_tonnes"].sum()), 1),
                "avg_price_usd": round(float(y_df["price_usd_per_tonne"].mean()), 2),
                "avg_hhi": round(float(y_df["hhi"].mean()), 4),
                "avg_risk_score": round(float(y_df["supply_risk_score"].mean()), 1),
                "export_controls_count": int((y_df["export_control_active"] == 1).sum())
            })

        return {
            "mineral": m_df["mineral"].iloc[0],
            "is_rare_earth": int(m_df["is_rare_earth"].iloc[0]),
            "end_use": str(m_df["end_use"].iloc[0]),
            "latest_year": int(latest_year),
            "producers_count": m_df["country"].nunique(),
            "avg_hhi": round(float(latest_m["hhi"].mean()), 4),
            "top_country_share_pct": round(float(latest_m["top_country_share_pct"].mean()), 1),
            "country_breakdown": country_breakdown,
            "timeline": sorted(timeline, key=lambda x: x["year"])
        }

    def get_country_profile(self, country: str) -> Dict[str, Any]:
        """Return strategic intelligence profile for a specific country."""
        c_norm = self._normalize_country(country)
        c_df = self.df[
            (self.df["country"].str.lower() == c_norm) |
            (self.df["country"].str.lower().str.contains(c_norm, regex=False))
        ].copy()
        if c_df.empty:
            return {"error": f"Country '{country}' not found."}

        latest_year = c_df["year"].max()
        latest_c = c_df[c_df["year"] == latest_year]

        mineral_output = []
        for _, r in latest_c.iterrows():
            mineral_output.append({
                "mineral": r["mineral"],
                "production_share_pct": round(float(r["production_share_pct"]), 1),
                "refined_share_pct": round(float(r["refined_share_pct"]), 1),
                "export_control_active": int(r["export_control_active"]),
                "supply_risk_score": round(float(r["supply_risk_score"]), 1)
            })

        timeline = []
        for y, y_df in c_df.groupby("year"):
            timeline.append({
                "year": int(y),
                "minerals_produced": y_df["mineral"].nunique(),
                "export_controls_active": int((y_df["export_control_active"] == 1).sum()),
                "avg_risk_score": round(float(y_df["supply_risk_score"].mean()), 1)
            })

        return {
            "country": c_df["country"].iloc[0],
            "total_minerals_produced": c_df["mineral"].nunique(),
            "active_export_controls_count": int((latest_c["export_control_active"] == 1).sum()),
            "avg_supply_risk_score": round(float(latest_c["supply_risk_score"].mean()), 1),
            "mineral_output": mineral_output,
            "timeline": sorted(timeline, key=lambda x: x["year"])
        }
