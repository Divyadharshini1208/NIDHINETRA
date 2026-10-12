import React from 'react';
import { ProjectStatus } from '@/types';
import { CheckCircle2, Clock, AlertCircle, FileCheck, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ProjectStatus | string;
  showIcon?: boolean;
}

export function StatusBadge({ status, showIcon = true }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'COMPLETED':
        return {
          bg: 'bg-green-50 text-gov-green-dark border-gov-green/30',
          icon: <CheckCircle2 className="w-3 h-3 text-gov-green" />,
          label: 'Completed',
        };
      case 'ONGOING':
        return {
          bg: 'bg-blue-50 text-gov-navy-800 border-gov-navy-200',
          icon: <Clock className="w-3 h-3 text-gov-navy-700" />,
          label: 'Ongoing Work',
        };
      case 'DELAYED':
        return {
          bg: 'bg-orange-50 text-gov-saffron-dark border-orange-300',
          icon: <AlertCircle className="w-3 h-3 text-gov-saffron" />,
          label: 'Delayed',
        };
      case 'SANCTIONED':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <FileCheck className="w-3 h-3 text-indigo-600" />,
          label: 'Sanctioned',
        };
      case 'PROPOSED':
      case 'SUBMITTED':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: <Clock className="w-3 h-3 text-amber-600" />,
          label: 'Submitted / Pending Review',
        };
      case 'REJECTED':
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: <AlertCircle className="w-3 h-3 text-rose-600" />,
          label: normalized === 'REJECTED' ? 'Rejected' : 'Cancelled',
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <HelpCircle className="w-3 h-3 text-slate-500" />,
          label: status,
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
