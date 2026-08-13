import numpy as np
import pandas as pd
from typing import List, Dict, Any

class ExplanationService:
    """Computes local feature importance and attribution factors for individual predictions."""

    @staticmethod
    def get_local_feature_attributions(
        feature_names: List[str],
        feature_values: np.ndarray,
        feature_importances: List[Dict[str, float]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Calculate feature contribution factors based on feature importance and deviations."""
        importances_map = {item["feature"]: item.get("importance", item.get("shap_value", 0.01)) for item in feature_importances}

        factors = []
        for name, val in zip(feature_names, feature_values):
            imp = importances_map.get(name, 0.01)

            # Determine direction / impact label
            if val > 0:
                impact = "Increases Risk" if "control" in name or "hhi" in name or "volatility" in name else "Stabilizing Factor"
            else:
                impact = "Neutral"

            desc = f"{name.replace('_', ' ').title()} value of {val:.2f} (Importance: {imp:.3f})"

            factors.append({
                "feature": name,
                "impact": impact,
                "score": round(float(imp), 4),
                "description": desc
            })

        # Sort by importance score descending
        factors = sorted(factors, key=lambda x: x["score"], reverse=True)
        return factors[:top_k]
