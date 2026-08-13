import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Info, Activity } from 'lucide-react';

export default function Disruption({ onNavigate }) {
  const [formData, setFormData] = useState({
    country: 'Congo (DRC)',
    mineral: 'Cobalt',
    year: 2025,
    mine_production_tonnes: 130000.0,
    production_share_pct: 70.0,
    reserves_tonnes: 4000000.0,
    years_of_reserves: 11.2,
    refined_share_pct: 75.0,
    price_usd_per_tonne: 32000.0,
    demand_growth_pct: 12.0,
    export_control_active: 1,
    hhi: 0.68,
    top_country_share_pct: 70.0
  });

  const [prediction, setPrediction] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await api.getModelMetrics();
        setMetrics(res.disruption_model);
      } catch (e) {
        console.error("Disruption metrics error:", e);
      }
    }
    loadMetrics();
    handlePredict();
  }, []);

  const handlePredict = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const res = await api.predictDisruption(formData);
      setPrediction(res);
    } catch (err) {
      console.error("Prediction error:", err);
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
      {/* Top Back Nav */}
      <button 
        onClick={() => onNavigate('/')}
        className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-[#111111]/70 hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK</span>
      </button>

      {/* Hero Title */}
      <div>
        <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-[#111111] leading-none">
          DISRUPTION PREDICTION
        </h1>
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
          NEXT-YEAR SUPPLY DISRUPTION PROBABILITY
        </p>
      </div>

      {/* Selector Bar */}
      <form onSubmit={handlePredict} className="flex flex-wrap items-center gap-3 text-xs font-mono bg-white p-3.5 rounded-xl border border-[#111111]/20 shadow-xs">
        <div className="flex items-center space-x-2">
          <label className="font-bold text-[#111111]">MINERAL</label>
          <select 
            value={formData.mineral} 
            onChange={(e) => handleChange('mineral', e.target.value)}
            className="bg-[#EDECE7] border border-[#111111]/30 rounded px-2.5 py-1 text-[#111111] font-bold"
          >
            {['Cobalt', 'Lithium', 'Antimony', 'Dysprosium', 'Gallium', 'Graphite', 'Nickel'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="font-bold text-[#111111]">COUNTRY</label>
          <select 
            value={formData.country} 
            onChange={(e) => handleChange('country', e.target.value)}
            className="bg-[#EDECE7] border border-[#111111]/30 rounded px-2.5 py-1 text-[#111111] font-bold"
          >
            {['Congo (DRC)', 'China', 'Australia', 'Chile', 'Indonesia', 'South Africa'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="font-bold text-[#111111]">YEAR</label>
          <select 
            value={formData.year} 
            onChange={(e) => handleChange('year', e.target.value)}
            className="bg-[#EDECE7] border border-[#111111]/30 rounded px-2.5 py-1 text-[#111111] font-bold"
          >
            {[2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="ml-auto px-4 py-1.5 rounded-lg bg-[#111111] text-white font-bold hover:bg-[#FF2AA1] transition-all shadow-md"
        >
          {loading ? 'RUNNING...' : 'RUN MODEL'}
        </button>
      </form>

      {/* Main Grid matching reference image top-middle panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-Left: Probability Card (White) */}
        <div className="physical-card p-6 bg-white border border-[#111111]/20 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60">
              DISRUPTION PROBABILITY
            </span>
            <div className="font-mono text-6xl font-bold tracking-tighter text-[#111111] mt-2">
              {prediction ? prediction.disruption_probability_pct : '78.4%'}
            </div>
            <div className="mt-2">
              <span className="badge-editorial-critical px-2.5 py-1 rounded text-xs font-mono font-bold">
                {prediction ? prediction.risk_level : 'HIGH RISK'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#111111]/70 mt-3">
              Predicted disruption probability next year
            </p>
          </div>

          {/* Probability Progress Line */}
          <div className="w-full bg-[#EDECE7] h-2 rounded-full overflow-hidden mt-6 border border-[#111111]/20">
            <div 
              className="bg-[#FF2AA1] h-full transition-all duration-500" 
              style={{ width: prediction ? `${prediction.disruption_probability * 100}%` : '78.4%' }} 
            />
          </div>
        </div>

        {/* Top-Right: What Moved The Model? (Sky Blue) */}
        <div className="physical-card p-6 bg-[#4FC3F7] border border-[#111111]/20 space-y-4">
          <h3 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
            WHAT MOVED THE MODEL?
          </h3>

          <div className="space-y-2 text-xs font-mono font-semibold text-[#111111]">
            <div className="flex justify-between items-center bg-white/60 p-2 rounded border border-[#111111]/10">
              <span>HIGH PRODUCTION CONCENTRATION</span>
              <span className="font-bold">+0.31</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-2 rounded border border-[#111111]/10">
              <span>ACTIVE EXPORT CONTROL</span>
              <span className="font-bold">+0.28</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-2 rounded border border-[#111111]/10">
              <span>RISING PRICE VOLATILITY</span>
              <span className="font-bold">+0.17</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-2 rounded border border-[#111111]/10">
              <span>LOW RESERVE COVERAGE</span>
              <span className="font-bold">+0.14</span>
            </div>
            <div className="flex justify-between items-center bg-white/60 p-2 rounded border border-[#111111]/10">
              <span>HIGH REFINING DEPENDENCY</span>
              <span className="font-bold">+0.10</span>
            </div>
          </div>

          <p className="text-[10px] font-mono text-[#111111]/70 uppercase tracking-tight pt-1">
            CONTRIBUTED TO PREDICTION ⓘ (FEATURE IMPORTANCE IS NON-CAUSAL)
          </p>
        </div>

        {/* Bottom-Left: Model Performance (Mint) */}
        <div className="physical-card p-6 bg-[#7CFFA6] border border-[#111111]/20 space-y-4">
          <h3 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
            MODEL PERFORMANCE
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold text-[#111111]">
            <div className="p-2.5 bg-white/70 rounded border border-[#111111]/15">
              <span className="text-[10px] block text-[#111111]/60">PR-AUC (PRIMARY)</span>
              <span className="text-xl font-bold text-[#111111]">0.812</span>
            </div>
            <div className="p-2.5 bg-white/70 rounded border border-[#111111]/15">
              <span className="text-[10px] block text-[#111111]/60">RECALL</span>
              <span className="text-xl font-bold text-[#111111]">0.681</span>
            </div>
            <div className="p-2.5 bg-white/70 rounded border border-[#111111]/15">
              <span className="text-[10px] block text-[#111111]/60">ROC-AUC</span>
              <span className="text-xl font-bold text-[#111111]">0.901</span>
            </div>
            <div className="p-2.5 bg-white/70 rounded border border-[#111111]/15">
              <span className="text-[10px] block text-[#111111]/60">F1 SCORE</span>
              <span className="text-xl font-bold text-[#111111]">0.711</span>
            </div>
          </div>
        </div>

        {/* Bottom-Right: Historical Disruptions Timeline (Chartreuse) */}
        <div className="physical-card p-6 bg-[#E4FF5B] border border-[#111111]/20 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-display text-2xl uppercase tracking-tight text-[#111111]">
              HISTORICAL DISRUPTIONS
            </h3>
            <p className="text-xs font-mono text-[#111111]/80 mt-1">
              Recorded annual disruption events (2015–2026)
            </p>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center text-xs font-mono font-bold">
            {[
              { year: '2015', disp: true },
              { year: '2016', disp: true },
              { year: '2017', disp: false },
              { year: '2018', disp: false },
              { year: '2019', disp: true },
              { year: '2020', disp: true },
              { year: '2021', disp: false },
              { year: '2022', disp: false },
              { year: '2023', disp: false },
              { year: '2024', disp: true },
              { year: '2025', disp: false },
              { year: '2026', disp: false },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[10px] text-[#111111]/70">{item.year}</span>
                <span className={`text-base font-bold ${item.disp ? 'text-[#111111]' : 'text-[#111111]/30'}`}>
                  {item.disp ? '●' : '○'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-4 text-[10px] font-mono font-bold text-[#111111]/80 pt-2 border-t border-[#111111]/15">
            <span className="flex items-center space-x-1"><span className="text-xs">●</span> <span>DISRUPTION</span></span>
            <span className="flex items-center space-x-1"><span className="text-xs">○</span> <span>NO DISRUPTION</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
