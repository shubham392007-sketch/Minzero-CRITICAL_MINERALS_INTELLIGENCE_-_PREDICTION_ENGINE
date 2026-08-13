import React from 'react';
import { 
  LayoutDashboard, AlertTriangle, ShieldCheck, TrendingUp, 
  Zap, Layers, Globe, FileCode 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'disruption', label: 'Disruption Prediction', icon: AlertTriangle, badge: 'Model 1' },
    { id: 'risk', label: 'Supply Risk Intelligence', icon: ShieldCheck, badge: 'Model 2' },
    { id: 'price', label: 'Price Forecast Engine', icon: TrendingUp, badge: 'Model 3' },
    { id: 'shock', label: 'Supply Shock Monitor', icon: Zap, badge: 'Model 4' },
    { id: 'mineral_profile', label: 'Mineral Intelligence', icon: Layers, badge: '24' },
    { id: 'country_profile', label: 'Country Intelligence', icon: Globe, badge: '35' },
    { id: 'model_cards', label: 'Model Evaluation & Cards', icon: FileCode, badge: 'Metrics' },
  ];

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-[#1E293B] shrink-0 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Navigation & Modules
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/80 shadow-md shadow-cyan-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold ${
                  isActive ? 'bg-cyan-900/90 text-cyan-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Tagline */}
      <div className="p-3.5 rounded-xl bg-[#111723] border border-[#1E2D42] mt-6">
        <p className="text-xs font-semibold text-slate-300">MINZERO ENGINE</p>
        <p className="text-[11px] text-slate-500 italic mt-0.5">
          "Intelligence for the minerals that power the future."
        </p>
      </div>
    </aside>
  );
}
