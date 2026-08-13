import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Globe, Layers, ShieldAlert, AlertCircle } from 'lucide-react';

export default function CountryProfileView() {
  const [selectedCountry, setSelectedCountry] = useState('China');
  const [countriesList, setCountriesList] = useState([]);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadCountries() {
      try {
        const cList = await api.getCountries();
        setCountriesList(cList);
      } catch (e) {
        console.error("Failed to load countries:", e);
      }
    }
    loadCountries();
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!selectedCountry) return;
      try {
        const data = await api.getCountryProfile(selectedCountry);
        setProfile(data);
      } catch (e) {
        console.error("Country profile error:", e);
      }
    }
    loadProfile();
  }, [selectedCountry]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#111723] via-[#1A2234] to-[#111723] p-6 rounded-2xl border border-[#1E2D42]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Country Intelligence Profile</h2>
            <p className="text-xs text-slate-400 mt-0.5">Strategic national production share, refining leverage, and trade policies.</p>
          </div>
        </div>

        <div>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-medium text-sm"
          >
            {countriesList.map(c => (
              <option key={c.country} value={c.country}>{c.country} ({c.minerals_produced_count} Minerals)</option>
            ))}
          </select>
        </div>
      </div>

      {profile && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="panel-card p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Minerals Produced</span>
              <div className="stat-value text-2xl text-white mt-1">{profile.total_minerals_produced}</div>
            </div>

            <div className="panel-card p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase">Active Export Controls</span>
              <div className="stat-value text-2xl text-amber-400 mt-1">{profile.active_export_controls_count}</div>
            </div>

            <div className="panel-card p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase">Average Supply Risk</span>
              <div className="stat-value text-2xl text-cyan-400 mt-1">{profile.avg_supply_risk_score} / 100</div>
            </div>
          </div>

          {/* Mineral Output Table */}
          <div className="panel-card p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              {profile.country} Mineral Output & Processing Shares
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 bg-slate-900/60 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Mineral</th>
                    <th className="py-2 px-3">Mining Production Share</th>
                    <th className="py-2 px-3">Refining Share</th>
                    <th className="py-2 px-3">Export Restrictions</th>
                    <th className="py-2 px-3">Risk Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {profile.mineral_output.map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="py-2 px-3 font-semibold text-white">{m.mineral}</td>
                      <td className="py-2 px-3 font-mono text-cyan-400">{m.production_share_pct}%</td>
                      <td className="py-2 px-3 font-mono text-amber-400">{m.refined_share_pct}%</td>
                      <td className="py-2 px-3 font-mono">
                        {m.export_control_active === 1 ? (
                          <span className="text-rose-400 font-semibold bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">Active</span>
                        ) : (
                          <span className="text-slate-500">None</span>
                        )}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-300">{m.supply_risk_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
