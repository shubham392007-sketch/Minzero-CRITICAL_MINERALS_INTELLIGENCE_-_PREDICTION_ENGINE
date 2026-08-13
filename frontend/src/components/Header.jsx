import React from 'react';
import { ShieldAlert, Activity, Search, Database, Cpu } from 'lucide-react';

export default function Header({ health, activeTab, setActiveTab }) {
  return (
    <header className="bg-[#0B0F17] border-b border-[#1E293B] sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
      {/* Brand & Logo */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">MINZERO</h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                PROD v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Critical Minerals Intelligence & Prediction Engine</p>
          </div>
        </div>
      </div>

      {/* System Status & Warnings */}
      <div className="hidden md:flex items-center space-x-6">
        {/* Synthetic Data Disclaimer Banner */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Synthetic Intelligence Environment (2015–2026)</span>
        </div>

        {/* Backend Server Status */}
        <div className="flex items-center space-x-2 text-xs">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">ML Backend:</span>
          {health?.status === 'OK' ? (
            <span className="inline-flex items-center text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              ONLINE (4 Models)
            </span>
          ) : (
            <span className="text-amber-400 font-semibold">Connecting...</span>
          )}
        </div>
      </div>
    </header>
  );
}
