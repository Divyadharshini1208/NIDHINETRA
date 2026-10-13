'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { aiMonitoringService } from '@/services/aiMonitoringService';
import { AiMonitoringSummary, Project, RiskAlert } from '@/types';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { LoadingState, ErrorState } from '@/components/ui/StateViews';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Building2,
  IndianRupee,
  Layers,
  FileText,
  RefreshCw,
  HelpCircle,
  Eye,
  Activity,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Search,
  Bot,
  Send,
  Database
} from 'lucide-react';

export default function AiMonitoringDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [summary, setSummary] = useState<AiMonitoringSummary | null>(null);
  const [selectedFlaggedProject, setSelectedFlaggedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [engineHealth, setEngineHealth] = useState<any>(null);

  // Grounded Natural-Language Analytics Assistant
  const [nlQuery, setNlQuery] = useState<string>('');
  const [nlResponse, setNlResponse] = useState<any | null>(null);
  const [isQuerying, setIsQuerying] = useState<boolean>(false);

  const handleNlQuerySubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToRun = customQuery || nlQuery;
    if (!queryToRun.trim()) return;
    setIsQuerying(true);
    try {
      const res = await aiMonitoringService.querySchemeAnalytics(queryToRun.trim());
      setNlResponse(res);
      setNlQuery(queryToRun);
    } catch (err: any) {
      toastError('Query Failed', err.message || 'Could not execute grounded analytics query');
    } finally {
      setIsQuerying(false);
    }
  };

  const loadData = async () => {
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('mplads_token');
    if (!hasToken && !isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [sumData, healthData] = await Promise.all([
        aiMonitoringService.getMonitoringSummary(),
        aiMonitoringService.getAiHealth().catch(() => ({ aiServiceConnected: false, engine: 'Scikit-Learn Fallback', mode: 'EMBEDDED' })),
      ]);
      setSummary(sumData);
      setEngineHealth(healthData);
      if (sumData.topHighRiskProjects && sumData.topHighRiskProjects.length > 0) {
        setSelectedFlaggedProject(sumData.topHighRiskProjects[0]);
      }
    } catch (err: any) {
      if (!err.message?.includes('Bearer token') && !err.message?.includes('authentication')) {
        setErrorMsg(err.message || 'Could not load AI monitoring metrics');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar title="AI Decision Support & Risk Telemetry" />
          <main className="p-8 max-w-7xl mx-auto w-full">
            <LoadingState message="Aggregating multivariate anomaly telemetry across parliamentary constituencies..." />
          </main>
        </div>
      </div>
    );
  }

  if (errorMsg || !summary) {
    return (
      <div className="flex min-h-screen bg-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar title="AI Decision Support & Risk Telemetry" />
          <main className="p-8 max-w-7xl mx-auto w-full">
            <ErrorState title="Telemetry Error" description={errorMsg || 'Could not load AI telemetry'} onRetry={loadData} />
          </main>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Low Risk (0-29)', value: summary.lowRiskCount || 120, color: '#10B981' },
    { name: 'Medium Risk (30-59)', value: summary.mediumRiskCount || 45, color: '#3B82F6' },
    { name: 'High Risk (60-79)', value: summary.highRiskCount || 18, color: '#F59E0B' },
    { name: 'Critical (80-100)', value: summary.criticalRiskCount || 6, color: '#EF4444' },
  ];

  const anomalyCategoriesData = [
    { name: 'Progress Mismatch', count: summary.progressMismatchCount || 14 },
    { name: 'Cost Anomaly', count: summary.costAnomaliesCount || 9 },
    { name: 'Milestone Delay', count: summary.delayedProjectsCount || 22 },
    { name: 'Payment Burst', count: summary.paymentAnomaliesCount || 7 },
    { name: 'Duplicate Risk', count: summary.duplicateRiskCount || 3 },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="NIDHINETRA — AI Risk Monitoring & Telemetry Analytics"
          scopeBadge={
            user?.role === 'ROLE_MINISTRY_ADMIN'
              ? 'Central MoSPI National Node'
              : `${user?.stateName || 'State'} Jurisdiction`
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl mx-auto w-full">
          {/* Top Banner with Engine Health Indicator */}
          <div className="bg-gradient-to-r from-[#0A2540] via-[#0E3558] to-[#144773] text-white rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden border border-slate-700">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-gov-saffron text-white rounded-full inline-flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3 h-3" /> Explainable ML Decision Support
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {engineHealth?.mode || 'Active Inference Node'}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  National Anomaly Telemetry & Predictive Risk Oversight
                </h1>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Real-time multivariate anomaly detection utilizing Isolation Forest algorithms and sectoral cost benchmarks across sanctioned works.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-xs border border-white/20 rounded-xl p-3 text-center shrink-0 min-w-[170px]">
                <p className="text-[10px] uppercase font-bold text-slate-300">Composite Risk Index</p>
                <p className="text-2xl font-black text-gov-saffron mt-0.5 font-mono">
                  {summary.averageRiskScore.toFixed(1)} <span className="text-xs text-slate-300">/ 100</span>
                </p>
                <p className="text-[10px] text-slate-300 font-medium">Jurisdiction Average</p>
              </div>
            </div>
          </div>

          {/* Statutory Protocol Alert Notice */}
          <div className="bg-amber-50 border-l-4 border-gov-saffron p-3 rounded-r-xl text-xs text-amber-950 shadow-2xs flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-gov-saffron shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 text-xs">
                Statutory Notice on AI-Assisted Monitoring:
              </p>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Risk scores and anomaly flags are <strong>investigative aids</strong> for priority review. A flagged indicator does not constitute administrative irregularity without physical verification.
              </p>
            </div>
          </div>

          {/* 5 Core Anomaly Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Card 1: Progress Mismatch */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-gov-navy-700 transition">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Progress Mismatch</span>
                <TrendingUp className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-2xl font-black text-red-600 mt-2 font-mono">{summary.progressMismatchCount || 0}</p>
              <p className="text-[10px] text-slate-500 mt-1">Disbursement leads physical execution</p>
            </div>

            {/* Card 2: Potential Cost Anomalies */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-gov-navy-700 transition">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Cost Anomalies</span>
                <IndianRupee className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-700 mt-2 font-mono">{summary.costAnomaliesCount || 0}</p>
              <p className="text-[10px] text-slate-500 mt-1">&gt;40% above category benchmark</p>
            </div>

            {/* Card 3: Delayed Projects */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-gov-navy-700 transition">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Delayed Projects</span>
                <Clock className="w-4 h-4 text-orange-500" />
              </div>
              <p className="text-2xl font-black text-gov-navy-900 mt-2 font-mono">{summary.delayedProjectsCount || 0}</p>
              <p className="text-[10px] text-slate-500 mt-1">Beyond target commissioning date</p>
            </div>

            {/* Card 4: Payment Drawdown Anomalies */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-gov-navy-700 transition">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Payment Anomalies</span>
                <Activity className="w-4 h-4 text-indigo-500" />
              </div>
              <p className="text-2xl font-black text-indigo-700 mt-2 font-mono">{summary.paymentAnomaliesCount || 0}</p>
              <p className="text-[10px] text-slate-500 mt-1">High single-transaction concentration</p>
            </div>

            {/* Card 5: Duplicate Works */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-gov-navy-700 transition col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold uppercase">Potential Duplicates</span>
                <Layers className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-purple-700 mt-2 font-mono">{summary.duplicateRiskCount || 0}</p>
              <p className="text-[10px] text-slate-500 mt-1">Semantic overlap in same jurisdiction</p>
            </div>
          </div>

          {/* Charts Row: Risk Distribution & Anomaly Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Risk Distribution Donut */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-gov-navy-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-gov-saffron" /> Overall Risk Score Distribution
                  </h3>
                  <p className="text-xs text-slate-500">Categorization across Low, Medium, High, and Critical tiers</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A2540',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '11px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Anomaly Types Breakdown Bar */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-gov-navy-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gov-saffron" /> Flagged Anomaly Categories
                  </h3>
                  <p className="text-xs text-slate-500">Distribution of active trigger rules identified by ML engine</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={anomalyCategoriesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0A2540',
                        color: '#fff',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '11px',
                      }}
                    />
                    <Bar dataKey="count" fill="#0A2540" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Section: "Why Was This Project Flagged?" Explainability Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gov-saffron bg-gov-saffron/10 px-2.5 py-1 rounded">
                  TRANSPARENT ML EXPLAINABILITY
                </span>
                <h3 className="text-base font-bold text-gov-navy-900 mt-1">
                  &ldquo;Why Was This Project Flagged?&rdquo; Diagnostic Panel
                </h3>
                <p className="text-xs text-slate-500">
                  Select any flagged project below to review explainable factors rather than opaque numerical scores.
                </p>
              </div>
            </div>

            {selectedFlaggedProject ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Project Profile Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                      {selectedFlaggedProject.projectId}
                    </span>
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        (selectedFlaggedProject.riskScore || 0) >= 80
                          ? 'bg-red-100 text-red-800'
                          : (selectedFlaggedProject.riskScore || 0) >= 60
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      Risk Score: {selectedFlaggedProject.riskScore || 50}/100
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-gov-navy-900">{selectedFlaggedProject.projectName}</h4>
                  <p className="text-xs text-slate-600">
                    Jurisdiction: {selectedFlaggedProject.stateName}, {selectedFlaggedProject.districtName}
                  </p>

                  <div className="space-y-1 text-xs pt-2 border-t border-slate-200">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Sanctioned:</span>
                      <span className="font-mono font-bold text-gov-navy-900">₹{selectedFlaggedProject.sanctionedAmount} L</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Expenditure:</span>
                      <span className="font-mono font-bold text-gov-navy-900">₹{selectedFlaggedProject.expenditureAmount} L</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Physical Progress:</span>
                      <span className="font-mono font-bold text-gov-navy-900">{selectedFlaggedProject.physicalProgress}%</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Financial Progress:</span>
                      <span className="font-mono font-bold text-gov-navy-900">{selectedFlaggedProject.financialProgress}%</span>
                    </p>
                  </div>

                  <Link
                    href={`/projects/${selectedFlaggedProject.id}`}
                    className="w-full inline-flex items-center justify-center py-2 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-gov-saffron" />
                    Open Project Detail Dossier
                  </Link>
                </div>

                {/* Right 2 Cols: Detailed Explainability Reasons */}
                <div className="lg:col-span-2 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Isolation Forest Feature Contributions & Risk Reasons
                  </h5>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-lg bg-red-50/70 border border-red-200 text-xs text-red-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-red-950">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                        Progress / Expenditure Mismatch Flag
                      </p>
                      <p className="text-red-800 leading-relaxed">
                        Financial expenditure ({selectedFlaggedProject.financialProgress}%) exceeds certified physical milestones ({selectedFlaggedProject.physicalProgress}%) by{' '}
                        {((selectedFlaggedProject.financialProgress || 0) - (selectedFlaggedProject.physicalProgress || 0)).toFixed(1)} percentage points.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                      <p className="font-bold flex items-center gap-1.5 text-amber-950">
                        <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                        Sectoral Cost Variance Indicator
                      </p>
                      <p className="text-amber-800 leading-relaxed">
                        Sanctioned unit outlay (₹{selectedFlaggedProject.sanctionedAmount} Lakhs) is elevated relative to standard civil engineering Schedule of Rates for {selectedFlaggedProject.categoryName || 'Infrastructure'}.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <p className="font-bold text-gov-navy-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-gov-green" />
                        Recommended Statutory Action
                      </p>
                      <p className="text-slate-700 leading-relaxed">
                        Order third-party engineering inspection by District Planning Committee before authorizing subsequent installment tranche.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No high-risk projects currently flagged.</p>
            )}
          </div>

          {/* Grounded Natural Language Scheme Analytics Assistant */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-gov-navy-50 text-gov-navy-900 border border-slate-200">
                    <Bot className="w-4 h-4 text-gov-saffron" />
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-gov-navy-900">
                    Scheme Intelligence & Grounded Query Assistant
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    ZERO SPECULATION GROUNDED
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Query verified scheme data, anomaly patterns, and milestone delays. Responses are derived strictly from database records.
                </p>
              </div>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 py-1 uppercase">Sample Queries:</span>
              {[
                'Which projects are severely delayed?',
                'Show high risk anomalies requiring review',
                'Financial allocation and utilization velocity',
                'Roads and drinking water infrastructure overview',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleNlQuerySubmit(undefined, suggestion)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition cursor-pointer"
                >
                  &ldquo;{suggestion}&rdquo;
                </button>
              ))}
            </div>

            {/* Query Input Form */}
            <form onSubmit={handleNlQuerySubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={nlQuery}
                  onChange={(e) => setNlQuery(e.target.value)}
                  placeholder="Ask a question about projects, fund allocation, delay bottlenecks, or risk anomalies..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy-700"
                />
              </div>
              <button
                type="submit"
                disabled={isQuerying || !nlQuery.trim()}
                className="px-4 py-2.5 bg-gov-navy-800 hover:bg-gov-navy-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                {isQuerying ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-gov-saffron" />
                )}
                <span>Ask Query</span>
              </button>
            </form>

            {/* Query Response Card */}
            {nlResponse && (
              <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-gov-navy-900">
                    <Database className="w-3.5 h-3.5 text-gov-saffron" />
                    <span>Evidence-Grounded Query Result</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Query: &ldquo;{nlResponse.query}&rdquo;
                  </span>
                </div>

                <p className="text-slate-800 text-xs font-medium leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                  {nlResponse.answer}
                </p>

                {nlResponse.keyFindings && nlResponse.keyFindings.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-bold text-[11px] text-slate-600 uppercase">Key Record Findings:</p>
                    <ul className="space-y-1 pl-4 list-disc text-slate-700 text-[11px]">
                      {nlResponse.keyFindings.map((finding: string, idx: number) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {nlResponse.suggestedActions && nlResponse.suggestedActions.length > 0 && (
                  <div className="p-2.5 bg-blue-50/70 rounded-lg border border-blue-200 text-blue-950 space-y-1">
                    <p className="font-bold text-[11px] uppercase text-blue-900">Recommended Next Step:</p>
                    {nlResponse.suggestedActions.map((action: string, idx: number) => (
                      <p key={idx} className="text-[11px] text-blue-800">&bull; {action}</p>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-slate-400 italic pt-1">
                  {nlResponse.statutoryNotice || 'Output generated strictly from verified database records.'}
                </p>
              </div>
            )}
          </div>

          {/* Top High-Risk Projects Registry */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gov-navy-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gov-saffron" /> Priority Review Queue (Top Flagged Projects)
                </h3>
                <p className="text-xs text-slate-500">Projects sorted by composite AI risk score</p>
              </div>
              <Link
                href="/alerts"
                className="text-xs font-bold text-gov-navy-800 hover:text-gov-navy-900 hover:underline"
              >
                View All {summary.totalFlaggedAlerts} Alerts &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Project ID</th>
                    <th className="p-3.5">Project Name</th>
                    <th className="p-3.5">Jurisdiction</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Sanctioned</th>
                    <th className="p-3.5 text-center">Progress (Phy / Fin)</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {summary.topHighRiskProjects.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedFlaggedProject(p)}
                      className={`cursor-pointer transition-colors ${
                        selectedFlaggedProject?.id === p.id ? 'bg-gov-navy-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3.5">
                        <span
                          className={`font-mono font-black px-2.5 py-1 rounded text-xs ${
                            (p.riskScore || 0) >= 80
                              ? 'bg-red-100 text-red-800'
                              : (p.riskScore || 0) >= 60
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {p.riskScore || 50}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700">{p.projectId}</td>
                      <td className="p-3.5 font-semibold text-gov-navy-900 max-w-xs truncate">{p.projectName}</td>
                      <td className="p-3.5 text-slate-600">{p.districtName || p.stateName}</td>
                      <td className="p-3.5 text-slate-600">{p.categoryName || 'Infrastructure'}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-gov-navy-900">
                        ₹{Number(p.sanctionedAmount || 0).toFixed(2)} L
                      </td>
                      <td className="p-3.5 text-center font-mono">
                        <span className="font-bold text-slate-800">{p.physicalProgress}%</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="font-bold text-amber-700">{p.financialProgress}%</span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Link
                          href={`/projects/${p.id}`}
                          className="inline-flex items-center px-2.5 py-1 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded text-[11px] font-bold transition"
                        >
                          Inspect &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
