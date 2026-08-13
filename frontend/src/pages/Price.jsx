import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, ArrowUpRight, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Price({ onNavigate }) {
  const [formData, setFormData] = useState({
    country: 'Australia',
    mineral: 'Lithium',
    year: 2025,
    mine_production_tonnes: 80000.0,
    production_share_pct: 45.0,
    reserves_tonnes: 5000000.0,
    years_of_reserves: 35.0,
    refined_share_pct: 10.0,
    price_usd_per_tonne: 12420.0,
    demand_growth_pct: 10.4,
    export_control_active: 0,
    hhi: 0.38,
    top_country_share_pct: 45.0
  });

  const [prediction, setPrediction] = useState({
    current_price: 12420,
    predicted_next_year_price: 14180,
    expected_price_change_pct: 14.2,
    forecast_direction: 'INCREASING'
  });
  const [loading, setLoading] = useState(false);

  const chartData = [
    { year: '2015', price: 8200 },
    { year: '2016', price: 9100 },
    { year: '2017', price: 11400 },
    { year: '2018', price: 14200 },
    { year: '2019', price: 10800 },
    { year: '2020', price: 9500 },
    { year: '2021', price: 15400 },
    { year: '2022', price: 28500 },
    { year: '2023', price: 19200 },
    { year: '2024', price: 13800 },
    { year: '2025', price: 12420 },
    { year: '2026', price: 14180 },
  ];

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
    setFormData(prev => {
      let parsedVal = val;
      if (field === 'mineral' || field === 'country') {
        parsedVal = String(val);
      } else if (field === 'year' || field === 'export_control_active') {
        parsedVal = parseInt(val, 10) || 0;
      } else {
        parsedVal = parseFloat(val) || 0;
      }
      return { ...prev, [field]: parsedVal };
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Back Nav */}
      <button 
        onClick={() => onNavigate('/')}
        className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-[#111111]/70 hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK</span>
      </button>

      {/* Hero & Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-[#111111] leading-none">
            MINERAL PRICE FORECAST
          </h1>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
            ONE-STEP-AHEAD PRICE FORECASTING ENGINE
          </p>
        </div>

        <form onSubmit={handlePredict} className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-[#111111]/20">
            <span className="text-[#111111]/60 font-bold">MINERAL:</span>
            <select 
              value={formData.mineral} 
              onChange={(e) => handleChange('mineral', e.target.value)}
              className="bg-transparent font-bold text-[#111111]"
            >
              {['Lithium', 'Copper', 'Cobalt', 'Nickel', 'Antimony'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-[#111111]/20">
            <span className="text-[#111111]/60 font-bold">COUNTRY:</span>
            <select 
              value={formData.country} 
              onChange={(e) => handleChange('country', e.target.value)}
              className="bg-transparent font-bold text-[#111111]"
            >
              {['Australia', 'Chile', 'China', 'Indonesia'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border border-[#111111]/20">
            <span className="text-[#111111]/60 font-bold">HORIZON:</span>
            <span className="font-bold text-[#111111]">Next Year</span>
          </div>

          <button type="submit" className="px-3 py-1 bg-[#111111] text-white rounded font-bold hover:bg-[#FF2AA1]">
            {loading ? '...' : 'FORECAST'}
          </button>
        </form>
      </div>

      {/* Main Grid matching middle-left reference panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Price History Line Chart (White, 7 Cols) */}
        <div className="md:col-span-7 physical-card p-6 bg-white border border-[#111111]/20 space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60">
            PRICE HISTORY (USD / TONNE)
          </span>

          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111111" strokeOpacity={0.1} />
                <XAxis dataKey="year" stroke="#111111" fontSize={10} fontStyle="bold" />
                <YAxis stroke="#111111" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#111723', borderColor: '#1E2D42', color: '#F8FAFC', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="price" stroke="#111111" strokeWidth={3} dot={{ r: 4, fill: '#111111' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast Card (Sky Blue, 5 Cols) */}
        <div className="md:col-span-5 physical-card p-6 bg-[#4FC3F7] border border-[#111111]/20 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
              FORECAST (NEXT YEAR)
            </span>

            <div className="mt-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60 block">CURRENT PRICE</span>
              <span className="font-mono text-3xl font-bold text-[#111111]">${prediction.current_price.toLocaleString()}</span>
            </div>

            <div className="mt-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60 block">FORECAST PRICE</span>
              <span className="font-mono text-4xl font-bold text-[#111111]">${prediction.predicted_next_year_price.toLocaleString()}</span>
            </div>

            <div className="mt-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60 block">EXPECTED CHANGE</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-3xl font-bold text-[#111111]">
                  +{prediction.expected_price_change_pct}%
                </span>
                <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111] mt-4 block">
            {prediction.forecast_direction || 'INCREASING'}
          </span>
        </div>

        {/* Market Indicators (Chartreuse, 12 Cols) */}
        <div className="md:col-span-12 physical-card p-5 bg-[#E4FF5B] border border-[#111111]/20">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111] mb-3">
            MARKET INDICATORS
          </h4>
          <div className="grid grid-cols-3 gap-4 text-xs font-mono font-bold text-[#111111]">
            <div className="bg-white/70 p-3 rounded border border-[#111111]/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#111111]/60 block">PRICE VOLATILITY</span>
                <span className="text-base font-bold text-[#FF2AA1]">High</span>
              </div>
              <svg className="w-12 h-5 text-[#111111]" viewBox="0 0 50 15"><path d="M0 10 Q12 0, 25 12 T50 2" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
            </div>
            <div className="bg-white/70 p-3 rounded border border-[#111111]/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#111111]/60 block">DEMAND GROWTH</span>
                <span className="text-base font-bold">+10.4%</span>
              </div>
              <svg className="w-12 h-5 text-[#111111]" viewBox="0 0 50 15"><path d="M0 12 L15 10 L30 5 L50 2" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
            </div>
            <div className="bg-white/70 p-3 rounded border border-[#111111]/15 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#111111]/60 block">PROD. CHANGE</span>
                <span className="text-base font-bold text-[#111111]">-6.2%</span>
              </div>
              <svg className="w-12 h-5 text-[#111111]" viewBox="0 0 50 15"><path d="M0 2 L25 8 L50 14" stroke="currentColor" fill="none" strokeWidth="2"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
