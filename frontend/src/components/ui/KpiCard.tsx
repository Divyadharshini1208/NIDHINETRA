import React, { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: 'navy' | 'saffron' | 'green' | 'amber' | 'red';
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = 'navy',
  className = '',
}: KpiCardProps) {
  const accentBorders = {
    navy: 'border-l-4 border-l-gov-navy-800',
    saffron: 'border-l-4 border-l-gov-saffron',
    green: 'border-l-4 border-l-gov-green',
    amber: 'border-l-4 border-l-amber-500',
    red: 'border-l-4 border-l-red-600',
  };

  const iconColors = {
    navy: 'bg-gov-navy-50 text-gov-navy-800 border-gov-navy-200',
    saffron: 'bg-orange-50 text-gov-saffron-dark border-orange-200',
    green: 'bg-green-50 text-gov-green-dark border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 shadow-2xs transition hover:shadow-xs ${accentBorders[accentColor]} ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <h4 suppressHydrationWarning className="text-xl sm:text-2xl font-black text-gov-navy-900 mt-0.5 tracking-tight">{value}</h4>

          {subtext && <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtext}</p>}

          {trend && (
            <div className="flex items-center mt-1.5 text-xs font-semibold">
              {trend.isPositive ? (
                <span className="text-gov-green flex items-center">
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  {trend.value}
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  {trend.value}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`p-2 rounded-md border flex-shrink-0 ${iconColors[accentColor]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
