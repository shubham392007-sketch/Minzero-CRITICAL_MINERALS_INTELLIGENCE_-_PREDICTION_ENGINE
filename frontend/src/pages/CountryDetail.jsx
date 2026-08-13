import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function CountryDetail({ onNavigate, countryName = 'China' }) {
  const [year, setYear] = useState(2025);

  const topMinerals = [
    { mineral: 'Rare Earths', share: '86.1%' },
    { mineral: 'Graphite', share: '71.4%' },
    { mineral: 'Tungsten', share: '76.3%' },
    { mineral: 'Antimony', share: '62.1%' },
    { mineral: 'Gallium', share: '94.8%' },
  ];

  const supplyChains = [
    { chain: 'Rare Earths → Global Magnets' },
    { chain: 'Graphite → Battery Anodes' },
    { chain: 'Tungsten → Hard Metals' },
    { chain: 'Gallium → Semiconductors' },
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

      {/* Hero & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-6xl sm:text-8xl uppercase tracking-tight text-[#111111] leading-none">
            {countryName.toUpperCase()}
          </h1>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
            GLOBAL MINERAL POSITION
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <label className="font-bold text-[#111111]">VIEW YEAR</label>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="bg-white border border-[#111111]/30 rounded-lg px-3 py-1.5 text-[#111111] font-bold"
          >
            {[2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Info Cards matching bottom-right reference panel */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
        <div className="physical-card p-4 bg-white border border-[#111111]/20">
          <span className="text-[9px] font-mono font-bold uppercase text-[#111111]/70 block">MINERALS PRODUCED</span>
          <span className="font-mono text-3xl font-bold text-[#111111] mt-1 block">18</span>
        </div>

        <div className="physical-card p-4 bg-[#4FC3F7] border border-[#111111]/20">
          <span className="text-[9px] font-mono font-bold uppercase text-[#111111]/70 block">REFINING EXPOSURE</span>
          <span className="font-mono text-3xl font-bold text-[#111111] mt-1 block">73.2%</span>
          <span className="text-[9px] font-mono font-bold text-[#111111]/70 uppercase block">GLOBAL SHARE</span>
        </div>

        <div className="physical-card p-4 bg-[#E4FF5B] border border-[#111111]/20">
          <span className="text-[9px] font-mono font-bold uppercase text-[#111111]/70 block">EXPORT CONTROLS</span>
          <span className="font-mono text-3xl font-bold text-[#111111] mt-1 block">11</span>
          <span className="text-[9px] font-mono font-bold text-[#111111]/70 uppercase block">ACTIVE</span>
        </div>

        <div className="physical-card p-4 bg-[#7CFFA6] border border-[#111111]/20">
          <span className="text-[9px] font-mono font-bold uppercase text-[#111111]/70 block">AVERAGE RISK SCORE</span>
          <span className="font-mono text-3xl font-bold text-[#111111] mt-1 block">68.7</span>
          <span className="text-[9px] font-mono font-bold text-[#111111]/70 uppercase block">HIGH</span>
        </div>
      </div>

      {/* Bottom Lists: Top Minerals & Critical Supply Chains */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Top Minerals by Share */}
        <div className="physical-card p-5 bg-white border border-[#111111]/20 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#111111]/70">
            TOP MINERALS BY PRODUCTION SHARE
          </h3>
          <div className="space-y-2 text-xs font-mono font-bold text-[#111111]">
            {topMinerals.map((m, i) => (
              <div key={i} className="flex justify-between items-center bg-[#EDECE7] p-2 rounded">
                <span>{m.mineral}</span>
                <span className="text-[#FF2AA1]">{m.share}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Supply Chains */}
        <div className="physical-card p-5 bg-white border border-[#111111]/20 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase text-[#111111]/70">
            CRITICAL SUPPLY CHAINS
          </h3>
          <div className="space-y-2 text-xs font-mono font-bold text-[#111111]">
            {supplyChains.map((c, i) => (
              <div key={i} className="flex items-center space-x-2 bg-[#EDECE7] p-2.5 rounded">
                <span className="text-[#FF2AA1]">•</span>
                <span>{c.chain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
