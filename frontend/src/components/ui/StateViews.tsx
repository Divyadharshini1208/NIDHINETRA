import React, { ReactNode } from 'react';
import { Loader2, Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export function LoadingState({ message = 'Loading official data telemetry...' }: { message?: string }) {
  return (
    <div className="w-full min-h-[220px] bg-white rounded-lg border border-slate-200 p-8 flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-gov-navy-800 animate-spin" />
      <p className="text-xs font-semibold text-slate-600">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = 'No records found',
  description = 'There are no active records matching the selected administrative filter.',
  action,
  actionLabel,
  onAction,
  icon,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-10 flex flex-col items-center justify-center text-center space-y-3">
      <div className="p-3 bg-slate-100 rounded-full text-slate-500">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-bold text-gov-navy-900">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm">{description}</p>
      {action ? (
        <div className="pt-2">{action}</div>
      ) : actionLabel && onAction ? (
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function ErrorState({
  title = 'Failed to load telemetry data',
  description,
  message,
  onRetry,
}: {
  title?: string;
  description?: string;
  message?: string;
  onRetry?: () => void;
}) {
  const displayMsg = description || message || 'An error occurred while communicating with the central NIDHINETRA backend service.';
  return (
    <div className="w-full bg-red-50/50 rounded-lg border border-red-200 p-8 flex flex-col items-center justify-center text-center space-y-3">
      <div className="p-3 bg-red-100 rounded-full text-red-600">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-red-900">{title}</h4>
      <p className="text-xs text-red-700 max-w-md">{displayMsg}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Connection
        </Button>
      )}
    </div>
  );
}
