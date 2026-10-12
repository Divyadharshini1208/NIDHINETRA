'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { alertService } from '@/services/alertService';
import { RiskAlert, PagedResponse } from '@/types';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { LoadingState, ErrorState, EmptyState } from '@/components/ui/StateViews';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileSpreadsheet,
  RefreshCw,
  Building2,
  FileText,
  UserCheck,
  XCircle,
  HelpCircle,
  TrendingUp,
  Layers
} from 'lucide-react';

export default function RiskAlertsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadAlerts = async () => {
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('mplads_token');
    if (!hasToken && !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await alertService.getAlerts({
        severity: selectedSeverity !== 'ALL' ? selectedSeverity : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        alertType: selectedType !== 'ALL' ? selectedType : undefined,
        search: searchQuery.trim() || undefined,
        page,
        size: pageSize,
        sort: 'detectedAt,desc',
      });
      setAlerts(data.content || []);
      setTotalElements(data.totalElements || 0);
      setTotalPages(data.totalPages || 0);
    } catch (err: any) {
      if (!err.message?.includes('Bearer token') && !err.message?.includes('authentication')) {
        setErrorMsg(err.message || 'Could not load risk alerts telemetry');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [selectedSeverity, selectedStatus, selectedType, page, pageSize, isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    loadAlerts();
  };

  const handleResetFilters = () => {
    setSelectedSeverity('ALL');
    setSelectedStatus('ALL');
    setSelectedType('ALL');
    setSearchQuery('');
    setPage(0);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 mr-1.5 animate-pulse" />
            CRITICAL RISK
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5" />
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-300">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
            NEW ALERT
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            UNDER REVIEW
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">
            INVESTIGATION ACTIVE
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            RESOLVED
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
            DISMISSED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="NIDHINETRA — Anomaly Detection & Risk Alert Registry" scopeBadge="Explainable Telemetry & Investigation Dossier" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Statutory Advisory Notice */}
          <div className="bg-amber-50 border-l-4 border-gov-saffron p-4 rounded-r-xl text-xs text-amber-950 shadow-xs flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-900 text-sm">
                  Statutory Protocol: AI Anomaly Indicators Require Human Administrative Verification
                </h4>
                <p className="text-amber-800 mt-1 leading-relaxed">
                  Flagged risk indicators represent statistical anomalies, milestone variance, or financial drawdown deviations generated by the Isolation Forest ML pipeline. An indicator is <strong>not proof of fraud</strong>. All flagged projects are queued for physical inspection by the competent authority.
                </p>
              </div>
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
              <p className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-gov-saffron" /> Active Risk Queue
              </p>
              <p className="text-2xl font-black text-gov-navy-900 mt-1 font-mono">{totalElements}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50/30 shadow-xs">
              <p className="text-xs font-semibold text-red-800 uppercase flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-600" /> Critical Severity
              </p>
              <p className="text-2xl font-black text-red-600 mt-1 font-mono">
                {alerts.filter((a) => a.severity === 'CRITICAL').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-indigo-200 bg-indigo-50/30 shadow-xs">
              <p className="text-xs font-semibold text-indigo-900 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600" /> In Investigation
              </p>
              <p className="text-2xl font-black text-indigo-700 mt-1 font-mono">
                {alerts.filter((a) => a.status === 'INVESTIGATING' || a.status === 'UNDER_REVIEW').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/30 shadow-xs">
              <p className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-gov-green" /> Resolved Cases
              </p>
              <p className="text-2xl font-black text-gov-green mt-1 font-mono">
                {alerts.filter((a) => a.status === 'RESOLVED').length}
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Project ID, title, keyword or district..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-gov-navy-600 focus:outline-none"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </form>

              {/* Multi-Filter Selects */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Severity Selector */}
                <select
                  value={selectedSeverity}
                  onChange={(e) => {
                    setSelectedSeverity(e.target.value);
                    setPage(0);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-gov-navy-600"
                >
                  <option value="ALL">All Severities</option>
                  <option value="CRITICAL">Critical Risk (80-100)</option>
                  <option value="HIGH">High Risk (60-79)</option>
                  <option value="MEDIUM">Medium Risk (30-59)</option>
                  <option value="LOW">Low Risk (0-29)</option>
                </select>

                {/* Status Selector */}
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(0);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-gov-navy-600"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New Alerts</option>
                  <option value="UNDER_REVIEW">Under Review</option>
                  <option value="INVESTIGATING">Active Investigation</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                </select>

                {/* Alert Type Selector */}
                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value);
                    setPage(0);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-gov-navy-600"
                >
                  <option value="ALL">All Anomaly Types</option>
                  <option value="PROGRESS_FINANCIAL_MISMATCH">Progress / Expenditure Mismatch</option>
                  <option value="POTENTIAL_COST_ANOMALY">Potential Cost Anomaly</option>
                  <option value="DELAY_EXCEEDED">Milestone Delay Exceeded</option>
                  <option value="PAYMENT_ANOMALY">Payment Drawdown Anomaly</option>
                </select>

                <button
                  onClick={handleResetFilters}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gov-navy-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-gov-saffron" /> Anomaly & Risk Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  Showing {alerts.length} of {totalElements} flagged records in jurisdiction
                </p>
              </div>
              <Link
                href="/ai-monitoring"
                className="text-xs font-bold text-gov-navy-800 hover:text-gov-navy-900 bg-gov-navy-50 hover:bg-gov-navy-100 border border-gov-navy-200 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
              >
                <TrendingUp className="w-3.5 h-3.5 text-gov-saffron" />
                View AI Telemetry Analytics
              </Link>
            </div>

            {isLoading ? (
              <LoadingState message="Scanning risk telemetry and anomaly registers..." />
            ) : errorMsg ? (
              <ErrorState title="Telemetry Error" description={errorMsg} onRetry={loadAlerts} />
            ) : alerts.length === 0 ? (
              <EmptyState
                title="No Risk Alerts Found"
                description="No projects currently match the active anomaly criteria or search parameters."
                actionLabel="Reset Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                      <th className="p-3.5">Alert ID & Severity</th>
                      <th className="p-3.5">Project Information</th>
                      <th className="p-3.5">Jurisdiction</th>
                      <th className="p-3.5 text-center">Risk Score</th>
                      <th className="p-3.5">Explainable AI Findings</th>
                      <th className="p-3.5 text-center">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Alert ID & Severity */}
                        <td className="p-3.5 align-top">
                          <div className="space-y-1.5">
                            <span className="font-mono text-slate-500 font-bold">#ALT-{alert.id}</span>
                            <div>{getSeverityBadge(alert.severity)}</div>
                            <span suppressHydrationWarning className="text-[10px] text-slate-400 block font-mono">
                              {alert.detectedAt ? new Date(alert.detectedAt).toLocaleDateString('en-IN') : 'Recent'}
                            </span>
                          </div>
                        </td>

                        {/* Project Info */}
                        <td className="p-3.5 align-top max-w-xs">
                          <div className="space-y-1">
                            <Link
                              href={`/projects/${alert.projectId}`}
                              className="font-bold text-gov-navy-900 hover:text-gov-navy-700 hover:underline line-clamp-2"
                            >
                              {alert.projectName}
                            </Link>
                            <p className="text-[11px] font-mono text-slate-500 font-semibold">{alert.projectCode}</p>
                            <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {alert.categoryName || 'Infrastructure'}
                            </span>
                          </div>
                        </td>

                        {/* Jurisdiction */}
                        <td className="p-3.5 align-top">
                          <p className="font-semibold text-slate-800">{alert.stateName}</p>
                          <p className="text-[11px] text-slate-500">{alert.districtName}</p>
                          {alert.assignedTo && (
                            <p className="text-[10px] text-indigo-700 font-semibold mt-1">
                              Assigned: {alert.assignedTo}
                            </p>
                          )}
                        </td>

                        {/* Risk Score */}
                        <td className="p-3.5 align-top text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`text-base font-black font-mono px-2.5 py-1 rounded-lg ${
                                (alert.riskScore || 0) >= 80
                                  ? 'bg-red-100 text-red-800'
                                  : (alert.riskScore || 0) >= 60
                                  ? 'bg-amber-100 text-amber-900'
                                  : (alert.riskScore || 0) >= 30
                                  ? 'bg-blue-100 text-blue-900'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {alert.riskScore || 50}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase">/ 100</span>
                          </div>
                        </td>

                        {/* Explainable Findings */}
                        <td className="p-3.5 align-top max-w-md">
                          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                            <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-gov-saffron shrink-0" />
                              {alert.title || 'Potential Anomaly Flagged'}
                            </p>
                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {alert.description || 'Disproportionate financial expenditure relative to certified milestone completion.'}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 align-top text-center">
                          {getStatusBadge(alert.status)}
                        </td>

                        {/* Action */}
                        <td className="p-3.5 align-top text-right">
                          <Link
                            href={`/alerts/${alert.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded-lg text-xs font-bold shadow-xs transition"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1 text-gov-saffron" />
                            Investigate
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-medium">
                  Page <strong className="text-gov-navy-900">{page + 1}</strong> of <strong className="text-gov-navy-900">{totalPages}</strong> ({totalElements} total alerts)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-md border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-md border border-slate-300 disabled:opacity-40 hover:bg-slate-100 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
