import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Zap, Cpu, AlertTriangle, ShieldAlert, CheckCircle2, Info } from 'lucide-react';

export default function SupplyShockView() {
  const [formData, setFormData] = useState({
    country: 'China',
    mineral: 'Graphite',
    year: 2025,
    mine_production_tonnes: 600000.0,
    production_share_pct: 65.0,
    reserves_tonnes: 15000000.0,
    years_of_reserves: 25.0,
    refined_share_pct: 85.0,
    price_usd_per_tonne: 3500.0,
    demand_growth_pct: 22.0,
    export_control_active: 1,
    hhi: 0.58,
    top_country_share_pct: 65.0
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleDetect();
  }, []);

  const handleDetect = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.detectShock(formData);
      setPrediction(res);
    } catch (err) {
      console.error("Shock detection error:", err);
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
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Model 4: Unsupervised Supply Shock Detection</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Isolation Forest anomaly detector identifying abnormal supply chain behavior and structural shocks.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Scenario Controls (5 Cols) */}
        <div className="lg:col-span-5 panel-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>Shock Detection Inputs</span>
          </h3>

          <form onSubmit={handleDetect} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Mineral</label>
                <select
                  value={formData.mineral}
                  onChange={(e) => handleChange('mineral', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {['Graphite', 'Gallium', 'Germanium', 'Antimony', 'Dysprosium', 'Lithium'].map(m => (
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
                  {['China', 'Congo (DRC)', 'Australia', 'South Africa', 'United States'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Demand Growth (%)</label>
                <input
                  type="number" step="1" value={formData.demand_growth_pct}
                  onChange={(e) => handleChange('demand_growth_pct', e.target.value)}
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
                  <option value={0}>0 - No</option>
                  <option value={1}>1 - Export Restrictions Onset</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all shadow-lg shadow-purple-950 flex items-center justify-center space-x-2 mt-4"
            >
              <span>Scan for Supply Shock</span>
            </button>
          </form>
        </div>

        {/* Results & Severity Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction && (
            <div className={`panel-card p-6 border-l-4 ${
              prediction.is_anomaly ? 'border-l-purple-500 glow-border-rose' : 'border-l-emerald-500'
            } space-y-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Anomaly Scan Result</span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="stat-value text-3xl text-white">
                      {prediction.is_anomaly ? 'SHOCK DETECTED' : 'NORMAL OPERATIONS'}
                    </span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                      prediction.shock_severity === 'Critical' || prediction.shock_severity === 'Warning' ? 'badge-critical' : 'badge-low'
                    }`}>
                      {prediction.shock_severity.toUpperCase()} SEVERITY
                    </span>
                  </div>
                </div>
              </div>

              {/* Shock Category */}
              <div className="flex items-center space-x-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400">Classified Shock Type:</span>
                <span className="font-semibold text-purple-400 font-mono">{prediction.shock_type}</span>
                <span className="text-slate-500 font-mono ml-auto">Score: {prediction.anomaly_score}</span>
              </div>

              {/* AI Insight */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <p>{prediction.ai_insight}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
