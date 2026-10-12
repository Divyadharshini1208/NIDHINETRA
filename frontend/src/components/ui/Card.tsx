import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  headerIcon?: ReactNode;
  borderAccent?: boolean;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

export function Card({
  title,
  subtitle,
  action,
  headerIcon,
  borderAccent = false,
  children,
  className = '',
  footer,
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden ${
        borderAccent ? 'border-t-4 border-t-gov-navy-800' : ''
      } ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2.5">
            {headerIcon && <div className="text-gov-navy-800">{headerIcon}</div>}
            <div>
              {title && <h3 className="font-bold text-sm text-gov-navy-900 tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div className="p-5">{children}</div>

      {footer && <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-600">{footer}</div>}
    </div>
  );
}
