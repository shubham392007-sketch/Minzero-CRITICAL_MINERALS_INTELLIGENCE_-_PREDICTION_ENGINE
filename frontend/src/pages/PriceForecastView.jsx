import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TrendingUp, Cpu, Info, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function PriceForecastView() {
  const [formData, setFormData] = useState({
    country: 'Australia',
    mineral: 'Lithium',
    year: 2025,
    mine_production_tonnes: 80000.0,
    production_share_pct: 45.0,
    reserves_tonnes: 5000000.0,
    years_of_reserves: 35.0,
    refined_share_pct: 10.0,
    price_usd_per_tonne: 22000.0,
    demand_growth_pct: 14.5,
    export_control_active: 0,
    hhi: 0.38,
    top_country_share_pct: 45.0
  });

  const [prediction, setPrediction] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadPrices() {
      try {
        const pr = await api.getPrices();
        setPriceHistory(pr);
      } catch (e) {
        console.error("Failed to load price history:", e);
      }
    }
    loadPrices();
    handlePredict();
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.predictPrice(formData);
      setPrediction(res);
    } catch (err) {
      console.error("Price prediction error:", err);
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

  // Filter historical price trend for selected mineral
  const mineralPrices = priceHistory.filter(
    p => p.mineral.toLowerCase() === formData.mineral.toLowerCase()
  );

  const chartData = [
    ...mineralPrices.map(p => ({ year: p.year, price: p.avg_price_usd, type: 'Historical' })),
  ];
  if (prediction) {
    chartData.push({
      year: 2026,
      price: prediction.predicted_next_year_price,
      type: 'ML Forecast'
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#111723] via-[#1A2234] to-[#111723] p-6 rounded-2xl border border-[#1E2D42]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Model 3: Mineral Price Forecasting Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              One-step-ahead ML price forecasting (USD/tonne) using lag features and expanding-window temporal validation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Forecast Controls (5 Cols) */}
        <div className="lg:col-span-5 panel-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Forecast Scenario Controls</span>
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
                  {['Antimony', 'Copper', 'Lithium', 'Nickel', 'Palladium', 'Platinum', 'Tin'].map(m => (
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
                  {['Australia', 'Chile', 'China', 'Indonesia', 'South Africa', 'United States'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">Current Price (USD/t)</label>
                <input
                  type="number" step="500" value={formData.price_usd_per_tonne}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-all shadow-lg shadow-cyan-950 flex items-center justify-center space-x-2 mt-4"
            >
              <span>Forecast Price Next Year</span>
            </button>
          </form>
        </div>

        {/* Prediction Results & Line Chart (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction && (
            <div className="panel-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">One-Step-Ahead Price Forecast (2026)</span>
                  <div className="flex items-baseline space-x-3 mt-1">
                    <span className="stat-value text-4xl text-white">
                      ${prediction.predicted_next_year_price.toLocaleString()} / tonne
                    </span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono flex items-center space-x-1 ${
                      prediction.expected_price_change_pct > 0 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}>
                      {prediction.expected_price_change_pct > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      <span>{prediction.expected_price_change_pct > 0 ? '+' : ''}{prediction.expected_price_change_pct}%</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Insight Box */}
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>{prediction.ai_insight}</p>
              </div>
            </div>
          )}

          {/* Historical vs Forecast Price Line Chart */}
          <div className="panel-card p-5 space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {formData.mineral} Historical Prices & ML 2026 Forecast
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111723', borderColor: '#1E2D42', color: '#F8FAFC', borderRadius: '8px' }}
                    formatter={(val) => [`$${val.toLocaleString()}`, 'Price USD/tonne']}
                  />
                  <Line type="monotone" dataKey="price" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4, fill: '#38BDF8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
