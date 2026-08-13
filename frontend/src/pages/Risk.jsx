import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ArrowLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export default function Risk({ onNavigate }) {
  const [filterRisk, setFilterRisk] = useState('All');
  const [expandedIndex, setExpandedIndex] = useState(0);

  const riskData = [
    { rank: '01', mineral: 'Graphite', country: 'China', score: 87.4, category: 'CRITICAL', hhi: '0.72', control: 'Active', reserves: '18.4 yr', color: '#111111', text: '#FFFFFF' },
    { rank: '02', mineral: 'Cobalt', country: 'DRC', score: 82.1, category: 'CRITICAL', hhi: '0.68', control: 'Active', reserves: '11.2 yr', color: '#4FC3F7', text: '#111111' },
    { rank: '03', mineral: 'Tungsten', country: 'China', score: 79.6, category: 'HIGH', hhi: '0.71', control: 'Active', reserves: '16.7 yr', color: '#E4FF5B', text: '#111111' },
    { rank: '04', mineral: 'Rare Earths', country: 'China', score: 76.3, category: 'HIGH', hhi: '0.70', control: 'Active', reserves: '20.1 yr', color: '#7CFFA6', text: '#111111' },
    { rank: '05', mineral: 'Nickel', country: 'Indonesia', score: 62.8, category: 'ELEVATED', hhi: '0.58', control: 'None', reserves: '22.3 yr', color: '#FFFFFF', text: '#111111' },
    { rank: '06', mineral: 'Lithium', country: 'Australia', score: 54.2, category: 'ELEVATED', hhi: '0.46', control: 'None', reserves: '35.0 yr', color: '#F5F3E3', text: '#111111' },
  ];

  const filtered = riskData.filter(item => {
    if (filterRisk === 'All') return true;
    return item.category.toUpperCase() === filterRisk.toUpperCase();
  });

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

      {/* Hero & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-[#111111] leading-none">
            SUPPLY RISK INTELLIGENCE
          </h1>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
            RANKED BY PREDICTED SUPPLY RISK SCORE
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <label className="font-bold text-[#111111]">FILTER BY RISK</label>
          <select 
            value={filterRisk} 
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-white border border-[#111111]/30 rounded-lg px-3 py-1.5 text-[#111111] font-bold"
          >
            {['All', 'Critical', 'High', 'Elevated', 'Moderate'].map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stacked Ranked List matching top-right panel */}
      <div className="space-y-3 pt-2">
        {filtered.map((item, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div
              key={idx}
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              style={{ backgroundColor: item.color, color: item.text }}
              className="physical-card physical-card-dashed-hover p-5 border border-[#111111]/20 cursor-pointer select-none transition-all"
            >
              <div className="flex items-center justify-between">
                {/* Left Rank & Mineral/Country */}
                <div className="flex items-center space-x-4">
                  <span className="font-mono text-2xl font-bold opacity-60">{item.rank}</span>
                  <div>
                    <h3 className="font-display text-3xl uppercase tracking-tight leading-none">{item.mineral}</h3>
                    <p className="text-xs font-mono font-bold opacity-80 mt-1">{item.country}</p>
                  </div>
                </div>

                {/* Right Risk Score & Metrics */}
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-70">RISK SCORE</span>
                    <span className="font-mono text-3xl font-bold leading-none">{item.score}</span>
                    <span className="text-[10px] font-mono font-bold block uppercase tracking-wider mt-0.5" style={{ color: item.score >= 80 ? '#FF2AA1' : 'inherit' }}>
                      {item.category}
                    </span>
                  </div>

                  <div className="hidden md:flex items-center space-x-6 text-xs font-mono border-l border-current/20 pl-6 text-left">
                    <div>
                      <span className="text-[9px] font-bold block opacity-60">HHI</span>
                      <span className="font-bold">{item.hhi}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold block opacity-60">CONTROL</span>
                      <span className="font-bold">{item.control}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold block opacity-60">RESERVES</span>
                      <span className="font-bold">{item.reserves}</span>
                    </div>
                  </div>

                  <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>

              {/* Expanded Strategic Profile Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-current/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2 bg-black/10 rounded">
                    <span className="text-[10px] opacity-70 block">PRODUCTION SHARE</span>
                    <span className="font-bold">65.0%</span>
                  </div>
                  <div className="p-2 bg-black/10 rounded">
                    <span className="text-[10px] opacity-70 block">REFINED SHARE</span>
                    <span className="font-bold">85.0%</span>
                  </div>
                  <div className="p-2 bg-black/10 rounded">
                    <span className="text-[10px] opacity-70 block">DEMAND PRESSURE</span>
                    <span className="font-bold">+14.2%</span>
                  </div>
                  <div className="p-2 bg-black/10 rounded">
                    <span className="text-[10px] opacity-70 block">STRATEGIC ACTION</span>
                    <span className="font-bold text-[#FF2AA1]">INVENTORY BUFFER</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
