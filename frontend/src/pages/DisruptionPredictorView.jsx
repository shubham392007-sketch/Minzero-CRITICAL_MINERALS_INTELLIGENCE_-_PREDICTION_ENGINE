import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  AlertTriangle, ShieldCheck, Cpu, BarChart2, Activity, Info, CheckCircle2 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';

export default function DisruptionPredictorView() {
  const [formData, setFormData] = useState({
    country: 'China',
    mineral: 'Lithium',
    year: 2025,
    mine_production_tonnes: 50000.0,
    production_share_pct: 40.0,
    reserves_tonnes: 1000000.0,
    years_of_reserves: 20.0,
    refined_share_pct: 65.0,
    price_usd_per_tonne: 15000.0,
    demand_growth_pct: 8.5,
    export_control_active: 1,
    hhi: 0.45,
    top_country_share_pct: 55.0
  });

  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.getModelMetrics();
        setMetrics(res.disruption_model);
      } catch (err) {
        console.error("Failed to load disruption metrics:", err);
      }
    }
    loadMetrics();
    // Run initial default prediction
    handlePredict();
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.predictDisruption(formData);
      setPrediction(res);
    } catch (err) {
      console.error("Disruption prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof val === 'number' ? val : (field.includes('year') || field.includes('active') ? parseInt(val) || 0 : parseFloat(val) || 0)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#111723] via-[#1A2234] to-[#111723] p-6 rounded-2xl border border-[#1E2D42]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Model 1: Supply Disruption Prediction Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Predict forward-looking probability of supply chain disruption next year using XGBoost / LightGBM with SHAP explainability.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form (5 Cols) */}
        <div className="lg:col-span-5 panel-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Scenario Input Features</span>
          </h3>

          <form onSubmit={handlePredict} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Mineral</label>
                <select
                  value={formData.mineral}
                  onChange={(e) => handleChange('mineral', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {['Antimony', 'Cobalt', 'Copper', 'Dysprosium', 'Gallium', 'Graphite', 'Lithium', 'Neodymium', 'Nickel', 'Niobium', 'Tantalum'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">Country</label>
                <select
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {['Australia', 'Chile', 'China', 'Congo (DRC)', 'Indonesia', 'South Africa', 'United States'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Production Share (%)</label>
                <input
                  type="number" step="0.1" value={formData.production_share_pct}
                  onChange={(e) => handleChange('production_share_pct', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Refined Share (%)</label>
                <input
                  type="number" step="0.1" value={formData.refined_share_pct}
                  onChange={(e) => handleChange('refined_share_pct', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Price (USD/tonne)</label>
                <input
                  type="number" step="100" value={formData.price_usd_per_tonne}
                  onChange={(e) => handleChange('price_usd_per_tonne', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Demand Growth (%)</label>
                <input
                  type="number" step="0.5" value={formData.demand_growth_pct}
                  onChange={(e) => handleChange('demand_growth_pct', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">HHI Concentration</label>
                <input
                  type="number" step="0.01" min="0" max="1" value={formData.hhi}
                  onChange={(e) => handleChange('hhi', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Export Control Active</label>
                <select
                  value={formData.export_control_active}
                  onChange={(e) => handleChange('export_control_active', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={0}>0 - Inactive</option>
                  <option value={1}>1 - Active Restrictions</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2 mt-4"
            >
              {loading ? (
                <span>Running Inference...</span>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Predict Disruption Next Year</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction Results & Explanation (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction && (
            <div className={`panel-card p-6 border-l-4 ${
              prediction.predicted_disruption === 1 ? 'border-l-rose-500 glow-border-rose' : 'border-l-emerald-500'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Disruption Probability</span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="stat-value text-4xl text-white">{prediction.disruption_probability_pct}</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                      prediction.risk_level === 'CRITICAL RISK' || prediction.risk_level === 'HIGH RISK' ? 'badge-critical' : 'badge-low'
                    }`}>
                      {prediction.risk_level}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Insight Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>{prediction.ai_insight}</p>
              </div>

              {/* Driver Factors */}
              <div className="mt-5 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Contributing Prediction Drivers (SHAP)</h4>
                <div className="space-y-1.5">
                  {prediction.top_contributing_features.map((driver, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-slate-900/40 p-2 rounded border border-slate-800/60">
                      <span className="font-medium text-slate-200">{driver.feature.replace('_', ' ').toUpperCase()}</span>
                      <span className="font-mono text-cyan-400 font-semibold">{driver.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Model Performance Panel */}
          {metrics && (
            <div className="panel-card p-5 space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Model 1 Metrics ({metrics.model_name})</span>
                <span className="text-emerald-400 font-mono">Test PR-AUC: {metrics.metrics?.pr_auc}</span>
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">PR-AUC</div>
                  <div className="font-mono font-bold text-white text-sm">{metrics.metrics?.pr_auc}</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">ROC-AUC</div>
                  <div className="font-mono font-bold text-white text-sm">{metrics.metrics?.roc_auc}</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Precision</div>
                  <div className="font-mono font-bold text-white text-sm">{metrics.metrics?.precision}</div>
                </div>
                <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Recall</div>
                  <div className="font-mono font-bold text-white text-sm">{metrics.metrics?.recall}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
