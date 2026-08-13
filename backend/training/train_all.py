import time
import logging
import json
from pathlib import Path

from backend.training.train_disruption import train_disruption_model
from backend.training.train_risk import train_risk_model
from backend.training.train_price import train_price_model
from backend.training.train_shock import train_shock_model

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def main():
    logger.info("==========================================================")
    logger.info("  MINZERO MASTER MODEL TRAINING & OPTIMIZATION PIPELINE   ")
    logger.info("==========================================================")

    start_time = time.time()

    # Train Model 1: Supply Disruption Prediction
    disruption_meta = train_disruption_model()

    # Train Model 2: Supply Risk Prediction
    risk_meta = train_risk_model()

    # Train Model 3: Mineral Price Prediction
    price_meta = train_price_model()

    # Train Model 4: Supply Shock Detection
    shock_meta = train_shock_model()

    elapsed = time.time() - start_time

    logger.info("==========================================================")
    logger.info("            TRAINING PIPELINE COMPLETE                    ")
    logger.info(f" Total Execution Time: {elapsed:.2f} seconds")
    logger.info("----------------------------------------------------------")
    logger.info(f" Model 1 (Disruption) PR-AUC : {disruption_meta['metrics']['pr_auc']:.4f}")
    logger.info(f" Model 2 (Supply Risk) R²    : {risk_meta['metrics']['r2_score']:.4f}")
    logger.info(f" Model 3 (Price) MAPE        : {price_meta['metrics']['mape_pct']:.2f}%")
    logger.info(f" Model 4 (Shock) Anomaly Rate: {shock_meta['anomaly_rate_pct']:.2f}%")
    logger.info("==========================================================")

if __name__ == "__main__":
    main()
