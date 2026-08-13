from typing import List, Dict, Any

class InsightService:
    """Deterministic AI insight generator synthesizing ML outputs into clear explanations."""

    @staticmethod
    def generate_disruption_insight(
        prob: float,
        risk_level: str,
        export_control: int,
        hhi: float,
        top_drivers: List[Dict[str, Any]]
    ) -> str:
        driver_names = [d.get("feature", "").replace("_", " ") for d in top_drivers[:2]]
        drivers_str = f" Driven primarily by {', '.join(driver_names)}." if driver_names else ""

        if prob >= 0.70:
            msg = f"Supply disruption probability is CRITICAL ({prob:.1%}) for this supply chain. High production concentration (HHI: {hhi:.2f})"
            if export_control == 1:
                msg += " combined with active export controls"
            msg += f" creates extreme vulnerability.{drivers_str}"
        elif prob >= 0.40:
            msg = f"Supply disruption probability is ELEVATED ({prob:.1%}). Elevated concentration and demand pressure raise supply disruption risks.{drivers_str}"
        elif prob >= 0.20:
            msg = f"Supply disruption probability is MODERATE ({prob:.1%}). Market conditions show mild vulnerability but remain manageable.{drivers_str}"
        else:
            msg = f"Supply disruption probability is LOW ({prob:.1%}). Production shares and historical stability suggest low risk of immediate disruption."
        return msg

    @staticmethod
    def generate_risk_insight(
        score: float,
        category: str,
        export_control: int,
        refining_share: float,
        years_of_reserves: float
    ) -> str:
        reasons = []
        if export_control == 1:
            reasons.append("active trade export restrictions")
        if refining_share >= 60.0:
            reasons.append(f"high refining concentration ({refining_share:.1f}%)")
        if years_of_reserves < 15.0:
            reasons.append(f"limited reserve coverage ({years_of_reserves:.1f} years)")

        reason_text = " due to " + ", ".join(reasons) if reasons else "."

        if score >= 70.0:
            return f"Analytical supply risk is rated {category.upper()} (score: {score:.1f}/100){reason_text} This supply chain requires strategic inventory buffer monitoring."
        elif score >= 50.0:
            return f"Analytical supply risk is rated {category.upper()} (score: {score:.1f}/100){reason_text} Key risk indicators warrant regular observation."
        else:
            return f"Analytical supply risk is rated {category.upper()} (score: {score:.1f}/100). Supply chain parameters exhibit healthy reserve coverage and diversified processing."

    @staticmethod
    def generate_price_insight(
        current_price: float,
        predicted_price: float,
        chg_pct: float,
        demand_growth: float
    ) -> str:
        direction = "upward" if chg_pct > 0 else "downward" if chg_pct < 0 else "stable"
        abs_chg = abs(chg_pct)

        if abs_chg >= 10.0:
            return f"One-step-ahead ML model forecasts a STRONG {direction.upper()} price movement of {chg_pct:+.1f}% (from ${current_price:,.0f} to ${predicted_price:,.0f}/tonne). Demand growth ({demand_growth:.1f}%) and production shifts are contributing to price volatility."
        elif abs_chg >= 3.0:
            return f"Price forecast indicates a MODERATE {direction} trend of {chg_pct:+.1f}% (target: ${predicted_price:,.0f}/tonne) aligned with prevailing demand dynamics ({demand_growth:.1f}%)."
        else:
            return f"Price model projects STABLE pricing ({chg_pct:+.1f}%, target: ${predicted_price:,.0f}/tonne) with balanced market supply and demand."

    @staticmethod
    def generate_shock_insight(
        is_anomaly: bool,
        severity: str,
        shock_type: str,
        drivers: List[str]
    ) -> str:
        if not is_anomaly:
            return "Supply chain behavior is consistent with historical patterns. No statistical supply shock detected."

        drivers_text = f" Main anomalous factors: {', '.join(drivers)}." if drivers else ""
        return f"CRITICAL ANOMALY DETECTED: Flagged as a {severity.upper()} level '{shock_type}'.{drivers_text} This represents abnormal structural movement relative to expected baseline behavior."
