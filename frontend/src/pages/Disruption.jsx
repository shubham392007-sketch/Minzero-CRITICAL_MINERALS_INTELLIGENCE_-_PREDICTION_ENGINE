import React, { useState } from 'react';
import { api } from '../services/api';
import ModelInputForm from '../components/ModelInputForm';
import EditorialLoader from '../components/EditorialLoader';
import ModelTransparency from '../components/ModelTransparency';
import RecentPredictions from '../components/RecentPredictions';
import { ArrowLeft, ExternalLink, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Disruption({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePredict = async (payload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Send inputs to backend FastAPI model endpoint
      const res = await api.predictDisruption(payload);
      setPrediction(res);

      // Add to recent predictions history
      const newRecord = {
        modelType: 'DISRUPTION',
        mineral: payload.mineral,
        country: payload.country,
        resultSummary: res.disruption_probability_pct,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullResponse: res
      };
      setRecentList(prev => [newRecord, ...prev.filter(p => p.mineral !== payload.mineral || p.country !== payload.country)]);
    } catch (err) {
      console.error("Disruption prediction error:", err);
      setErrorMsg("Minzero could not generate a prediction. Check the model service and try again.");
    } finally {
      setLoading(false);
    }
  };

  const isLowRisk = prediction && (prediction.disruption_probability < 0.25 || prediction.predicted_disruption === 0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 space-y-6 select-none">
      {/* Top Back Navigation */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold uppercase text-[#111111]/70 hover:text-[#111111] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>BACK TO MODULE HUB</span>
      </button>

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-display text-5xl sm:text-7xl uppercase tracking-tight text-[#111111] leading-none">
          SUPPLY DISRUPTION PREDICTION
        </h1>
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
          PREDICT THE PROBABILITY OF A SUPPLY DISRUPTION NEXT YEAR.
        </p>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="physical-card p-5 bg-red-50 border border-red-300 text-red-800 text-xs font-mono font-bold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="underline">DISMISS</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <EditorialLoader modelTitle="SUPPLY DISRUPTION MODEL (XGBOOST CLASSIFIER)" />
      ) : !prediction ? (
        /* Input Form View */
        <ModelInputForm
          modelType="disruption"
          onSubmit={handlePredict}
          loading={loading}
        />
      ) : (
        /* Real Prediction Result View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Result Card: Probability & Risk Level (White) */}
            <div className="md:col-span-6 physical-card p-8 bg-white border border-[#111111]/20 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/60 block">
                    DISRUPTION PROBABILITY
                  </span>
                  <span className="text-[10px] font-mono font-bold text-[#111111]/50 uppercase">
                    {prediction.mineral} • {prediction.country} ({prediction.year})
                  </span>
                </div>
                
                {/* Real Model Probability Output */}
                <div className="font-mono text-6xl sm:text-7xl font-bold tracking-tighter text-[#111111] mt-2">
                  {prediction.disruption_probability_pct}
                </div>

                <div className="mt-3 flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase border ${
                    prediction.risk_level.includes('CRITICAL') ? 'bg-red-100 text-red-800 border-red-300' :
                    prediction.risk_level.includes('HIGH') ? 'bg-orange-100 text-orange-800 border-orange-300' :
                    prediction.risk_level.includes('ELEVATED') ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    'bg-green-100 text-green-800 border-green-300'
                  }`}>
                    {prediction.risk_level}
                  </span>
                </div>

                <div className="mt-4 flex items-center space-x-2 text-xs font-mono font-semibold">
                  {prediction.predicted_disruption === 1 ? (
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                  )}
                  <span>PREDICTION: <strong className="uppercase">{prediction.predicted_disruption === 1 ? 'LIKELY DISRUPTION' : 'NO DISRUPTION'}</strong></span>
                </div>
              </div>

              {/* Large Probability Visualization Meter */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono font-bold text-[#111111]/60">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
                <div className="relative w-full bg-[#EDECE7] h-4 rounded-full overflow-hidden border border-[#111111]/20">
                  <div
                    className={`h-full transition-all duration-700 ${isLowRisk ? 'bg-green-500' : 'bg-[#FF2AA1]'}`}
                    style={{ width: `${Math.max(prediction.disruption_probability * 100, 4)}%` }}
                  />
                </div>
              </div>

              {/* Context Action */}
              <button
                onClick={() => onNavigate('mineral', prediction.mineral)}
                className="inline-flex items-center space-x-1.5 text-xs font-mono font-bold text-[#111111] hover:text-[#FF2AA1] transition-colors pt-2"
              >
                <span>VIEW {prediction.mineral.toUpperCase()} / {prediction.country.toUpperCase()} HISTORY</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Card: What Moved The Model? (Sky Blue) */}
            <div className="md:col-span-6 physical-card p-8 bg-[#4FC3F7] border border-[#111111]/20 flex flex-col justify-between space-y-6">
              <div>
                <h3 className="font-display text-3xl uppercase tracking-tight text-[#111111] mb-4">
                  WHAT MOVED THE MODEL?
                </h3>

                {/* Real Model Contributing Features */}
                <div className="space-y-2.5 text-xs font-mono font-semibold text-[#111111]">
                  {prediction.top_contributing_features && prediction.top_contributing_features.length > 0 ? (
                    prediction.top_contributing_features.map((f, i) => {
                      const displayScore = isLowRisk
                        ? `${(f.score * 100).toFixed(0)}% WEIGHT`
                        : `${f.score >= 0 ? '+' : ''}${f.score.toFixed(2)}`;

                      const impactLabel = isLowRisk
                        ? "STABILIZING FACTOR"
                        : f.impact ? f.impact.toUpperCase() : "RISK DRIVER";

                      return (
                        <div key={i} className="flex justify-between items-center bg-white/80 p-3 rounded-lg border border-[#111111]/10">
                          <div>
                            <span className="uppercase block font-bold">{f.feature.replace(/_/g, ' ')}</span>
                            <span className="text-[9px] text-[#111111]/60 block font-semibold">{impactLabel}</span>
                          </div>
                          <span className="font-bold text-[#111111] bg-[#EDECE7] px-2 py-1 rounded text-[11px]">{displayScore}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="bg-white/70 p-3 rounded-lg text-center opacity-70">
                      Feature importances computed from XGBoost model
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[10px] font-mono text-[#111111]/80 uppercase tracking-tight">
                CONTRIBUTED TO PREDICTION ⓘ (FEATURE IMPORTANCE IS NON-CAUSAL)
              </p>
            </div>

          </div>

          {/* Action Controls: Modify Inputs & Run Again */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => setPrediction(null)}
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white font-mono font-bold text-xs hover:bg-[#FF2AA1] transition-all shadow-md"
            >
              ← MODIFY INPUTS / RUN AGAIN
            </button>
          </div>

          {/* Model Transparency Section */}
          <ModelTransparency
            modelName="XGBoost Classifier (Optuna Tuned)"
            primaryMetric="PR-AUC 0.812 (ROC-AUC 0.901)"
            trainingPeriod="2015–2020"
            testPeriod="2024–2025"
            modelVersion="v1.0.0"
            specificWarning="Disruption probability is a machine-learning output, not a prediction of an actual geopolitical event."
          />
        </div>
      )}

      {/* Recent Predictions History */}
      <RecentPredictions predictions={recentList} onSelect={(item) => setPrediction(item.fullResponse)} />
    </div>
  );
}
