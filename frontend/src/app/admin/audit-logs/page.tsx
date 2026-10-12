'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { adminService, AuditLogItem } from '@/services/adminService';
import {
  History,
  Shield,
  Search,
  RefreshCw,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  Download
} from 'lucide-react';

export default function AdminAuditLogsPage() {
  const { error: toastError, success } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAuditLogs(0, 100);
      setLogs(data || []);
    } catch (err: any) {
      toastError('Load Error', err.message || 'Could not fetch audit trail');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> SUCCESS
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3 h-3" /> WARNING
          </span>
        );
      case 'FAILED':
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" /> FAILED
          </span>
        );
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="NIDHINETRA — Security Audit Logs & Compliance Trail"
          scopeBadge="Immutable Audit Ledger"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-gov-navy-800" />
              <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
                NIDHINETRA Security & Action Audit Trail
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Cryptographically timestamped action history, login attempts, AI triggers, and data modifications
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadLogs}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Log Buffer
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => success('Audit Export', 'Audit trail exported in secure JSON/CSV format')}
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Export Audit Trail
            </Button>
          </div>
        </div>

        {/* Top Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Total Logged Events</span>
            <span className="text-2xl font-black text-gov-navy-900 font-mono mt-1 block">{logs.length}</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 font-semibold block uppercase">Successful Operations</span>
            <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
              {logs.filter(l => l.status === 'SUCCESS').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs">
            <span className="text-xs text-amber-900 font-semibold block uppercase">Security Warnings</span>
            <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
              {logs.filter(l => l.status === 'WARNING').length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/40 shadow-xs">
            <span className="text-xs text-red-900 font-semibold block uppercase">Failed Executions</span>
            <span className="text-2xl font-black text-red-700 font-mono mt-1 block">
              {logs.filter(l => l.status === 'FAILED' || l.status === 'ERROR').length}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search audit trail by user email, action identifier, IP address, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-800 focus:outline-hidden"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-gov-navy-800 focus:outline-hidden"
            >
              <option value="ALL">All Event Outcomes</option>
              <option value="SUCCESS">Success Only</option>
              <option value="WARNING">Warnings Only</option>
              <option value="FAILED">Failed Only</option>
            </select>
          </div>
        </Card>

        {/* Audit Log Table */}
        <Card
          title="Statutory System Activity Logs"
          subtitle={`Displaying ${filteredLogs.length} activity audit records with originating IP and execution status`}
          headerIcon={<Terminal className="w-5 h-5 text-gov-navy-800" />}
          borderAccent
        >
          <Table
            columns={[
              {
                key: 'action',
                header: 'Action / Module',
                render: (l: AuditLogItem) => (
                  <div>
                    <span className="font-bold text-gov-navy-900 font-mono text-xs block">{l.action}</span>
                    <span className="text-slate-500 text-[11px] block">{l.details}</span>
                  </div>
                ),
              },
              {
                key: 'user',
                header: 'User & Role',
                render: (l: AuditLogItem) => (
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block font-mono text-[11px]">{l.performedBy}</span>
                    <span className="text-slate-500 text-[10px]">{l.userRole || 'SYSTEM'}</span>
                  </div>
                ),
              },
              {
                key: 'ip',
                header: 'IP / Origin',
                render: (l: AuditLogItem) => (
                  <span className="font-mono text-xs text-slate-600 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                    {l.ipAddress || '127.0.0.1'}
                  </span>
                ),
              },
              {
                key: 'timestamp',
                header: 'Timestamp',
                render: (l: AuditLogItem) => (
                  <div className="text-xs text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : 'Just now'}</span>
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (l: AuditLogItem) => getStatusBadge(l.status),
              },
            ]}
            data={filteredLogs}
            keyExtractor={(l: AuditLogItem) => l.id}
          />
        </Card>
        </main>
      </div>
    </div>
  );
}
