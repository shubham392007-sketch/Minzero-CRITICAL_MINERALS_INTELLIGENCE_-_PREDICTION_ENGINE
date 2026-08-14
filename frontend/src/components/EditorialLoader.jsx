import React, { useState, useEffect } from 'react';
import { Cpu, Activity } from 'lucide-react';

export default function EditorialLoader({ modelTitle = "MODEL INFERENCE" }) {
  const steps = [
    "01 // VALIDATING PARAMETERS & BOUNDS",
    "02 // ENGINEERING 27 TEMPORAL LAG & RATIO FEATURES",
    "03 // EXECUTING MODEL INFERENCE",
    "04 // GENERATING SHAP EXPLANATIONS & INSIGHTS"
  ];

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="w-full physical-card p-10 bg-white border border-[#111111]/20 my-8 select-none">
      <div className="flex items-center space-x-3 text-xs font-mono font-bold uppercase tracking-wider text-[#FF2AA1] mb-6">
        <Activity className="w-4 h-4 animate-spin" />
        <span>RUNNING {modelTitle}</span>
      </div>

      <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-tight text-[#111111] mb-8">
        EXECUTING ML PIPELINE...
      </h2>

      <div className="space-y-4 font-mono text-xs sm:text-sm font-bold">
        {steps.map((step, idx) => {
          const isDone = idx < activeStep;
          const isCurrent = idx === activeStep;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                isCurrent
                  ? 'bg-[#111111] text-white border-[#111111] shadow-md scale-[1.01]'
                  : isDone
                  ? 'bg-[#EDECE7] text-[#111111]/80 border-[#111111]/15'
                  : 'bg-white text-[#111111]/30 border-dashed border-[#111111]/20'
              }`}
            >
              <span>{step}</span>
              <span>
                {isCurrent ? (
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF2AA1] animate-ping" />
                ) : isDone ? (
                  <span className="text-emerald-500 font-bold">✓</span>
                ) : (
                  <span>◦</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
