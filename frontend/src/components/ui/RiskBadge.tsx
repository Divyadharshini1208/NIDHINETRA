import React from 'react';
import { RiskLevel } from '@/types';
import { ShieldAlert, AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface RiskBadgeProps {
  riskLevel: RiskLevel | string;
  showIcon?: boolean;
}

export function RiskBadge({ riskLevel, showIcon = true }: RiskBadgeProps) {
  const normalized = (riskLevel || 'LOW').toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'ANOMALY_FLAGGED':
        return {
          bg: 'bg-red-50 text-red-800 border-red-300',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-600" />,
          label: 'Potential Anomaly (Review Required)',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 text-gov-saffron-dark border-orange-300',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-gov-saffron" />,
          label: 'High Risk Indicator',
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: <Search className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Moderate Risk (Requires Review)',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-green-50 text-gov-green-dark border-gov-green/30',
          icon: <CheckCircle className="w-3.5 h-3.5 text-gov-green" />,
          label: 'Normal Monitoring (Low Risk)',
        };
    }
  };

  const config = getStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
}
