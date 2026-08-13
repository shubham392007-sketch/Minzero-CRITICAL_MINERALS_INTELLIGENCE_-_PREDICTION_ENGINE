import React from 'react';

export default function RadarWidget() {
  return (
    <div className="relative w-16 h-16 rounded-full bg-[#111111] flex items-center justify-center overflow-hidden border border-[#111111] shadow-inner">
      {/* Concentric radar rings */}
      <div className="absolute inset-2 border border-[#7CFFA6]/30 rounded-full" />
      <div className="absolute inset-4 border border-[#7CFFA6]/50 rounded-full" />
      
      {/* Sweeping radar scanner */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#7CFFA6]/20 to-[#7CFFA6]/80 rounded-full animate-spin duration-[3000ms]" />

      {/* Center blip */}
      <div className="w-2.5 h-2.5 rounded-full bg-[#7CFFA6] z-10 shadow-[0_0_8px_#7CFFA6] animate-ping" />
    </div>
  );
}
