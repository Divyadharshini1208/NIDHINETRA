import React from 'react';
import { NidhiNetraLogo } from './NidhiNetraLogo';
import { BRAND } from '@/config/branding';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-[#071A2E] text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Two horizontally aligned columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pb-5 border-b border-slate-800 items-center">
          {/* Left column — Portal Information */}
          <div className="space-y-2">
            <NidhiNetraLogo
              size="md"
              variant="dark"
              showText={true}
              showSubtitle={true}
              subtitleText={BRAND.subtitle}
            />
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              <span className="text-amber-400 font-semibold">{BRAND.tagline}</span>{' '}
              {BRAND.purpose}
            </p>
          </div>

          {/* Right column — Developer Information */}
          <div className="pt-4 md:pt-0 border-t border-slate-800/60 md:border-t-0 md:border-l md:border-slate-800 md:pl-8 flex flex-col justify-center space-y-1">
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {BRAND.developer.label}
            </span>
            <span className="text-sm font-semibold text-white">
              {BRAND.developer.name}
            </span>
            <a
              href={`mailto:${BRAND.developer.email}`}
              className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors group mt-0.5"
            >
              <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-colors" />
              <span className="hover:underline">{BRAND.developer.email}</span>
            </a>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>Ministry of Statistics &amp; Programme Implementation (MoSPI)</span>
          <span>© 2026 NIDHINETRA Platform</span>
        </div>
      </div>
    </footer>
  );
}
