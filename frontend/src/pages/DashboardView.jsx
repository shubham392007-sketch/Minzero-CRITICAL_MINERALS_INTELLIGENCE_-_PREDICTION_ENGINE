import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart2, ShieldAlert, TrendingUp, Zap, Layers, Globe, 
  Filter, AlertCircle, ArrowUpRight 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar 
} from 'recharts';

export default function DashboardView({ onNavigate }) {
  const [overview, setOverview] = useState(null);
  const [concentration, setConcentration] = useState([]);
  const [exportControls, setExportControls] = useState([]);
  const [prices, setPrices] = useState([]);
  const [minerals, setMinerals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [ov, conc, ec, pr, min] = await Promise.all([
          api.getOverview(),
          api.getConcentration(),
          api.getExportControls(),
          api.getPrices(),
          api.getMinerals()
        ]);
        setOverview(ov);
        setConcentration(conc);
        setExportControls(ec);
        setPrices(pr);
        setMinerals(min);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-mono">Loading Minzero Intelligence Master Data...</p>
        </div>
      </div>
    );
  }

  const filteredConcentration = concentration.filter(c => {
    if (filterType === 'RARE') return c.is_rare_earth === 1;
    if (filterType === 'NON_RARE') return c.is_rare_earth === 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111723] via-[#162032] to-[#111723] p-6 rounded-2xl border border-[#1E2D42]">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Executive Critical Minerals Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">
            Global market concentration, analytical supply chain risk indices, and ML predictive monitoring.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => onNavigate('disruption')} 
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition-all shadow-lg shadow-cyan-950 flex items-center space-x-2"
          >
            <span>Run Disruption Predictor</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="panel-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Minerals</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="stat-value text-2xl text-white">{overview?.total_minerals || 24}</div>
          <p className="text-[11px] text-slate-500 mt-1">10 Rare Earths, 14 Base</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Countries</span>
            <Globe className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="stat-value text-2xl text-white">{overview?.total_countries || 35}</div>
          <p className="text-[11px] text-slate-500 mt-1">Global Mining Producers</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Years</span>
            <BarChart2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="stat-value text-2xl text-white">2015–2026</div>
          <p className="text-[11px] text-slate-500 mt-1">Temporal Panel Dataset</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="stat-value text-2xl text-rose-400">{overview?.high_risk_supply_chains_count || 90}</div>
          <p className="text-[11px] text-slate-500 mt-1">Risk Score &ge; 70.0</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Export Controls</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="stat-value text-2xl text-amber-400">{overview?.active_export_controls_count || 25}</div>
          <p className="text-[11px] text-slate-500 mt-1">Trade Control Onsets</p>
        </div>

        <div className="panel-card p-4">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Supply Shocks</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="stat-value text-2xl text-cyan-400">{overview?.detected_shocks_count || 71}</div>
          <p className="text-[11px] text-slate-500 mt-1">Model 4 Detected Anomalies</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Concentration Chart */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Production Concentration (HHI Index)</h3>
              <p className="text-xs text-slate-400">Herfindahl-Hirschman Index of global mining concentration</p>
            </div>
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded font-medium ${filterType === 'ALL' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('RARE')}
                className={`px-2.5 py-1 rounded font-medium ${filterType === 'RARE' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
              >
                Rare Earths
              </button>
              <button
                onClick={() => setFilterType('NON_RARE')}
                className={`px-2.5 py-1 rounded font-medium ${filterType === 'NON_RARE' ? 'bg-cyan-900 text-cyan-200' : 'text-slate-400'}`}
              >
                Base/Battery
              </button>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredConcentration.slice(0, 12)} layout="vertical" margin={{ top: 5, right: 30, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis type="number" domain={[0, 1]} stroke="#64748B" fontSize={11} />
                <YAxis dataKey="mineral" type="category" stroke="#94A3B8" fontSize={11} width={80} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111723', borderColor: '#1E2D42', color: '#F8FAFC', borderRadius: '8px' }}
                  formatter={(val) => [val, 'HHI Index']}
                />
                <Bar dataKey="hhi" fill="#38BDF8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Export Control & Shock Events Table */}
        <div className="panel-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Active Export Control Timeline</h3>
              <p className="text-xs text-slate-400">Jurisdictional restrictions & market share impact</p>
            </div>
            <button onClick={() => onNavigate('shock')} className="text-xs text-cyan-400 hover:underline">
              View Shock Monitor &rarr;
            </button>
          </div>

          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 bg-slate-900/60 uppercase font-semibold border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2 px-3">Year</th>
                  <th className="py-2 px-3">Mineral</th>
                  <th className="py-2 px-3">Country</th>
                  <th className="py-2 px-3">Production Share</th>
                  <th className="py-2 px-3">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {exportControls.slice(0, 7).map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-300">{item.year}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{item.mineral}</td>
                    <td className="py-2.5 px-3 text-slate-300">{item.country}</td>
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{item.production_share_pct}%</td>
                    <td className="py-2.5 px-3">
                      <span className="badge-high px-2 py-0.5 rounded text-[11px] font-mono">
                        {item.supply_risk_score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
