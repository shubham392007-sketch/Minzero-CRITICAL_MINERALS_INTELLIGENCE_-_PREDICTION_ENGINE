import React from 'react';

export default function StackedCard({
  bgColor,
  textColor = '#111111',
  rotationClass = 'rotate-card-1',
  indexNum = '000',
  indexLabel = '',
  titleLine1,
  titleLine2,
  subtitle,
  onClick,
  sparklineType = 'line',
  widget = null
}) {
  return (
    <div
      onClick={onClick}
      style={{ backgroundColor: bgColor, color: textColor }}
      className={`physical-card physical-card-dashed-hover ${rotationClass} cursor-pointer p-8 md:p-10 md:px-14 border border-[#111111]/15 -mb-6 md:-mb-8 select-none z-10 transition-all`}
    >
      <div className="flex items-start justify-between">
        {/* Left Title & Subtitle */}
        <div>
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl uppercase tracking-tight leading-[0.88] text-[#111111]">
            {titleLine1}
            <br />
            {titleLine2}
          </h2>
          <p className="text-xs font-mono uppercase font-bold tracking-wider mt-4 text-[#111111]/80">
            {subtitle}
          </p>
        </div>

        {/* Right Index Number & Sparkline / Widget */}
        <div className="flex flex-col items-end space-y-3">
          <div className="text-right">
            <span className="font-mono text-4xl md:text-5xl font-bold tracking-tighter block text-[#111111]">
              {indexNum}
            </span>
            {indexLabel && (
              <span className="text-[10px] font-mono uppercase font-semibold text-[#111111]/70 block tracking-tight -mt-1">
                {indexLabel}
              </span>
            )}
          </div>

          {/* Mini Sparkline or Radar Widget */}
          {widget ? (
            <div className="pt-2">{widget}</div>
          ) : sparklineType === 'line' ? (
            <svg className="w-24 h-6 text-[#111111]" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M0 18 Q20 5, 40 14 T80 8 T100 4" strokeLinecap="round" />
              <circle cx="100" cy="4" r="3" fill="#111111" />
            </svg>
          ) : sparklineType === 'bars' ? (
            <div className="flex items-end space-x-1 h-6 pt-1">
              {[40, 70, 30, 90, 50, 80, 100].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="w-1.5 bg-[#111111] rounded-t-xs" />
              ))}
            </div>
          ) : (
            <svg className="w-24 h-6 text-[#111111]" viewBox="0 0 100 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M0 20 L20 16 L40 18 L60 8 L80 12 L100 4" strokeLinecap="round" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
