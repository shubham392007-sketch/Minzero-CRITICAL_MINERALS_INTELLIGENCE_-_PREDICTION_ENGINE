import React from 'react';
import { History, Clock, ArrowUpRight } from 'lucide-react';

export default function RecentPredictions({ predictions = [], onSelect }) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 mb-6 select-none">
      <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mb-4">
        <History className="w-4 h-4" />
        <span>RECENT PREDICTIONS</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {predictions.slice(0, 4).map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelect && onSelect(item)}
            className="physical-card p-4 bg-white border border-[#111111]/15 hover:border-[#111111] cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/60">
                  {item.modelType}
                </span>
                <span className="text-[9px] font-mono text-[#111111]/50 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{item.timestamp}</span>
                </span>
              </div>
              <h4 className="font-display text-2xl uppercase tracking-tight text-[#111111] mt-1">
                {item.mineral} • {item.country}
              </h4>
            </div>

            <div className="mt-3 pt-2 border-t border-[#111111]/10 flex items-center justify-between font-mono">
              <span className="text-xl font-bold text-[#111111]">{item.resultSummary}</span>
              <ArrowUpRight className="w-4 h-4 text-[#111111]/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
