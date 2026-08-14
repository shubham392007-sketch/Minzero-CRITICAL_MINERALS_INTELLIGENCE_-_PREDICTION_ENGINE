import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RotateCcw, Play } from 'lucide-react';

export default function ModelInputForm({
  modelType = "disruption",
  initialValues = {},
  onSubmit,
  loading = false
}) {
  const [mineralsList, setMineralsList] = useState(['Cobalt', 'Lithium', 'Antimony', 'Dysprosium', 'Gallium', 'Graphite', 'Nickel', 'Tungsten', 'Copper']);
  const [countriesList, setCountriesList] = useState(['Congo (DRC)', 'China', 'Australia', 'Chile', 'Indonesia', 'South Africa', 'USA', 'Russia', 'Brazil']);

  const defaultState = {
    mineral: 'Cobalt',
    country: 'Congo (DRC)',
    year: 2025,
    useHistoricalData: true,
    mine_production_tonnes: 130000.0,
    production_share_pct: 70.0,
    reserves_tonnes: 4000000.0,
    years_of_reserves: 11.2,
    refined_share_pct: 75.0,
    price_usd_per_tonne: 32000.0,
    demand_growth_pct: 12.0,
    export_control_active: 1,
    hhi: 0.68,
    top_country_share_pct: 70.0,
    ...initialValues
  };

  const [formData, setFormData] = useState(defaultState);
  const [errors, setErrors] = useState({});

  // Fetch dynamic minerals & countries lists from API
  useEffect(() => {
    async function loadOptions() {
      try {
        const [mRes, cRes] = await Promise.all([
          api.getMinerals().catch(() => null),
          api.getCountries().catch(() => null)
        ]);
        if (mRes && Array.isArray(mRes)) {
          setMineralsList(mRes.map(item => item.mineral));
        }
        if (cRes && Array.isArray(cRes)) {
          setCountriesList(cRes.map(item => item.country));
        }
      } catch (e) {
        console.log("Using baseline options");
      }
    }
    loadOptions();
  }, []);

  // Auto-fetch baseline dataset row when mineral/country changes if useHistoricalData is true
  useEffect(() => {
    async function loadBaseline() {
      if (formData.useHistoricalData) {
        try {
          const row = await api.getDatasetRow(formData.mineral, formData.country, formData.year).catch(() => null);
          if (row && !row.error) {
            setFormData(prev => ({
              ...prev,
              mine_production_tonnes: row.mine_production_tonnes,
              production_share_pct: row.production_share_pct,
              reserves_tonnes: row.reserves_tonnes,
              years_of_reserves: row.years_of_reserves,
              refined_share_pct: row.refined_share_pct,
              price_usd_per_tonne: row.price_usd_per_tonne,
              demand_growth_pct: row.demand_growth_pct,
              export_control_active: row.export_control_active,
              hhi: row.hhi,
              top_country_share_pct: row.top_country_share_pct
            }));
          }
        } catch (e) {
          // Silent fallback
        }
      }
    }
    loadBaseline();
  }, [formData.mineral, formData.country, formData.year, formData.useHistoricalData]);

  const handleChange = (field, val) => {
    let parsed = val;
    if (field === 'mineral' || field === 'country') {
      parsed = String(val);
    } else if (field === 'year' || field === 'export_control_active') {
      parsed = parseInt(val, 10) || 0;
    } else if (typeof val === 'boolean') {
      parsed = val;
    } else {
      parsed = parseFloat(val) || 0;
    }

    setFormData(prev => ({ ...prev, [field]: parsed }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (formData.mine_production_tonnes < 0) newErrors.mine_production_tonnes = "Must be ≥ 0 tonnes";
    if (formData.reserves_tonnes < 0) newErrors.reserves_tonnes = "Must be ≥ 0 tonnes";
    if (formData.years_of_reserves < 0) newErrors.years_of_reserves = "Must be ≥ 0 years";
    if (formData.production_share_pct < 0 || formData.production_share_pct > 100) newErrors.production_share_pct = "Must be between 0 and 100%";
    if (formData.refined_share_pct < 0 || formData.refined_share_pct > 100) newErrors.refined_share_pct = "Must be between 0 and 100%";
    if (formData.top_country_share_pct < 0 || formData.top_country_share_pct > 100) newErrors.top_country_share_pct = "Must be between 0 and 100%";
    if (formData.price_usd_per_tonne <= 0) newErrors.price_usd_per_tonne = "Must be > $0";
    if (formData.hhi < 0 || formData.hhi > 1.0) newErrors.hhi = "HHI must be between 0.00 and 1.00";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData(defaultState);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="physical-card p-8 bg-white border border-[#111111]/20 my-6 select-none space-y-6">
      {/* Top Header & Historical Auto-Fill Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#111111]/15 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60 block">
            SUPPLY CHAIN INPUT
          </span>
          <h3 className="font-display text-3xl uppercase tracking-tight text-[#111111]">
            MODEL PARAMETERS
          </h3>
        </div>

        {/* USE HISTORICAL DATA Toggle */}
        <label className="flex items-center space-x-3 cursor-pointer text-xs font-mono font-bold bg-[#EDECE7] p-2.5 rounded-xl border border-[#111111]/20">
          <input
            type="checkbox"
            checked={formData.useHistoricalData}
            onChange={(e) => handleChange('useHistoricalData', e.target.checked)}
            className="w-4 h-4 accent-[#FF2AA1]"
          />
          <span className="uppercase text-[#111111]">USE HISTORICAL DATA AUTO-FILL</span>
        </label>
      </div>

      {/* Selectors: Mineral, Country, Year */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <label className="font-bold text-[#111111] block mb-1">MINERAL</label>
          <select
            value={formData.mineral}
            onChange={(e) => handleChange('mineral', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 text-[#111111] font-bold"
          >
            {mineralsList.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <span className="text-[9px] text-[#111111]/50 block mt-1">Target critical mineral</span>
        </div>

        <div>
          <label className="font-bold text-[#111111] block mb-1">COUNTRY</label>
          <select
            value={formData.country}
            onChange={(e) => handleChange('country', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 text-[#111111] font-bold"
          >
            {countriesList.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="text-[9px] text-[#111111]/50 block mt-1">Primary production origin</span>
        </div>

        <div>
          <label className="font-bold text-[#111111] block mb-1">YEAR</label>
          <select
            value={formData.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 text-[#111111] font-bold"
          >
            {[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <span className="text-[9px] text-[#111111]/50 block mt-1">Prediction reference year</span>
        </div>
      </div>

      {/* Detailed Domain Numerical Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono pt-2">
        {/* Mine Production */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">MINE PRODUCTION (t)</label>
          <input
            type="number"
            value={formData.mine_production_tonnes}
            onChange={(e) => handleChange('mine_production_tonnes', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Annual mine production volume</span>
          {errors.mine_production_tonnes && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.mine_production_tonnes}</span>}
        </div>

        {/* Production Share */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">PRODUCTION SHARE (%)</label>
          <input
            type="number"
            value={formData.production_share_pct}
            onChange={(e) => handleChange('production_share_pct', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Global market share (0–100%)</span>
          {errors.production_share_pct && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.production_share_pct}</span>}
        </div>

        {/* Reserves */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">RESERVES (t)</label>
          <input
            type="number"
            value={formData.reserves_tonnes}
            onChange={(e) => handleChange('reserves_tonnes', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Total known viable reserves</span>
          {errors.reserves_tonnes && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.reserves_tonnes}</span>}
        </div>

        {/* Years of Reserves */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">YEARS OF RESERVES</label>
          <input
            type="number"
            value={formData.years_of_reserves}
            onChange={(e) => handleChange('years_of_reserves', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Reserve coverage ratio</span>
          {errors.years_of_reserves && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.years_of_reserves}</span>}
        </div>

        {/* Refined Share */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">REFINED SHARE (%)</label>
          <input
            type="number"
            value={formData.refined_share_pct}
            onChange={(e) => handleChange('refined_share_pct', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Global processing share (0–100%)</span>
          {errors.refined_share_pct && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.refined_share_pct}</span>}
        </div>

        {/* Current Price */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">CURRENT PRICE ($/t)</label>
          <input
            type="number"
            value={formData.price_usd_per_tonne}
            onChange={(e) => handleChange('price_usd_per_tonne', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Market price in USD/tonne</span>
          {errors.price_usd_per_tonne && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.price_usd_per_tonne}</span>}
        </div>

        {/* Demand Growth */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">DEMAND GROWTH (%)</label>
          <input
            type="number"
            value={formData.demand_growth_pct}
            onChange={(e) => handleChange('demand_growth_pct', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Annual demand change %</span>
        </div>

        {/* Export Control Active Toggle */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">EXPORT CONTROL</label>
          <div className="flex items-center space-x-2 bg-[#EDECE7] p-1.5 rounded-lg border border-[#111111]/30">
            <button
              type="button"
              onClick={() => handleChange('export_control_active', 0)}
              className={`flex-1 py-1 text-xs font-bold rounded ${formData.export_control_active === 0 ? 'bg-white shadow text-[#111111]' : 'text-[#111111]/50'}`}
            >
              OFF
            </button>
            <button
              type="button"
              onClick={() => handleChange('export_control_active', 1)}
              className={`flex-1 py-1 text-xs font-bold rounded ${formData.export_control_active === 1 ? 'bg-[#FF2AA1] text-white shadow' : 'text-[#111111]/50'}`}
            >
              ON
            </button>
          </div>
          <span className="text-[9px] text-[#111111]/50 block mt-1">Trade restrictions status</span>
        </div>

        {/* HHI */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">HHI INDEX (0.00–1.00)</label>
          <input
            type="number"
            step="0.01"
            value={formData.hhi}
            onChange={(e) => handleChange('hhi', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Market concentration index</span>
          {errors.hhi && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.hhi}</span>}
        </div>

        {/* Top Country Share */}
        <div>
          <label className="font-bold text-[#111111] block mb-1">TOP PRODUCER SHARE (%)</label>
          <input
            type="number"
            value={formData.top_country_share_pct}
            onChange={(e) => handleChange('top_country_share_pct', e.target.value)}
            className="w-full bg-[#EDECE7] border border-[#111111]/30 rounded-lg px-3 py-2 font-bold text-[#111111]"
          />
          <span className="text-[9px] text-[#111111]/50 block mt-1">Share of dominant producer</span>
          {errors.top_country_share_pct && <span className="text-[#FF2AA1] text-[10px] font-bold block mt-1">{errors.top_country_share_pct}</span>}
        </div>
      </div>

      {/* Submit & Reset Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#111111]/15">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#EDECE7] text-[#111111] font-mono font-bold text-xs hover:bg-[#111111]/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>RESET INPUTS</span>
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-[#111111] text-white font-mono font-bold text-xs hover:bg-[#FF2AA1] transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{loading ? 'EXECUTING MODEL...' : 'RUN MODEL →'}</span>
        </button>
      </div>
    </form>
  );
}
