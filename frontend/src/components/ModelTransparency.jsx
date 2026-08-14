import React, { useState } from 'react';
import { ChevronDown, ShieldCheck, Database, Layers } from 'lucide-react';

export default function ModelTransparency({
  modelName = "XGBoost Classifier",
  primaryMetric = "PR-AUC 0.812",
  trainingPeriod = "2015–2020",
  testPeriod = "2024–2025",
  modelVersion = "v1.0.0",
  specificWarning = "Predictions demonstrate ML methodology on a synthetic dataset."
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full physical-card p-6 bg-[#F5F3E3] border border-[#111111]/20 my-6 select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#FF2AA1] transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Database className="w-4 h-4 text-[#111111]" />
          <span>MODEL DETAILS & TRANSPARENCY</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-[#111111]/60">{isOpen ? "HIDE" : "SHOW"}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-[#111111]/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-[#111111]">
          <div className="bg-white/70 p-3 rounded-lg border border-[#111111]/10">
            <span className="text-[9px] opacity-60 block uppercase">MODEL USED</span>
            <span className="font-bold">{modelName}</span>
          </div>

          <div className="bg-white/70 p-3 rounded-lg border border-[#111111]/10">
            <span className="text-[9px] opacity-60 block uppercase">PRIMARY METRIC</span>
            <span className="font-bold">{primaryMetric}</span>
          </div>

          <div className="bg-white/70 p-3 rounded-lg border border-[#111111]/10">
            <span className="text-[9px] opacity-60 block uppercase">TRAINING PERIOD</span>
            <span className="font-bold">{trainingPeriod}</span>
          </div>

          <div className="bg-white/70 p-3 rounded-lg border border-[#111111]/10">
            <span className="text-[9px] opacity-60 block uppercase">VERSION</span>
            <span className="font-bold">{modelVersion}</span>
          </div>

          <div className="col-span-2 sm:col-span-4 bg-white/70 p-3 rounded-lg border border-[#111111]/10 text-[10px] text-[#111111]/80">
            <span className="font-bold text-[#FF2AA1] mr-1">✦ NOTICE:</span>
            <span>{specificWarning}</span>
          </div>
        </div>
      )}
    </div>
  );
}
