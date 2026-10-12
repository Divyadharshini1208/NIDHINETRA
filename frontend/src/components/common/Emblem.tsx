import React from 'react';

interface EmblemProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Emblem({ size = 'md', showText = true }: EmblemProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Ashoka Lion Emblem Graphic SVG Representation */}
      <div className={`relative flex-shrink-0 ${sizeClasses[size]}`} style={{ width: size === 'sm' ? 32 : size === 'lg' ? 64 : 44, height: size === 'sm' ? 32 : size === 'lg' ? 64 : 44 }}>
        <svg viewBox="0 0 100 120" width={size === 'sm' ? 32 : size === 'lg' ? 64 : 44} height={size === 'sm' ? 32 : size === 'lg' ? 64 : 44} className="w-full h-full text-gov-navy-800" fill="currentColor">
          {/* Base Pedestal */}
          <path d="M20,105 L80,105 L75,115 L25,115 Z" fill="#0A2540" />
          <rect x="28" y="98" width="44" height="7" rx="2" fill="#0A2540" />
          {/* Ashoka Chakra Wheel */}
          <circle cx="50" cy="101.5" r="3" fill="#E65100" />
          {/* Pedestal Bull & Horse */}
          <circle cx="36" cy="101.5" r="1.5" fill="#138808" />
          <circle cx="64" cy="101.5" r="1.5" fill="#138808" />
          {/* Lion Body and Center Pillar */}
          <path d="M42,98 L58,98 L56,60 L44,60 Z" fill="#0A2540" />
          {/* Center Lion Head */}
          <path d="M40,30 Q50,22 60,30 Q65,42 58,58 L42,58 Q35,42 40,30 Z" fill="#0A2540" />
          {/* Left Lion Head */}
          <path d="M28,36 Q38,28 42,42 Q40,56 32,56 Q24,50 28,36 Z" fill="#0F3A66" />
          {/* Right Lion Head */}
          <path d="M72,36 Q62,28 58,42 Q60,56 68,56 Q76,50 72,36 Z" fill="#0F3A66" />
          {/* Lion Manes & Crowns */}
          <path d="M46,24 Q50,18 54,24 L52,28 L48,28 Z" fill="#C59B27" />
          <path d="M33,32 Q36,26 39,32 Z" fill="#C59B27" />
          <path d="M67,32 Q64,26 61,32 Z" fill="#C59B27" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col border-l border-slate-300 pl-3">
          <span className="text-[11px] font-medium tracking-tight text-slate-600 leading-tight">
            भारत सरकार | Government of India
          </span>
          <span className="text-xs font-bold text-gov-navy-900 leading-tight">
            सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Ministry of Statistics & Programme Implementation (MoSPI)
          </span>
        </div>
      )}
    </div>
  );
}
