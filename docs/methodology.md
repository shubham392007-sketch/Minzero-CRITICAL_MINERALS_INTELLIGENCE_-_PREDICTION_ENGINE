# Minzero Technical Methodology & System Architecture

## 1. Overview
Minzero is an end-to-end critical minerals analytics and prediction system. It ingests simulated country-mineral-year data (2015–2026) covering 24 critical minerals / rare earths across 35 producing nations to train, evaluate, and deploy four independent machine learning models.

---

## 2. Feature Engineering & Anti-Leakage Protocol

### 2.1 Feature Definitions
To prevent future-data leakage in temporal panel models, all features are strictly computed using information available prior to or at time $t$:

* **Domain Ratios**:
  * `refining_dependency`: $\frac{\text{refined\_share\_pct}}{\text{production\_share\_pct} + 0.01}$
  * `export_control_exposure`: $\text{export\_control\_active} \times \frac{\text{top\_country\_share\_pct}}{100}$
  * `country_dominance`: $\frac{\text{production\_share\_pct}}{100} \times (1 + \text{export\_control\_active})$
  * `reserve_adequacy`: $\ln(1 + \max(0, \text{years\_of\_reserves}))$
* **Grouped Lag Features**:
  * $t-1$ and $t-2$ shifts for `price_usd_per_tonne`, `mine_production_tonnes`, `production_share_pct`, `demand_growth_pct`, `hhi`, `top_country_share_pct`, `export_control_active`.
* **Rolling Volatility**:
  * 3-year backward rolling mean & standard deviation for price and production.

### 2.2 Strict Leakage Rules
* **Disruption Model**: Excludes `disruption`, `supply_risk_score`, `high_supply_risk`, `disruption_next_year`.
* **Risk Model**: Excludes `high_supply_risk`, `disruption`, `disruption_next_year`.
* **Price Model**: Excludes current un-lagged price from direct forward prediction features.
* **Shock Model**: Unsupervised anomaly detection on scaled cross-sectional features without target labels.

---

## 3. Temporal Validation Strategy

Randomized K-Fold cross-validation causes severe data leakage in time-series panel data. Minzero uses strict chronological splits:

* **Training Set**: 2015–2020 (774 observations)
* **Validation Set**: 2021–2023 (387 observations)
* **Testing Set**: 2024–2025 (258 observations)
* **Inference Set**: 2026 (129 observations)

---

## 4. Machine Learning Algorithms & Optimization

1. **Model 1 (Disruption Prediction)**:
   * Classifiers: Logistic Regression, Random Forest, XGBoost, LightGBM, CatBoost.
   * Optuna hyperparameter optimization focused on PR-AUC.
   * Class imbalance handled via `scale_pos_weight` / balanced weighting inside training folds.
2. **Model 2 (Supply Risk Prediction)**:
   * Regressors: Linear Regression, Random Forest, XGBoost, LightGBM, CatBoost.
   * Evaluated via MAE, RMSE, R².
   * Configurable risk categories: Low (0-30), Moderate (30-50), Elevated (50-70), High (70-85), Critical (85-100).
3. **Model 3 (Mineral Price Prediction)**:
   * One-step-ahead price forecasting using XGBoost and Random Forest.
   * Evaluated via MAE, RMSE, MAPE, R².
4. **Model 4 (Supply Shock Detection)**:
   * Isolation Forest anomaly detector ($\approx 7\%$ contamination rate).
   * Rule-based shock taxonomy: Price Shock, Production Shock, Demand Shock, Concentration Shock, Geopolitical Shock, Composite Supply Shock.

---

## 5. Model Explainability (SHAP)

Global feature importance and local instance attributions are generated using `SHAP` (SHapley Additive exPlanations) TreeExplainer, identifying key drivers behind every individual prediction.
