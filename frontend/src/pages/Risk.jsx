import React, { useState } from 'react';
import { api } from '../services/api';
import ModelInputForm from '../components/ModelInputForm';
import EditorialLoader from '../components/EditorialLoader';
import ModelTransparency from '../components/ModelTransparency';
import RecentPredictions from '../components/RecentPredictions';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';

export default function Risk({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePredict = async (payload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.predictRisk(payload);
      setPrediction(res);

      const newRecord = {
        modelType: 'SUPPLY RISK',
        mineral: payload.mineral,
        country: payload.country,
        resultSummary: `${res.predicted_supply_risk_score} / 100`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullResponse: res
      };
      setRecentList(prev => [newRecord, ...prev.filter(p => p.mineral !== payload.mineral || p.country !== payload.country)]);
    } catch (err) {
      console.error("Risk prediction error:", err);
      setErrorMsg("Minzero could not generate a prediction. Check the model service and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6 select-none">
      {/* Top Back Nav */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-[#111111]/70 hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO MODULE HUB</span>
      </button>

      {/* Hero Header */}
      <div>
        <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-[#111111] leading-none">
          SUPPLY RISK PREDICTION
        </h1>
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
          ESTIMATE THE ANALYTICAL SUPPLY-RISK SCORE FOR A MINERAL–COUNTRY SUPPLY CHAIN.
        </p>
      </div>

      {errorMsg && (
        <div className="physical-card p-5 bg-red-50 border border-red-300 text-red-800 text-xs font-mono font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="underline">DISMISS</button>
        </div>
      )}

      {loading ? (
        <EditorialLoader modelTitle="SUPPLY RISK MODEL (XGBOOST REGRESSOR)" />
      ) : !prediction ? (
        <ModelInputForm
          modelType="risk"
          onSubmit={handlePredict}
          loading={loading}
        />
      ) : (
        <div className="space-y-6">
          {/* Main Risk Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Card: Risk Score & Category (Sky Blue) */}
            <div className="md:col-span-6 physical-card p-8 bg-[#4FC3F7] border border-[#111111]/20 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
                  SUPPLY RISK SCORE
                </span>

                <div className="font-mono text-6xl sm:text-7xl font-bold tracking-tighter text-[#111111] mt-2">
                  {prediction.predicted_supply_risk_score} <span className="text-2xl font-normal opacity-60">/ 100</span>
                </div>

                <div className="mt-3">
                  <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
                    prediction.risk_category.toUpperCase() === 'CRITICAL' ? 'badge-editorial-critical' :
                    prediction.risk_category.toUpperCase() === 'HIGH' ? 'badge-editorial-high' :
                    prediction.risk_category.toUpperCase() === 'ELEVATED' ? 'badge-editorial-elevated' : 'badge-editorial-low'
                  }`}>
                    {prediction.risk_category}
                  </span>
                </div>
              </div>

              {/* Horizontal Risk Scale Visualization */}
              <div className="space-y-2">
                <div className="flex justify-between text-[9px] font-mono font-bold text-[#111111]/80">
                  <span>0 LOW</span>
                  <span>30 MOD</span>
                  <span>50 ELEV</span>
                  <span>70 HIGH</span>
                  <span>85 CRIT</span>
                </div>
                <div className="relative w-full bg-white/60 h-3 rounded-full overflow-hidden border border-[#111111]/20">
                  <div
                    className="bg-[#111111] h-full transition-all duration-700"
                    style={{ width: `${Math.min(prediction.predicted_supply_risk_score, 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => onNavigate('mineral', prediction.mineral)}
                className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-[#111111] hover:underline pt-2"
              >
                <span>VIEW {prediction.mineral.toUpperCase()} / {prediction.country.toUpperCase()} HISTORY</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Card: Risk Drivers & Factors (White) */}
            <div className="md:col-span-6 physical-card p-8 bg-white border border-[#111111]/20 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-display text-3xl uppercase tracking-tight text-[#111111] mb-4">
                  TOP RISK DRIVERS
                </h3>

                <div className="space-y-3 font-mono text-xs text-[#111111]">
                  {prediction.top_risk_drivers && prediction.top_risk_drivers.length > 0 ? (
                    prediction.top_risk_drivers.map((d, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span className="uppercase">{d.feature.replace(/_/g, ' ')}</span>
                          <span>{d.score.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-[#EDECE7] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#FF2AA1] h-full"
                            style={{ width: `${Math.min(Math.abs(d.score) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="opacity-70">Risk driver weights calculated by XGBoost regressor</div>
                  )}
                </div>
              </div>

              <p className="text-[10px] font-mono text-[#111111]/60 uppercase">
                PREDICTED SCORE • RISK CATEGORY • R² = 0.8981 (MAE = 4.95)
              </p>
            </div>

          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPrediction(null)}
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white font-mono font-bold text-xs hover:bg-[#FF2AA1] transition-all shadow-md"
            >
              ← MODIFY INPUTS / RUN AGAIN
            </button>
          </div>

          <ModelTransparency
            modelName="XGBoost Regressor (Optuna Tuned)"
            primaryMetric="R² 0.8981 (MAE 4.95)"
            trainingPeriod="2015–2020"
            testPeriod="2024–2025"
            modelVersion="v1.0.0"
            specificWarning="Supply-risk predictions estimate the synthetic analytical index used by this dataset. It is not a real-world geopolitical risk forecast."
          />
        </div>
      )}

      <RecentPredictions predictions={recentList} onSelect={(item) => setPrediction(item.fullResponse)} />
    </div>
  );
}
