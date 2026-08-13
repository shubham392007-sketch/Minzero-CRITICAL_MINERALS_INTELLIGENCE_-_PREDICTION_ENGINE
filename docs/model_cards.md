# Minzero Model Cards

## Synthetic Data Warning

> **IMPORTANT**: Minzero is trained on a synthetic dataset (2015–2026). Predictions demonstrate machine-learning methodology and should NOT be interpreted as real-world forecasts of mineral markets, government policies, geopolitical events, or actual supply disruptions.

---

## Model Card 1: Supply Disruption Predictor

* **Model Name**: XGBoost / LightGBM Classifier (Optuna Tuned)
* **Problem Type**: Binary Classification
* **Target Variable**: `disruption_next_year` (1 = Disruption next year, 0 = No disruption)
* **Training Period**: 2015–2023
* **Testing Period**: 2024–2025
* **Primary Metric**: PR-AUC (Precision-Recall Area Under Curve)
* **Evaluated Metrics**: PR-AUC = 0.0355, ROC-AUC = 0.6540, F1 Score = 0.0909
* **Features Used**: 37 engineered features (production concentration, export control exposure, price volatility, lag features)
* **Intended Use**: Evaluating machine learning methodology for predicting forward supply chain disruptions.

---

## Model Card 2: Supply Risk Engine

* **Model Name**: XGBoost Regressor (Optuna Tuned)
* **Problem Type**: Regression (0–100 score)
* **Target Variable**: `supply_risk_score`
* **Training Period**: 2015–2023
* **Testing Period**: 2024–2025
* **Evaluated Metrics**: MAE = 4.95, RMSE = 6.42, R² = 0.8981
* **Risk Categories**:
  * 0–30: Low
  * 30–50: Moderate
  * 50–70: Elevated
  * 70–85: High
  * 85–100: Critical
* **Intended Use**: Quantifying analytical supply risk score from structural supply chain variables.

---

## Model Card 3: Mineral Price Forecasting Engine

* **Model Name**: XGBoost Regressor (Optuna Tuned)
* **Problem Type**: One-Step-Ahead Time-Series Forecasting
* **Target Variable**: `price_next_year` (USD / tonne)
* **Training Period**: 2015–2023
* **Testing Period**: 2024–2025
* **Evaluated Metrics**: MAPE = 30.01%, MAE = $263,358, R² = 0.9858
* **Intended Use**: One-step-ahead commodity price trend forecasting.

---

## Model Card 4: Supply Shock Anomaly Detector

* **Model Name**: Isolation Forest Anomaly Detector
* **Problem Type**: Unsupervised Anomaly Detection
* **Contamination Rate**: 7.04% (109 detected anomalies across 1,548 observations)
* **Severity Levels**: Normal, Watch, Warning, Critical
* **Shock Types**: Price Shock, Production Shock, Demand Shock, Concentration Shock, Geopolitical Shock, Composite Supply Shock.
* **Intended Use**: Detecting statistical outliers and structural anomalies in mineral supply chain parameters.
