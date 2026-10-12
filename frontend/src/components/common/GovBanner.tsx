'use client';

import React, { useState } from 'react';
import { Globe, Eye } from 'lucide-react';

export function GovBanner() {
  const [fontSize, setFontSize] = useState<'normal' | 'small' | 'large'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  const toggleContrast = () => {
    const isContrast = !highContrast;
    setHighContrast(isContrast);
    if (isContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const handleFontSize = (size: 'small' | 'normal' | 'large') => {
    setFontSize(size);
    if (size === 'small') {
      document.documentElement.style.fontSize = '14px';
    } else if (size === 'large') {
      document.documentElement.style.fontSize = '18px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }
  };

  return (
    <div className="w-full bg-[#F1F5F9] border-b border-slate-200 text-[10px] text-slate-700 select-none">
      {/* Tricolor National Stripe */}
      <div className="gov-tricolor-bar w-full h-[2.5px]" />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 py-0.5 flex items-center justify-between flex-wrap gap-1.5">
        {/* Left: Official Flag and Indicator */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
            <span className="inline-block w-3.5 h-2.5 bg-gradient-to-b from-[#FF9933] via-white to-[#138808] border border-slate-300 rounded-[1px] shadow-2xs"></span>
            <span>भारत सरकार | Government of India</span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="hidden md:inline text-slate-500 font-medium">
            Ministry of Statistics & Programme Implementation
          </span>
        </div>

        {/* Right: Accessibility and Language */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 text-[10px]">
          {/* Skip to Main Content */}
          <a
            href="#main-content"
            className="hidden sm:inline-block text-slate-600 hover:text-gov-navy-800 focus:outline-none px-1 py-0.2 rounded"
          >
            Skip to Content
          </a>

          <span className="text-slate-300 hidden sm:inline">|</span>

          {/* Font Resize */}
          <div className="flex items-center space-x-0.5 border border-slate-300 bg-white rounded px-1 py-0.2">
            <button
              onClick={() => handleFontSize('small')}
              className={`px-0.5 font-semibold hover:text-gov-saffron ${fontSize === 'small' ? 'text-gov-navy-900 font-bold' : 'text-slate-500'}`}
              title="Decrease Font Size"
              aria-label="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => handleFontSize('normal')}
              className={`px-0.5 font-semibold hover:text-gov-saffron ${fontSize === 'normal' ? 'text-gov-navy-900 font-bold underline' : 'text-slate-500'}`}
              title="Normal Font Size"
              aria-label="Normal Font Size"
            >
              A
            </button>
            <button
              onClick={() => handleFontSize('large')}
              className={`px-0.5 font-semibold hover:text-gov-saffron ${fontSize === 'large' ? 'text-gov-navy-900 font-bold' : 'text-slate-500'}`}
              title="Increase Font Size"
              aria-label="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* High Contrast */}
          <button
            onClick={toggleContrast}
            className={`flex items-center space-x-1 px-1.5 py-0.2 rounded border border-slate-300 bg-white hover:bg-slate-100 ${highContrast ? 'text-gov-navy-900 font-bold bg-slate-200' : 'text-slate-600'}`}
            title="Toggle High Contrast Mode"
            aria-label="Toggle High Contrast Mode"
          >
            <Eye className="w-2.5 h-2.5 text-slate-500" />
            <span className="hidden sm:inline">{highContrast ? 'Standard' : 'Contrast'}</span>
          </button>

          {/* Language Selector */}
          <button
            onClick={() => setLang(lang === 'EN' ? 'HI' : 'EN')}
            className="flex items-center space-x-1 px-1.5 py-0.2 rounded border border-slate-300 bg-white hover:bg-slate-100 text-gov-navy-900 font-semibold"
            title="Toggle Language"
            aria-label="Toggle Language"
          >
            <Globe className="w-2.5 h-2.5 text-gov-navy-700" />
            <span>{lang === 'EN' ? 'English / हिन्दी' : 'हिन्दी / English'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
