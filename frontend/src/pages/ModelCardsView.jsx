import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FileCode, ShieldAlert, Cpu, BarChart2, CheckCircle2, Info } from 'lucide-react';

export default function ModelCardsView() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.getModelMetrics();
        setMetrics(res);
      } catch (e) {
        console.error("Failed to load model metrics:", e);
      }
    }
    loadMetrics();
  }, []);

  if (!metrics) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        Loading ML Model Cards & Metrics...
      </div>
    );
  }

  const { disruption_model, risk_model, price_model, shock_model } = metrics;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111723] via-[#1A2234] to-[#111723] p-6 rounded-2xl border border-[#1E2D42]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Model Cards & Explainable AI Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive model comparison tables, temporal validation splits, SHAP feature attributions, and synthetic data warnings.
            </p>
          </div>
        </div>
      </div>

      {/* Synthetic Data Warning Banner */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider block text-amber-300 mb-0.5">Synthetic Data Methodology Disclaimer</span>
          Minzero is trained on a simulated synthetic critical minerals dataset (2015–2026). Predictions demonstrate machine-learning methodology, temporal panel cross-validation, and explainability frameworks. They must NOT be interpreted as factual real-world commodity price forecasts, government policy predictions, or actual geopolitical events.
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model 1 Card */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase">MODEL 1 • BINARY CLASSIFICATION</span>
              <h3 className="text-base font-bold text-white">Supply Disruption Prediction</h3>
            </div>
            <span className="badge-critical px-2.5 py-1 rounded text-xs font-mono">
              PR-AUC: {disruption_model.metrics?.pr_auc}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">PR-AUC</div>
              <div className="font-mono font-bold text-white text-sm">{disruption_model.metrics?.pr_auc}</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">ROC-AUC</div>
              <div className="font-mono font-bold text-white text-sm">{disruption_model.metrics?.roc_auc}</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">F1 Score</div>
              <div className="font-mono font-bold text-white text-sm">{disruption_model.metrics?.f1_score}</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Model Comparison (PR-AUC)</h4>
            <div className="space-y-1 text-xs">
              {disruption_model.model_comparison?.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-800/60">
                  <span className="text-slate-200">{m.model}</span>
                  <span className="font-mono text-cyan-400">{m.test_pr_auc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model 2 Card */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-amber-400 font-semibold uppercase">MODEL 2 • REGRESSION</span>
              <h3 className="text-base font-bold text-white">Supply Risk Prediction</h3>
            </div>
            <span className="badge-moderate px-2.5 py-1 rounded text-xs font-mono">
              R²: {risk_model.metrics?.r2_score}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">MAE Score</div>
              <div className="font-mono font-bold text-white text-sm">{risk_model.metrics?.mae}</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">RMSE</div>
              <div className="font-mono font-bold text-white text-sm">{risk_model.metrics?.rmse}</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">R² Score</div>
              <div className="font-mono font-bold text-white text-sm">{risk_model.metrics?.r2_score}</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Model Comparison (R²)</h4>
            <div className="space-y-1 text-xs">
              {risk_model.model_comparison?.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-800/60">
                  <span className="text-slate-200">{m.model}</span>
                  <span className="font-mono text-amber-400">{m.test_r2}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model 3 Card */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold uppercase">MODEL 3 • TIME-SERIES FORECASTING</span>
              <h3 className="text-base font-bold text-white">Mineral Price Forecast</h3>
            </div>
            <span className="badge-low px-2.5 py-1 rounded text-xs font-mono">
              MAPE: {price_model.metrics?.mape_pct}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">MAPE</div>
              <div className="font-mono font-bold text-white text-sm">{price_model.metrics?.mape_pct}%</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">MAE (USD)</div>
              <div className="font-mono font-bold text-white text-sm">${price_model.metrics?.mae?.toLocaleString()}</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">R² Score</div>
              <div className="font-mono font-bold text-white text-sm">{price_model.metrics?.r2_score}</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Model Comparison (MAPE)</h4>
            <div className="space-y-1 text-xs">
              {price_model.model_comparison?.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-800/60">
                  <span className="text-slate-200">{m.model}</span>
                  <span className="font-mono text-emerald-400">{m.test_mape}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model 4 Card */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[11px] font-mono text-purple-400 font-semibold uppercase">MODEL 4 • UNSUPERVISED ANOMALY DETECTION</span>
              <h3 className="text-base font-bold text-white">Supply Shock Detection</h3>
            </div>
            <span className="badge-critical px-2.5 py-1 rounded text-xs font-mono">
              Anomalies: {shock_model.anomaly_rate_pct}%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">Total Obs</div>
              <div className="font-mono font-bold text-white text-sm">{shock_model.total_observations}</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">Anomalies</div>
              <div className="font-mono font-bold text-white text-sm">{shock_model.anomalies_detected}</div>
            </div>
            <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
              <div className="text-slate-400 text-[10px]">Contamination</div>
              <div className="font-mono font-bold text-white text-sm">{shock_model.anomaly_rate_pct}%</div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Algorithm Comparison</h4>
            <div className="space-y-1 text-xs">
              {shock_model.model_comparison?.map((m, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900/40 p-2 rounded border border-slate-800/60">
                  <span className="text-slate-200">{m.model}</span>
                  <span className="font-mono text-purple-400">{m.anomaly_count} ({m.anomaly_rate}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
