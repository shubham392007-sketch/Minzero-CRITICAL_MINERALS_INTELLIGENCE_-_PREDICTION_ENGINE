import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldCheck, Cpu, AlertCircle, Info, Search } from 'lucide-react';

export default function SupplyRiskView() {
  const [formData, setFormData] = useState({
    country: 'Congo (DRC)',
    mineral: 'Cobalt',
    year: 2025,
    mine_production_tonnes: 130000.0,
    production_share_pct: 70.0,
    reserves_tonnes: 4000000.0,
    years_of_reserves: 30.0,
    refined_share_pct: 75.0,
    price_usd_per_tonne: 32000.0,
    demand_growth_pct: 12.0,
    export_control_active: 1,
    hhi: 0.52,
    top_country_share_pct: 70.0
  });

  const [prediction, setPrediction] = useState(null);
  const [concentration, setConcentration] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const conc = await api.getConcentration();
        setConcentration(conc);
      } catch (e) {
        console.error("Failed to load concentration data:", e);
      }
    }
    loadData();
    handlePredict();
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.predictRisk(formData);
      setPrediction(res);
    } catch (err) {
      console.error("Risk prediction error:", err);
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
      {/* Header */}
      <div className="bg-gradient-to-r from-[#111723] via-[#1A2234] to-[#111723] p-6 rounded-2xl border border-[#1E2D42]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Model 2: Analytical Supply Risk Intelligence</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Regression model predicting the analytical supply risk score (0–100) from concentration, export controls, and refining exposure.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Score Predictor Form (5 Cols) */}
        <div className="lg:col-span-5 panel-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>Risk Simulation Parameters</span>
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
                  {['Cobalt', 'Dysprosium', 'Gallium', 'Germanium', 'Graphite', 'Lithium', 'Neodymium', 'Niobium', 'Terbium'].map(m => (
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
                  {['China', 'Congo (DRC)', 'Australia', 'Brazil', 'Chile', 'Russia', 'South Africa'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Production Share (%)</label>
                <input
                  type="number" step="1" value={formData.production_share_pct}
                  onChange={(e) => handleChange('production_share_pct', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Refined Share (%)</label>
                <input
                  type="number" step="1" value={formData.refined_share_pct}
                  onChange={(e) => handleChange('refined_share_pct', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Years of Reserves</label>
                <input
                  type="number" step="1" value={formData.years_of_reserves}
                  onChange={(e) => handleChange('years_of_reserves', e.target.value)}
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
                  <option value={0}>0 - No Restrictions</option>
                  <option value={1}>1 - Active Restrictions</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all shadow-lg shadow-amber-950 flex items-center justify-center space-x-2 mt-4"
            >
              <span>Calculate Supply Risk Score</span>
            </button>
          </form>
        </div>

        {/* Prediction Results & Explanation (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction && (
            <div className="panel-card p-6 border-l-4 border-l-amber-500 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">Predicted Supply Risk Score</span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="stat-value text-4xl text-amber-400">{prediction.predicted_supply_risk_score} / 100</span>
                    <span className="badge-high px-2.5 py-1 rounded text-xs font-bold font-mono">
                      {prediction.risk_category.toUpperCase()} RISK
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk Meter Bar */}
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, prediction.predicted_supply_risk_score))}%` }}
                />
              </div>

              {/* AI Insight */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{prediction.ai_insight}</p>
              </div>
            </div>
          )}

          {/* Ranked Risk Table */}
          <div className="panel-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mineral Concentration Rankings</h4>
            </div>

            <div className="overflow-x-auto max-h-64">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 bg-slate-900/60 uppercase font-semibold border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Mineral</th>
                    <th className="py-2 px-3">HHI Index</th>
                    <th className="py-2 px-3">Top Country Share</th>
                    <th className="py-2 px-3">Max Refined Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {concentration.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 font-semibold text-white">{item.mineral}</td>
                      <td className="py-2 px-3 font-mono text-cyan-400">{item.hhi}</td>
                      <td className="py-2 px-3 font-mono text-slate-300">{item.top_country_share_pct}%</td>
                      <td className="py-2 px-3 font-mono text-amber-400">{item.max_refined_share_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
