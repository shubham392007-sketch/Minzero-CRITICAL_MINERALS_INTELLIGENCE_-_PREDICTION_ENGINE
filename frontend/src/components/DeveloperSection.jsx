import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const GmailIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function DeveloperSection() {
  const contactLinks = [
    {
      name: 'GITHUB',
      url: 'https://github.com/shubham392007-sketch',
      icon: GithubIcon,
      external: true
    },
    {
      name: 'INSTAGRAM',
      url: 'https://www.instagram.com/shubhamofficial_2007/',
      icon: InstagramIcon,
      external: true
    },
    {
      name: 'LINKEDIN',
      url: 'https://www.linkedin.com/in/shubham-pokale-94030b37a',
      icon: LinkedinIcon,
      external: true
    },
    {
      name: 'GMAIL',
      url: 'mailto:shubham392007@gmail.com',
      icon: GmailIcon,
      external: false
    },
    {
      name: 'X',
      url: 'https://x.com/SHUBHAM392007',
      icon: XIcon,
      external: true
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-24 mb-12 select-none">
      {/* Editorial Section Header */}
      <div className="border-t-2 border-[#111111] pt-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#111111]">
          SECTION 06 // CREDITS & CONTACT
        </span>
        <span className="font-mono text-[11px] font-semibold text-[#111111]/60 uppercase tracking-tight">
          INDEPENDENT ML ENGINEERING & EDITORIAL APPLICATION
        </span>
      </div>

      {/* Two Overlapping Physical Cards Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-stretch">
        
        {/* CARD 1: DEVELOPER IDENTITY CARD (Chartreuse / Cream, 6 Cols) */}
        <div className="lg:col-span-6 physical-card physical-card-dashed-hover rotate-card-1 bg-[#E4FF5B] text-[#111111] p-8 sm:p-10 md:p-12 border border-[#111111]/20 flex flex-col justify-between space-y-8 z-10">
          <div>
            {/* Small Top Badge */}
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#111111]" />
              <span>BUILT BY SHUBHAM POKALE</span>
            </div>

            {/* Title */}
            <span className="text-xs font-mono font-bold uppercase tracking-widest block opacity-70 mb-2">
              DEVELOPER
            </span>
            <h2 className="font-display text-6xl sm:text-7xl md:text-8xl uppercase tracking-tight leading-[0.84] text-[#111111]">
              SHUBHAM
              <br />
              POKALE
            </h2>
          </div>

          {/* Bottom Specialty Details */}
          <div className="pt-6 border-t border-[#111111]/20 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#111111]/60 block">
              SPECIALIZATION
            </span>
            <p className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#111111] leading-relaxed">
              AI/ML ENGINEERING · MACHINE LEARNING · WEB DEVELOPMENT
            </p>
          </div>
        </div>

        {/* CARD 2: CONTACT CARD (Sky Blue / White, 6 Cols) */}
        <div className="lg:col-span-6 physical-card physical-card-dashed-hover rotate-card-2 bg-[#4FC3F7] text-[#111111] p-8 sm:p-10 md:p-12 border border-[#111111]/20 flex flex-col justify-between space-y-8 z-20">
          <div>
            {/* Header */}
            <span className="text-xs font-mono font-bold uppercase tracking-widest block opacity-70 mb-2">
              CONNECT
            </span>
            <h2 className="font-display text-5xl sm:text-6xl uppercase tracking-tight leading-[0.88] text-[#111111] mb-6">
              LET'S CONNECT
            </h2>

            {/* Contact Links List */}
            <div className="space-y-2.5">
              {contactLinks.map((link) => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target={link.external ? "_blank" : "_self"}
                    rel={link.external ? "noopener noreferrer" : ""}
                    className="group flex items-center justify-between p-3 sm:p-3.5 bg-white/80 hover:bg-white text-[#111111] rounded-xl border border-[#111111]/15 transition-all duration-200 hover:translate-x-1.5 focus:outline-none focus:ring-2 focus:ring-[#111111]"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center transition-transform group-hover:scale-110">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase group-hover:underline">
                        {link.name}
                      </span>
                    </div>

                    <ArrowUpRight className="w-4 h-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                  </a>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] font-mono font-semibold uppercase tracking-wider opacity-70 pt-2">
            AVAILABLE FOR CONSULTING & TECHNICAL ADVISORY
          </p>
        </div>

      </div>
    </section>
  );
}
