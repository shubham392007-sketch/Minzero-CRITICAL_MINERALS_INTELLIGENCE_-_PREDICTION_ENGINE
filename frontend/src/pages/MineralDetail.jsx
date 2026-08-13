import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function MineralDetail({ onNavigate, mineralName = 'Lithium' }) {
  const [country, setCountry] = useState('Australia');

  const cardColors = ['#FFFFFF', '#4FC3F7', '#E4FF5B', '#7CFFA6', '#F5F3E3'];

  const stats = [
    { label: 'MINE PRODUCTION', val: '87,600 t', sub: '2025' },
    { label: 'RESERVES', val: '2.8M t', sub: '2025' },
    { label: 'YEARS OF RESERVES', val: '32.0 yr', sub: '2025' },
    { label: 'REFINING SHARE', val: '46.3%', sub: 'GLOBAL' },
    { label: 'PRICE (USD)', val: '$12,420 /t', sub: '2025' },
    { label: 'DEMAND GROWTH', val: '+18.7%', sub: 'YoY' },
    { label: 'HHI (PRODUCTION)', val: '0.46', sub: '2025' },
    { label: 'TOP PRODUCER', val: 'Australia', sub: '38.7% SHARE' },
    { label: 'SUPPLY RISK SCORE', val: '62.3', sub: 'ELEVATED' },
    { label: 'DISRUPTION PROB.', val: '27.6%', sub: 'NEXT YEAR' },
  ];

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

      {/* Hero & Country Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-6xl sm:text-8xl uppercase tracking-tight text-[#111111] leading-none">
            {mineralName.toUpperCase()}
          </h1>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
            BATTERY • CRITICAL MINERAL
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <label className="font-bold text-[#111111]">SELECT COUNTRY</label>
          <select 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            className="bg-white border border-[#111111]/30 rounded-lg px-3 py-1.5 text-[#111111] font-bold"
          >
            {['Australia', 'Chile', 'China', 'Argentina'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Flat Grid of Colorful Cards matching bottom-left reference panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-2">
        {stats.map((item, idx) => {
          const color = cardColors[idx % cardColors.length];
          return (
            <div 
              key={idx} 
              style={{ backgroundColor: color }} 
              className="physical-card p-4 border border-[#111111]/20 flex flex-col justify-between select-none"
            >
              <span className="text-[9px] font-mono font-bold uppercase text-[#111111]/70 block">{item.label}</span>
              <div className="mt-3">
                <span className="font-mono text-2xl font-bold text-[#111111] block leading-tight">{item.val}</span>
                <span className="text-[9px] font-mono font-bold text-[#111111]/50 block uppercase mt-0.5">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
