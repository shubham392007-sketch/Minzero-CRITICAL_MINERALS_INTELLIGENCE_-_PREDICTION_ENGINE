import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Layers, Globe, ShieldAlert, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export default function MineralProfileView() {
  const [selectedMineral, setSelectedMineral] = useState('Lithium');
  const [mineralsList, setMineralsList] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMinerals() {
      try {
        const mins = await api.getMinerals();
        setMineralsList(mins);
      } catch (e) {
        console.error("Failed to load minerals:", e);
      }
    }
    loadMinerals();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!selectedMineral) return;
      try {
        setLoading(true);
        const data = await api.getMineralProfile(selectedMineral);
        setProfile(data);
      } catch (e) {
        console.error("Profile load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [selectedMineral]);

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111723] via-[#1A2234] to-[#111723] p-6 rounded-2xl border border-[#1E2D42]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Mineral Intelligence Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive producer share, refining concentration, and risk history.</p>
          </div>
        </div>

        <div>
          <select
            value={selectedMineral}
            onChange={(e) => setSelectedMineral(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-medium text-sm"
          >
            {mineralsList.map(m => (
              <option key={m.mineral} value={m.mineral}>{m.mineral} ({m.is_rare_earth ? 'REE' : 'Base'})</option>
            ))}
          </select>
        </div>
      </div>

      {profile && (
        <div className="space-y-6">
          {/* Mineral KPI Summary Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="panel-card p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase">Element Category</span>
              <div className="stat-value text-xl text-white mt-1">
                {profile.is_rare_earth ? 'Rare Earth Element (REE)' : 'Critical / Base Mineral'}
              </div>
            </div>

            <div className="panel-card p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase">Primary End Use</span>
              <div className="stat-value text-xl text-cyan-400 mt-1 capitalize">
                {profile.end_use?.replace('_', ' ')}
              </div>
            </div>

            <div className="panel-card p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase">HHI Concentration</span>
              <div className="stat-value text-xl text-amber-400 mt-1">
                {profile.avg_hhi}
              </div>
            </div>

            <div className="panel-card p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase">Top Producer Share</span>
              <div className="stat-value text-xl text-rose-400 mt-1">
                {profile.top_country_share_pct}%
              </div>
            </div>
          </div>

          {/* Producer Breakdown Table & Price Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Country Producer Breakdown */}
            <div className="panel-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Producing Countries Breakdown ({profile.latest_year})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 bg-slate-900/60 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Country</th>
                      <th className="py-2 px-3">Mine Share</th>
                      <th className="py-2 px-3">Refined Share</th>
                      <th className="py-2 px-3">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {profile.country_breakdown.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="py-2 px-3 font-semibold text-white">{c.country}</td>
                        <td className="py-2 px-3 font-mono text-cyan-400">{c.production_share_pct}%</td>
                        <td className="py-2 px-3 font-mono text-amber-400">{c.refined_share_pct}%</td>
                        <td className="py-2 px-3 font-mono text-slate-300">{c.supply_risk_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historical Price Trend */}
            <div className="panel-card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Historical Price Trend (2015–2026)
              </h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profile.timeline} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
                    <YAxis stroke="#94A3B8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#111723', borderColor: '#1E2D42', color: '#F8FAFC' }} />
                    <Line type="monotone" dataKey="avg_price_usd" stroke="#38BDF8" strokeWidth={2.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
