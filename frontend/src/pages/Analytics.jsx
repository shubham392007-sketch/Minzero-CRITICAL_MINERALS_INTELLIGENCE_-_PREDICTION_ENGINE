import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, Layers, Globe, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function Analytics({ onNavigate }) {
  const [concentration, setConcentration] = useState([]);
  const [exportControls, setExportControls] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [conc, ec] = await Promise.all([
          api.getConcentration(),
          api.getExportControls()
        ]);
        setConcentration(conc);
        setExportControls(ec);
      } catch (e) {
        console.error("Analytics load error:", e);
      }
    }
    loadData();
  }, []);

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

      {/* Hero */}
      <div>
        <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-[#111111] leading-none">
          GLOBAL MINERAL SYSTEM
        </h1>
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
          EDITORIAL ANALYTICS • CONCENTRATION & TRADE CONTROLS
        </p>
      </div>

      {/* Concentration Chart (White Card) */}
      <div className="physical-card p-6 bg-white border border-[#111111]/20 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
          GLOBAL PRODUCTION CONCENTRATION (HHI INDEX BY MINERAL)
        </h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={concentration.slice(0, 10)} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#111111" strokeOpacity={0.1} />
              <XAxis dataKey="mineral" stroke="#111111" fontSize={10} fontStyle="bold" angle={-25} textAnchor="end" />
              <YAxis stroke="#111111" fontSize={10} domain={[0, 1]} />
              <Tooltip contentStyle={{ backgroundColor: '#111723', borderColor: '#1E2D42', color: '#F8FAFC', borderRadius: '8px' }} />
              <Bar dataKey="hhi" fill="#111111" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Controls Summary (Sky Blue Card) */}
      <div className="physical-card p-6 bg-[#4FC3F7] border border-[#111111]/20 space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
          ACTIVE EXPORT CONTROL RECORDED EVENTS
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="text-[#111111]/70 font-bold border-b border-[#111111]/20 uppercase">
              <tr>
                <th className="py-2 px-3">Year</th>
                <th className="py-2 px-3">Mineral</th>
                <th className="py-2 px-3">Country</th>
                <th className="py-2 px-3">Mine Share</th>
                <th className="py-2 px-3">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111111]/10 font-bold text-[#111111]">
              {exportControls.slice(0, 8).map((ec, idx) => (
                <tr key={idx} className="hover:bg-white/40">
                  <td className="py-2 px-3">{ec.year}</td>
                  <td className="py-2 px-3">{ec.mineral}</td>
                  <td className="py-2 px-3">{ec.country}</td>
                  <td className="py-2 px-3">{ec.production_share_pct}%</td>
                  <td className="py-2 px-3">
                    <span className="badge-editorial-critical px-2 py-0.5 rounded text-[10px]">
                      {ec.supply_risk_score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
