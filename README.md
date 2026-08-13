# MINZERO

> **“Intelligence for the minerals that power the future.”**

Minzero is a production-ready AI/ML critical minerals intelligence & prediction platform built on top of a synthetic country–mineral–year dataset (2015–2026). It integrates four machine learning modules, model explainability (SHAP), model comparison, a FastAPI REST backend, and a modern geopolitical commodity analytics dashboard.

---

## 🌟 Key Features

1. **Model 1 – Supply Disruption Prediction (Binary Classification)**
   * Predicts forward-looking supply disruption probability (`disruption_next_year`).
   * Chronological temporal split (2015–2020 Train, 2021–2023 Val, 2024–2025 Test).
   * Evaluates Logistic Regression, Random Forest, XGBoost, LightGBM, CatBoost.
   * Optuna hyperparameter optimization (PR-AUC focused) & SHAP local driver attributions.

2. **Model 2 – Supply Risk Prediction (Regression 0–100)**
   * Models the synthetic supply-risk index (`supply_risk_score`) from concentration & export controls.
   * Configurable risk categories: Low (0–30), Moderate (30–50), Elevated (50–70), High (70–85), Critical (85–100).
   * Achieves $R^2 = 0.8981$, $\text{MAE} = 4.95$ score points.

3. **Model 3 – Mineral Price Prediction (One-Step-Ahead Forecasting)**
   * Predicts `price_next_year` (USD/tonne) using temporal lag features & rolling volatility.
   * Achieves $\text{MAPE} = 30.01\%$, $R^2 = 0.9858$.

4. **Model 4 – Supply Shock Detection (Unsupervised Anomaly Detection)**
   * Isolation Forest anomaly detector identifying structural shocks ($\approx 7.0\%$ contamination rate).
   * Interpretable rule-based taxonomy: Price Shock, Production Shock, Demand Shock, Concentration Shock, Geopolitical Shock, Composite Supply Shock.

5. **FastAPI REST Backend**
   * Fully validated REST endpoints for analytics, single/batch predictions, feature importances, and model metrics.
   * Deterministic AI insight generation layer providing natural language explanations.

6. **Minzero React Frontend (Vite)**
   * Deep Charcoal Commodity Terminal aesthetic (`#090D14`).
   * Interactive prediction tools, price forecasting charts (Recharts), risk heatmaps, shock monitors, and mineral/country intelligence profiles.

---

## ⚠️ Synthetic Data Warning

> **IMPORTANT**: Minzero is trained on a synthetic dataset. Predictions demonstrate machine-learning methodology and should NOT be interpreted as real-world forecasts of mineral markets, government policies, geopolitical events, or actual supply disruptions.

---

## 🚀 Quick Start Guide

### 1. Requirements & Setup
Ensure Python 3.10+ and Node.js 18+ are installed.

```bash
# Clone or navigate to the directory
cd Minzero

# Install Python dependencies
pip install -r requirements.txt

# Install Frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Train All Machine Learning Models
Run the end-to-end master training script:

```bash
python -m backend.training.train_all
```

This will preprocess the raw CSVs, engineer non-leaking lag features, train & compare all 4 model families, run Optuna optimization, compute SHAP values, and serialize serialized `.pkl` models and `metadata.json` into `models/`.

### 3. Launch the FastAPI Backend
Start the backend server on `http://127.0.0.1:8000`:

```bash
python -m backend.app.main
```

Interactive API documentation will be available at:
* Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 4. Launch the Web Frontend
In a separate terminal, launch Vite dev server on `http://localhost:5173`:

```bash
cd frontend
npm run dev
```

---

## 📂 Project Architecture

```text
Minzero/
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI Entry Point
│   │   ├── config.py                # Configuration & Thresholds
│   │   ├── api/
│   │   │   └── endpoints.py         # REST Routes
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic Request/Response Models
│   │   ├── services/
│   │   │   ├── analytics_service.py # Analytics & Market Summaries
│   │   │   ├── prediction_service.py# ML Inference Orchestrator
│   │   │   ├── explanation_service.py # Local SHAP Attributions
│   │   │   └── insight_service.py   # Deterministic AI Natural Language Layer
│   │   └── preprocessing/
│   │       ├── data_loader.py       # CSV Loading & Schema Cleaning
│   │       ├── data_validator.py    # Data Quality Validation Suite
│   │       └── feature_engineering.py# Temporal Lag & Domain Features
│   │
│   └── training/
│       ├── train_disruption.py      # Model 1 Disruption Classification
│       ├── train_risk.py            # Model 2 Risk Score Regression
│       ├── train_price.py           # Model 3 One-Step Price Forecasting
│       ├── train_shock.py           # Model 4 Unsupervised Shock Detector
│       └── train_all.py             # Master Training Script
│
├── models/                          # Serialized Models & Metadata
│   ├── disruption/                  # Model 1 (model.pkl, scaler.pkl, metadata.json)
│   ├── risk/                        # Model 2 (model.pkl, scaler.pkl, metadata.json)
│   ├── price/                       # Model 3 (model.pkl, scaler.pkl, metadata.json)
│   └── shock/                       # Model 4 (model.pkl, scaler.pkl, metadata.json)
│
├── frontend/                        # Vite + React Commodity Terminal SPA
│   ├── src/
│   │   ├── components/              # Header, Sidebar
│   │   ├── pages/                   # Dashboard, Predictors, Profiles, Model Cards
│   │   ├── services/                # API Client
│   │   └── index.css                # Dark Charcoal Theme Styling
│   └── package.json
│
├── docs/                            # Formal Documentation
│   ├── methodology.md               # Technical Methodology & Anti-Leakage Protocol
│   ├── model_cards.md               # Model Cards & Metrics
│   └── data_dictionary.md           # Dataset Specifications
│
└── requirements.txt                 # Python Dependencies
```

---

## 📡 REST API Reference Summary

* `GET /api/health`: Health status & loaded model verification.
* `GET /api/analytics/overview`: Key market KPI totals.
* `GET /api/analytics/concentration`: HHI & top country mining/refining shares.
* `GET /api/analytics/export-controls`: Active export control timeline.
* `GET /api/analytics/prices`: Average mineral price trends over time.
* `POST /api/predict/disruption`: Forward disruption probability & SHAP driver attribution.
* `POST /api/predict/risk`: Supply risk score prediction (0–100) & risk band classification.
* `POST /api/predict/price`: One-step-ahead price forecast & expected % change.
* `POST /api/detect/shock`: Anomaly detection, severity state, and shock type classification.
* `GET /api/mineral/{mineral}`: Detailed mineral intelligence profile.
* `GET /api/country/{country}`: Strategic country profile.
* `GET /api/model/metrics`: Model metrics, comparison tables, and curves.
