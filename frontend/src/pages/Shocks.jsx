import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import RadarWidget from '../components/RadarWidget';
import { ArrowLeft, Zap } from 'lucide-react';

export default function Shocks({ onNavigate }) {
  const [filterType, setFilterType] = useState('All Shocks');
  const [shockData, setShockData] = useState({
    mineral: 'Graphite',
    country: 'China',
    year: 2025,
    severity: 'CRITICAL',
    anomaly_score: 0.94,
    drivers: ['Unusual price movement', 'Production deviation', 'Export-control activity']
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
            SUPPLY SHOCK MONITOR
          </h1>
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
            UNSUPERVISED ANOMALY DETECTION ENGINE
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <label className="font-bold text-[#111111]">FILTER</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-[#111111]/30 rounded-lg px-3 py-1.5 text-[#111111] font-bold"
          >
            {['All Shocks', 'Critical Shocks', 'Price Shocks', 'Geopolitical Shocks'].map(f => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 Summary Cards matching middle-right reference panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="physical-card p-5 bg-white border border-[#111111]/20">
          <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/60 block">TOTAL ANOMALIES</span>
          <span className="font-mono text-4xl font-bold text-[#111111] mt-1 block">132</span>
        </div>

        <div className="physical-card p-5 bg-[#4FC3F7] border border-[#111111]/20">
          <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/70 block">CRITICAL SHOCKS</span>
          <span className="font-mono text-4xl font-bold text-[#111111] mt-1 block">06</span>
        </div>

        <div className="physical-card p-5 bg-[#E4FF5B] border border-[#111111]/20">
          <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/70 block">PRICE SHOCKS</span>
          <span className="font-mono text-4xl font-bold text-[#111111] mt-1 block">48</span>
        </div>

        <div className="physical-card p-5 bg-[#7CFFA6] border border-[#111111]/20">
          <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/70 block">GEOPOLITICAL SHOCKS</span>
          <span className="font-mono text-4xl font-bold text-[#111111] mt-1 block">22</span>
        </div>
      </div>

      {/* Anomaly Timeline */}
      <div className="physical-card p-5 bg-[#F5F3E3] border border-[#111111]/20 space-y-3">
        <h4 className="text-xs font-mono font-bold uppercase text-[#111111]">
          ANOMALY TIMELINE
        </h4>
        <div className="grid grid-cols-8 gap-2 text-center text-xs font-mono font-bold">
          {['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'].map((year, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[10px] text-[#111111]/70">{year}</span>
              <span className="text-sm font-bold text-[#111111] mt-1">
                {idx % 2 === 0 ? '●' : '○'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Critical Shock Card with Radar Widget */}
      <div className="physical-card p-7 bg-white border border-[#111111]/20 relative space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/60 block">LATEST CRITICAL SHOCK</span>
            <h2 className="font-display text-4xl uppercase tracking-tight text-[#111111] mt-1">
              {shockData.mineral} • {shockData.country} • {shockData.year}
            </h2>
          </div>

          <span className="badge-editorial-critical px-3 py-1 rounded text-xs font-mono font-bold">
            {shockData.severity}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
          <div className="md:col-span-4">
            <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/60 block">ANOMALY SCORE</span>
            <span className="font-mono text-5xl font-bold text-[#111111]">{shockData.anomaly_score}</span>
          </div>

          <div className="md:col-span-5 text-xs font-mono text-[#111111]">
            <span className="font-bold text-[#111111]/70 block uppercase text-[10px] mb-1">MAIN DRIVERS</span>
            <ul className="space-y-1 font-semibold">
              {shockData.drivers.map((d, i) => (
                <li key={i} className="flex items-center space-x-1.5">
                  <span className="text-[#FF2AA1]">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Peeking Radar Widget */}
          <div className="md:col-span-3 flex justify-end">
            <RadarWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
