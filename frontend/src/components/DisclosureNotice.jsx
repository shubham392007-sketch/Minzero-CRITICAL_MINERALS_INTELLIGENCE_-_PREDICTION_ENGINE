import React from 'react';

export default function DisclosureNotice() {
  return (
    <footer className="w-full py-6 mt-12 border-t border-[#111111]/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#111111]/60 px-6 max-w-6xl mx-auto">
      <div className="flex items-center space-x-2">
        <span className="text-[#FF2AA1]">✦</span>
        <span className="font-semibold uppercase tracking-wider">
          SYNTHETIC DATA. MODEL OUTPUT. NOT A REAL-WORLD FORECAST.
        </span>
      </div>

      <div className="mt-2 sm:mt-0 font-sans text-[#111111]/40">
        © 2026 MINZERO • V1.0.0
      </div>
    </footer>
  );
}
