'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, ExternalLink, ShieldAlert, Wifi, WifiOff } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { RiskNotificationItem } from '@/types';
import { useToast } from '@/context/ToastContext';

export function NotificationBell() {
  const router = useRouter();
  const { warning: toastWarning } = useToast();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<RiskNotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const [count, page] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getNotifications(0, 8),
      ]);
      setUnreadCount(count);
      setNotifications(page?.content || []);
    } catch {
      // Ignore background load failures
    }
  };

  useEffect(() => {
    loadNotifications();

    // Subscribe to real-time Server-Sent Events (SSE)
    const disconnect = notificationService.connectSseStream(
      (newAlert) => {
        setUnreadCount((prev) => prev + 1);
        setNotifications((prev) => [newAlert, ...prev.slice(0, 15)]);
        toastWarning(
          `Real-Time Alert: ${newAlert.title}`,
          `${newAlert.projectCode}: ${newAlert.message}`
        );
      },
      () => setIsConnected(true),
      () => setIsConnected(false)
    );

    return () => disconnect();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read', err);
    }
  };

  const handleItemClick = async (item: RiskNotificationItem) => {
    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {}
    }
    setIsOpen(false);
    if (item.projectId) {
      router.push(`/projects/${item.projectId}`);
    } else {
      router.push('/alerts');
    }
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 text-slate-500 hover:text-gov-navy-900 hover:bg-slate-100 rounded-md transition focus:outline-hidden"
        title="Real-Time Risk Alerts & Notifications"
        aria-label="View risk alerts"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800">
          {/* Header */}
          <div className="px-3.5 py-2.5 bg-gov-navy-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold tracking-tight">Risk Telemetry Stream</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-semibold flex items-center gap-1 ${
                  isConnected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {isConnected ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
                {isConnected ? 'LIVE' : 'POLLING'}
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 underline underline-offset-2"
              >
                <CheckCheck className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* Alert List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No active risk notifications in jurisdiction.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 flex gap-2.5 items-start ${
                    !n.isRead ? 'bg-amber-50/50' : ''
                  }`}
                >
                  {/* Severity indicator */}
                  <span
                    className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      n.severity === 'CRITICAL'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : n.severity === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {n.severity}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gov-navy-900 truncate max-w-[180px]">
                        {n.projectCode || 'MPLADS Work'}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTimestamp(n.createdAt)}
                      </span>
                    </div>

                    <p className="font-semibold text-slate-800 text-[11px] mt-0.5 truncate">
                      {n.title}
                    </p>
                    <p className="text-slate-600 text-[11px] line-clamp-2 mt-0.5 leading-snug">
                      {n.message}
                    </p>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Mark as read"
                      className="shrink-0 p-1 text-slate-400 hover:text-gov-navy-800 rounded"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px]">
            <Link
              href="/alerts"
              onClick={() => setIsOpen(false)}
              className="text-gov-navy-800 hover:text-gov-navy-900 font-bold flex items-center gap-1"
            >
              Open Complete Anomaly Ledger <ExternalLink className="w-3 h-3" />
            </Link>
            <span className="text-[10px] text-slate-400">Statutory Decision Support</span>
          </div>
        </div>
      )}
    </div>
  );
}
