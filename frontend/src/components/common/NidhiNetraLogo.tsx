import React from 'react';
import { BRAND } from '@/config/branding';

interface NidhiNetraLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark'; // 'light' is dark text on light background; 'dark' is white text on dark background
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleText?: string;
  className?: string;
}

export function NidhiNetraLogo({
  size = 'md',
  variant = 'light',
  showText = true,
  showSubtitle = true,
  subtitleText,
  className = '',
}: NidhiNetraLogoProps) {
  const iconDimensions = {
    xs: { width: 22, height: 22 },
    sm: { width: 30, height: 30 },
    md: { width: 38, height: 38 },
    lg: { width: 48, height: 48 },
    xl: { width: 60, height: 60 },
  };

  const titleSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const subtitleSizes = {
    xs: 'text-[8px]',
    sm: 'text-[9px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-xs',
  };

  const { width, height } = iconDimensions[size];
  const isDark = variant === 'dark';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Eye / Vision Intelligence Mark ("Netra" + "Nidhi") */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-lg shadow-2xs transition-transform"
        style={{ width, height }}
      >
        <svg
          viewBox="0 0 48 48"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Rounded Container / Shield Base */}
          <rect
            x="2"
            y="2"
            width="44"
            height="44"
            rx="10"
            fill={isDark ? '#0F2C4C' : '#0A2540'}
            stroke={isDark ? '#1E4976' : '#14385C'}
            strokeWidth="1.5"
          />

          {/* Eye Outline (Netra) - Smooth vision contours */}
          <path
            d="M8 24C12.5 16.5 18 12.5 24 12.5C30 12.5 35.5 16.5 40 24C35.5 31.5 30 35.5 24 35.5C18 35.5 12.5 31.5 8 24Z"
            stroke="#F59E0B"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Iris Ring */}
          <circle
            cx="24"
            cy="24"
            r="7"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeOpacity={0.9}
          />

          {/* Center Intelligence / Nidhi (Fund) Focus Dot */}
          <circle cx="24" cy="24" r="3.2" fill="#F59E0B" />

          {/* Upper Right Lens Glint */}
          <circle cx="26.5" cy="21.5" r="1.1" fill="#FFFFFF" />

          {/* Subtle Horizontal Telemetry Crosshair ticks */}
          <path d="M4 24H7" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity={0.6} />
          <path d="M41 24H44" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeOpacity={0.6} />
        </svg>
      </div>

      {/* Typography Section */}
      {showText && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center tracking-tight font-black">
            <span
              className={`${titleSizes[size]} ${
                isDark ? 'text-white' : 'text-gov-navy-900'
              } tracking-tight font-extrabold`}
            >
              NIDHI
            </span>
            <span
              className={`${titleSizes[size]} text-amber-500 font-black tracking-tight`}
            >
              NETRA
            </span>
          </div>

          {showSubtitle && (
            <span
              className={`${subtitleSizes[size]} font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-300' : 'text-slate-500'
              } truncate`}
            >
              {subtitleText || BRAND.subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default NidhiNetraLogo;
