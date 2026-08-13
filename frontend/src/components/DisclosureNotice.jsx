import React from 'react';

export default function DisclosureNotice() {
  return (
    <footer className="w-full py-8 mt-12 border-t border-[#111111]/15 text-xs font-mono text-[#111111] px-6 max-w-6xl mx-auto space-y-4">
      {/* 3-Column Editorial Footer Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 font-bold uppercase tracking-wider text-[11px]">
        <div className="text-[#111111]/80">
          © 2026 MINZERO
        </div>
        <div className="text-[#111111]">
          BUILT BY{' '}
          <a
            href="https://github.com/shubham392007-sketch"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-[#FF2AA1] decoration-2 hover:text-[#FF2AA1] transition-colors"
          >
            SHUBHAM POKALE
          </a>
        </div>
        <div className="text-[#111111]/70">
          MZ · v1.0.0
        </div>
      </div>

      {/* Synthetic Disclaimer Banner */}
      <div className="pt-3 border-t border-[#111111]/10 flex items-center justify-center text-[10px] text-[#111111]/60 font-semibold tracking-tight text-center">
        <span className="text-[#FF2AA1] mr-1.5">✦</span>
        <span>SYNTHETIC DATA. MODEL OUTPUT. NOT A REAL-WORLD FORECAST.</span>
      </div>
    </footer>
  );
}
