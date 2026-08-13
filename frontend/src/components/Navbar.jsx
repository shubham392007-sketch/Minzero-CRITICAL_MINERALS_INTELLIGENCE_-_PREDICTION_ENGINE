import React from 'react';

export default function Navbar({ health, onNavigate }) {
  const isOnline = health?.status === 'OK';

  return (
    <nav className="w-full max-w-6xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between text-xs font-mono select-none">
      {/* Left Tagline */}
      <div className="hidden sm:flex items-center space-x-1.5 text-[#111111]/70 tracking-tight font-medium">
        <span className="line-through text-[#111111]/40">SYNTHETIC DATA.</span>
        <span className="text-[#111111] font-semibold">REAL METHODOLOGY.</span>
      </div>

      {/* Center Diamond Logo */}
      <button 
        onClick={() => onNavigate('/')} 
        className="group relative flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
        title="MINZERO Home"
      >
        <div className="w-8 h-8 bg-[#FF2AA1] rotate-45 flex items-center justify-center shadow-md shadow-[#FF2AA1]/20">
          <span className="-rotate-45 font-display text-white text-xs font-bold tracking-tighter">
            MZ
          </span>
        </div>
      </button>

      {/* Right Status */}
      <div className="flex items-center space-x-2 text-[#111111] font-semibold">
        <span className="text-[11px] text-[#111111]/60 font-sans tracking-wider uppercase">STATUS</span>
        <span className="text-[#111111]/40">───</span>
        <span className="inline-flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-[11px] uppercase tracking-wider font-bold">
            {isOnline ? 'ALL SYSTEMS OPERATIONAL' : 'CONNECTING...'}
          </span>
        </span>
      </div>
    </nav>
  );
}
