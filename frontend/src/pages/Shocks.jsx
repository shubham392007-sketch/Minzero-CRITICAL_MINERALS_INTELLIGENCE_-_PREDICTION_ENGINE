import React, { useState } from 'react';
import { api } from '../services/api';
import ModelInputForm from '../components/ModelInputForm';
import EditorialLoader from '../components/EditorialLoader';
import ModelTransparency from '../components/ModelTransparency';
import RecentPredictions from '../components/RecentPredictions';
import RadarWidget from '../components/RadarWidget';
import { ArrowLeft, ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function Shocks({ onNavigate }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePredict = async (payload) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.detectShock(payload);
      setPrediction(res);

      const newRecord = {
        modelType: 'SUPPLY SHOCK',
        mineral: payload.mineral,
        country: payload.country,
        resultSummary: res.shock_severity,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullResponse: res
      };
      setRecentList(prev => [newRecord, ...prev.filter(p => p.mineral !== payload.mineral || p.country !== payload.country)]);
    } catch (err) {
      console.error("Shock detection error:", err);
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
          SUPPLY SHOCK DETECTION
        </h1>
        <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mt-2">
          DETECT ABNORMAL BEHAVIOR IN A MINERAL–COUNTRY SUPPLY CHAIN.
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
        <EditorialLoader modelTitle="SUPPLY SHOCK DETECTOR (ISOLATION FOREST)" />
      ) : !prediction ? (
        <ModelInputForm
          modelType="shock"
          onSubmit={handlePredict}
          loading={loading}
        />
      ) : (
        <div className="space-y-6">
          {/* Main Shock Output Card (Mint) */}
          <div className="physical-card p-8 bg-[#7CFFA6] border border-[#111111]/20 relative space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
                  SUPPLY SHOCK STATUS
                </span>
                <h2 className="font-display text-4xl sm:text-6xl uppercase tracking-tight text-[#111111] mt-1">
                  {prediction.mineral} • {prediction.country} • {prediction.year}
                </h2>
              </div>

              <span className={`px-3 py-1 rounded text-xs font-mono font-bold uppercase ${
                prediction.shock_severity === 'Critical' ? 'badge-editorial-critical' :
                prediction.shock_severity === 'Warning' ? 'badge-editorial-high' :
                prediction.shock_severity === 'Watch' ? 'badge-editorial-elevated' : 'badge-editorial-low'
              }`}>
                {prediction.shock_severity}
              </span>
            </div>

            {/* Anomaly Score & Radar Sensor Widget */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
              <div className="md:col-span-4">
                <span className="text-[10px] font-mono font-bold uppercase text-[#111111]/70 block">ANOMALY SCORE</span>
                <span className="font-mono text-5xl sm:text-6xl font-bold text-[#111111]">{prediction.anomaly_score}</span>
              </div>

              <div className="md:col-span-5 text-xs font-mono text-[#111111]">
                <span className="font-bold text-[#111111]/70 block uppercase text-[10px] mb-1">SHOCK TYPE</span>
                <span className="text-base font-bold text-[#111111] block mb-3 uppercase">{prediction.shock_type}</span>

                <span className="font-bold text-[#111111]/70 block uppercase text-[10px] mb-1">ANOMALY INDICATORS</span>
                <ul className="space-y-1 font-semibold">
                  {prediction.main_drivers && prediction.main_drivers.length > 0 ? (
                    prediction.main_drivers.map((d, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <span className="text-[#FF2AA1]">•</span>
                        <span>{d}</span>
                      </li>
                    ))
                  ) : (
                    <li className="opacity-70">Supply chain operating within baseline historical parameters</li>
                  )}
                </ul>
              </div>

              {/* Peeking Radar Sensor Widget */}
              <div className="md:col-span-3 flex justify-end">
                <RadarWidget />
              </div>
            </div>

            {/* Anomaly Meter Scale */}
            <div className="space-y-2 pt-4 border-t border-[#111111]/15">
              <div className="flex justify-between text-[9px] font-mono font-bold text-[#111111]/80">
                <span>NORMAL</span>
                <span>WATCH</span>
                <span>WARNING</span>
                <span>CRITICAL</span>
              </div>
              <div className="relative w-full bg-white/70 h-3 rounded-full overflow-hidden border border-[#111111]/20">
                <div
                  className="bg-[#111111] h-full transition-all duration-700"
                  style={{ width: prediction.shock_severity === 'Critical' ? '95%' : prediction.shock_severity === 'Warning' ? '70%' : prediction.shock_severity === 'Watch' ? '45%' : '15%' }}
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

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setPrediction(null)}
              className="px-5 py-2.5 rounded-xl bg-[#111111] text-white font-mono font-bold text-xs hover:bg-[#FF2AA1] transition-all shadow-md"
            >
              ← MODIFY INPUTS / RUN AGAIN
            </button>
          </div>

          <ModelTransparency
            modelName="Isolation Forest Anomaly Detector"
            primaryMetric="Contamination Rate 7.0%"
            trainingPeriod="2015–2020"
            testPeriod="2024–2025"
            modelVersion="v1.0.0"
            specificWarning="Anomalies indicate unusual patterns in the supplied dataset, not verified real-world events."
          />
        </div>
      )}

      <RecentPredictions predictions={recentList} onSelect={(item) => setPrediction(item.fullResponse)} />
    </div>
  );
}
