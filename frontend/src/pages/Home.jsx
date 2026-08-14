import React, { useState, useEffect } from 'react';
import StackedCard from '../components/StackedCard';
import RadarWidget from '../components/RadarWidget';
import DeveloperSection from '../components/DeveloperSection';
import { api } from '../services/api';
import { Cpu } from 'lucide-react';

export default function Home({ onNavigate }) {
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await api.getOverview();
        setOverview(res);
      } catch (e) {
        console.error("Overview error:", e);
      }
    }
    loadOverview();
  }, []);

  // Format index numbers into 3 digits
  const formatIndex = (val, defaultVal) => {
    const num = val !== undefined && val !== null ? val : defaultVal;
    return String(num).padStart(3, '0');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 flex flex-col items-center">
      {/* Huge MINZERO Wordmark */}
      <div className="text-center w-full select-none">
        <h1 className="font-display text-[110px] sm:text-[160px] md:text-[220px] leading-[0.8] tracking-tighter text-[#111111] uppercase font-bold">
          MINZERO
        </h1>
        <p className="text-xs sm:text-sm font-mono font-bold text-[#111111] uppercase tracking-widest mt-4 md:mt-6">
          INTELLIGENCE FOR THE MINERALS THAT POWER THE FUTURE.
        </p>
      </div>

      {/* RUN A MODEL Section Header */}
      <div className="w-full max-w-5xl md:max-w-6xl mt-12 pt-6 border-t-2 border-[#111111] flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none px-2">
        <div className="flex items-center space-x-2 font-mono text-xs font-bold uppercase tracking-widest text-[#111111]">
          <Cpu className="w-4 h-4 text-[#FF2AA1]" />
          <span>RUN A MODEL</span>
        </div>
        <span className="font-mono text-[11px] font-semibold text-[#111111]/60 uppercase tracking-tight">
          SELECT AN ACTIONABLE ML MODULE TO RUN CUSTOM PREDICTIONS
        </span>
      </div>

      {/* Stacked Cards Deck (Wide Landscape Horizontal Proportion) */}
      <div className="w-full max-w-5xl md:max-w-6xl mt-6 flex flex-col space-y-0 px-2">
        {/* CARD 01: Disruption Prediction */}
        <StackedCard
          bgColor="#FFFFFF"
          rotationClass="rotate-card-1"
          indexNum={formatIndex(overview?.high_risk_supply_chains_count, 14)}
          indexLabel="HIGH-RISK SUPPLY CHAINS"
          titleLine1="Disruption"
          titleLine2="Prediction"
          subtitle="PREDICT NEXT-YEAR DISRUPTION PROBABILITY"
          onClick={() => onNavigate('disruption')}
          sparklineType="line"
        />

        {/* CARD 02: Supply Risk Intelligence */}
        <StackedCard
          bgColor="#4FC3F7"
          rotationClass="rotate-card-2"
          indexNum={formatIndex(overview?.total_countries, 28)}
          indexLabel="HIGH / CRITICAL SUPPLY CHAINS"
          titleLine1="Supply Risk"
          titleLine2="Intelligence"
          subtitle="PREDICT ANALYTICAL SUPPLY-RISK SCORE"
          onClick={() => onNavigate('risk')}
          sparklineType="bars"
        />

        {/* CARD 03: Mineral Price Forecast */}
        <StackedCard
          bgColor="#E4FF5B"
          rotationClass="rotate-card-3"
          indexNum="009"
          indexLabel="MINERALS ↑ > 10% NEXT YEAR"
          titleLine1="Mineral Price"
          titleLine2="Forecast"
          subtitle="FORECAST NEXT-YEAR MINERAL PRICE"
          onClick={() => onNavigate('price')}
          sparklineType="trend"
        />

        {/* CARD 04: Supply Shock Monitor */}
        <StackedCard
          bgColor="#7CFFA6"
          rotationClass="rotate-card-4"
          indexNum={formatIndex(overview?.detected_shocks_count, 6)}
          indexLabel="CRITICAL ANOMALIES"
          titleLine1="Supply Shock"
          titleLine2="Monitor"
          subtitle="DETECT ABNORMAL SUPPLY-CHAIN BEHAVIOR"
          onClick={() => onNavigate('shocks')}
          widget={<RadarWidget />}
        />

        {/* CARD 05: Global Analytics */}
        <StackedCard
          bgColor="#F5F3E3"
          rotationClass="rotate-card-5"
          indexNum="∞"
          indexLabel="INSIGHTS ACROSS SYSTEM"
          titleLine1="Global"
          titleLine2="Analytics"
          subtitle="TRENDS, CONCENTRATION & CONTROLS"
          onClick={() => onNavigate('analytics')}
          sparklineType="bars"
        />
      </div>

      {/* Developer & Contact Section */}
      <DeveloperSection />
    </div>
  );
}
