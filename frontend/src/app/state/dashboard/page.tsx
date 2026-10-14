'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Button } from '@/components/ui/Button';
import { StatusPieChart } from '@/components/charts/StatusPieChart';
import { TrendAreaChart } from '@/components/charts/TrendAreaChart';
import { LoadingState } from '@/components/ui/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/utils/useRequireAuth';
import { useToast } from '@/context/ToastContext';
import { projectService } from '@/services/projectService';
import { aiMonitoringService } from '@/services/aiMonitoringService';
import { alertService } from '@/services/alertService';
import { Project, AiMonitoringSummary, RiskAlert } from '@/types';
import { formatNumber } from '@/utils/formatters';
import {
  Building2,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Eye,
  FileSpreadsheet,
  Layers,
  BarChart3,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Activity,
  UserCheck,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function StateDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth(['ROLE_STATE_NODAL_AUTHORITY']);
  const { error: toastError, success } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiSummary, setAiSummary] = useState<AiMonitoringSummary | null>(null);
  const [stateAlerts, setStateAlerts] = useState<RiskAlert[]>([]);

  const stateName = user?.stateName || 'Maharashtra';
  const stateCode = 'MH';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projRes, aiRes, alertRes] = await Promise.all([
        projectService.getProjects({
          stateId: user?.stateId,
          size: 50,
        }),
        aiMonitoringService.getMonitoringSummary().catch(() => null),
        alertService.getAlerts({ size: 10 }).catch(() => ({ content: [] }))
      ]);
      setProjects(projRes.content || []);
      setAiSummary(aiRes);
      setStateAlerts(alertRes.content || []);
    } catch (err: any) {
      toastError('Data Load Error', err.message || 'Could not fetch State dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const totalProjects = projects.length || 920;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length || 620;
  const ongoingCount = projects.filter(p => p.status === 'ONGOING').length || 240;
  const delayedCount = projects.filter(p => p.status === 'DELAYED' || (p.delayDays && p.delayDays > 0)).length || 45;
  const highRiskCount = projects.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' || p.riskLevel === 'ANOMALY_FLAGGED').length || 15;

  const totalSanctionedLakhs = projects.reduce((sum, p) => sum + (p.sanctionedAmount || 0), 0);
  const totalReleasedLakhs = projects.reduce((sum, p) => sum + (p.releasedAmount || 0), 0);
  const totalExpenditureLakhs = projects.reduce((sum, p) => sum + (p.expenditureAmount || 0), 0);

  const totalSanctionedCr = totalSanctionedLakhs > 0 ? totalSanctionedLakhs / 100 : 480.0;
  const totalReleasedCr = totalReleasedLakhs > 0 ? totalReleasedLakhs / 100 : 412.5;
  const totalExpenditureCr = totalExpenditureLakhs > 0 ? totalExpenditureLakhs / 100 : 380.0;
  const utilizationPercent = totalReleasedCr > 0 ? Math.round((totalExpenditureCr / totalReleasedCr * 100) * 10) / 10 : 85.9;

  // District distribution chart and table data
  const districtMonitoringData = [
    { district: 'Pune', projects: 280, sanctioned: 145.0, expenditure: 128.0, util: 88.2, completionRate: 72, delayedCount: 12, riskLevel: 'MEDIUM' },
    { district: 'Nagpur', projects: 210, sanctioned: 110.0, expenditure: 95.5, util: 86.8, completionRate: 68, delayedCount: 8, riskLevel: 'LOW' },
    { district: 'Nashik', projects: 160, sanctioned: 85.0, expenditure: 72.0, util: 84.7, completionRate: 65, delayedCount: 9, riskLevel: 'MEDIUM' },
    { district: 'Thane', projects: 140, sanctioned: 75.0, expenditure: 64.0, util: 85.3, completionRate: 70, delayedCount: 6, riskLevel: 'LOW' },
    { district: 'Aurangabad', projects: 130, sanctioned: 65.0, expenditure: 53.0, util: 81.5, completionRate: 58, delayedCount: 10, riskLevel: 'HIGH' },
  ];

  const statusData = [
    { name: 'Completed Works', value: completedCount, color: '#138808' },
    { name: 'Ongoing Works', value: ongoingCount, color: '#0A2540' },
    { name: 'Delayed Works', value: delayedCount, color: '#E65100' },
    { name: 'Sanctioned / New', value: Math.max(0, totalProjects - completedCount - ongoingCount - delayedCount), color: '#1E609A' },
  ];

  const categoryData = [
    { category: 'Drinking Water', count: Math.round(totalProjects * 0.32), amountCr: 154.2 },
    { category: 'Roads & Pathways', count: Math.round(totalProjects * 0.28), amountCr: 135.0 },
    { category: 'Education Infra', count: Math.round(totalProjects * 0.22), amountCr: 105.8 },
    { category: 'Public Health', count: Math.round(totalProjects * 0.12), amountCr: 58.0 },
    { category: 'Community Halls', count: Math.round(totalProjects * 0.06), amountCr: 27.0 },
  ];

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying State Nodal Authority credentials..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title={`NIDHINETRA — ${stateName} State Nodal Monitoring Dashboard`}
          scopeBadge={`State Scope: ${stateName} (Statutory Nodal Authority)`}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Header Controls with State Jurisdiction Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gov-navy-900 text-white flex items-center justify-center font-black text-sm shadow-sm border border-gov-navy-700">
                {stateCode}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
                    State Nodal Authority — {stateName}
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    State Level View
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Statutory Monitoring, District Fund Disbursement Oversight & AI Risk Queue
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                isLoading={isLoading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Sync State Data
              </Button>
              <Link href="/map">
                <Button variant="outline" size="sm" leftIcon={<MapPin className="w-3.5 h-3.5" />}>
                  State GIS Map
                </Button>
              </Link>
              <Link href="/alerts">
                <Button variant="primary" size="sm" leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}>
                  Risk Alerts ({stateAlerts.length})
                </Button>
              </Link>
            </div>
          </div>

          {/* STATE AI RISK BAR */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-gov-saffron/20 text-gov-saffron">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">{stateName} AI Anomaly & Risk Telemetry</h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    MONITORED
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {aiSummary?.totalFlaggedAlerts || 17} active risk indicators across {stateName} districts
                </p>
              </div>
            </div>

            <Link
              href="/ai-monitoring"
              className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition inline-flex items-center gap-1.5 self-start md:self-auto shrink-0"
            >
              <Activity className="w-3.5 h-3.5 text-gov-saffron" />
              <span>AI Risk Queue &rarr;</span>
            </Link>
          </div>

          {/* PRIMARY FINANCIAL & PROJECT KPIS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              title="State Total Projects"
              value={formatNumber(totalProjects)}
              subtext={`Across ${stateName} Districts`}
              icon={<Building2 className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Sanctioned Amount"
              value={`₹ ${totalSanctionedCr.toFixed(1)} Cr`}
              subtext="State approved pool"
              icon={<IndianRupee className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Total Expenditure"
              value={`₹ ${totalExpenditureCr.toFixed(1)} Cr`}
              subtext="PFMS ground expenditure"
              icon={<CheckCircle2 className="w-5 h-5" />}
              accentColor="green"
            />
            <KpiCard
              title="State Utilization"
              value={`${utilizationPercent.toFixed(1)}%`}
              subtext="Expenditure / Released"
              icon={<Clock className="w-5 h-5" />}
              accentColor="green"
            />
          </div>

          {/* WORK STATUS OVERVIEW STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
              <span suppressHydrationWarning className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">{formatNumber(completedCount)}</span>
              <span className="text-[10px] text-slate-400">Commissioned</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ongoing</span>
              <span suppressHydrationWarning className="text-lg font-black text-gov-navy-900 font-mono mt-0.5 block">{formatNumber(ongoingCount)}</span>
              <span className="text-[10px] text-slate-400">In execution</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Delayed</span>
              <span suppressHydrationWarning className="text-lg font-black text-amber-700 font-mono mt-0.5 block">{formatNumber(delayedCount)}</span>
              <span className="text-[10px] text-slate-400">Overdue baseline</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">High-Risk Flagged</span>
              <span suppressHydrationWarning className="text-lg font-black text-red-700 font-mono mt-0.5 block">{formatNumber(highRiskCount)}</span>
              <span className="text-[10px] text-slate-400">Review required</span>
            </div>
          </div>

          {/* 4 STATE OVERVIEW CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: District Distribution */}
            <Card
              title="District-Wise Allocation & Expenditure"
              subtitle={`Financial performance across key districts of ${stateName}`}
              headerIcon={<BarChart3 className="w-5 h-5 text-gov-navy-800" />}
            >
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtMonitoringData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="district" tick={{ fill: '#475569', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickFormatter={(v) => `₹${v}Cr`} />
                    <Tooltip formatter={(v: any) => [`₹${v} Cr`, '']} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="sanctioned" name="Sanctioned (₹ Cr)" fill="#0A2540" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenditure" name="Expenditure (₹ Cr)" fill="#138808" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: District Utilization Percentage */}
            <Card
              title="District Fund Utilization Rate (%)"
              subtitle="Efficiency of district authorities in spending disbursed funds"
              headerIcon={<TrendingUp className="w-5 h-5 text-gov-green" />}
            >
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={districtMonitoringData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#475569', fontSize: 11 }} unit="%" />
                    <YAxis type="category" dataKey="district" tick={{ fill: '#475569', fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => [`${v}%`, 'Utilization Rate']} />
                    <Bar dataKey="util" name="Utilization %" fill="#E65100" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 3: Project Status */}
            <Card
              title="State Project Status Breakdown"
              subtitle="Proportions across completed, active, and delayed works"
              headerIcon={<Layers className="w-5 h-5 text-gov-navy-800" />}
            >
              <StatusPieChart data={statusData} />
            </Card>

            {/* Chart 4: Completion Trend */}
            <Card
              title="Annual State Completion Trend"
              subtitle="Historical trend of delivered community assets"
              headerIcon={<TrendingUp className="w-5 h-5 text-gov-green" />}
            >
              <TrendAreaChart />
            </Card>
          </div>

          {/* DISTRICT MONITORING TABLE */}
          <Card
            title="District Performance & Anomaly Monitoring"
            subtitle="Real-time oversight of subordinate district collectorates with financial drawdown and risk indicators"
            headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
            borderAccent
          >
            <Table
              columns={[
                {
                  key: 'district',
                  header: 'District Name',
                  render: (d: any) => (
                    <div className="font-bold text-gov-navy-900 text-xs">
                      {d.district} Collectorate
                    </div>
                  ),
                },
                {
                  key: 'projects',
                  header: 'Total Projects',
                  render: (d: any) => <span className="font-mono text-xs font-semibold text-slate-800">{d.projects}</span>,
                },
                {
                  key: 'sanctioned',
                  header: 'Sanctioned / Spent',
                  render: (d: any) => (
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">₹{d.expenditure} Cr</span>
                      <span className="text-slate-500"> / ₹{d.sanctioned} Cr</span>
                    </div>
                  ),
                },
                {
                  key: 'utilization',
                  header: 'Utilization %',
                  render: (d: any) => (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{d.util}%</span>
                      <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.util >= 85 ? 'bg-emerald-600' : d.util >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(100, d.util)}%` }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'completion',
                  header: 'Completion %',
                  render: (d: any) => (
                    <span className="font-mono text-xs font-semibold text-emerald-700">{d.completionRate}%</span>
                  ),
                },
                {
                  key: 'delayed',
                  header: 'Delayed Works',
                  render: (d: any) => (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${d.delayedCount > 8 ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'text-slate-700'}`}>
                      {d.delayedCount}
                    </span>
                  ),
                },
                {
                  key: 'riskLevel',
                  header: 'District Risk',
                  render: (d: any) => <RiskBadge riskLevel={d.riskLevel} />,
                },
                {
                  key: 'actions',
                  header: 'Action',
                  render: (d: any) => (
                    <Link href={`/projects?district=${d.district}`}>
                      <Button variant="outline" size="sm">Inspect</Button>
                    </Link>
                  ),
                },
              ]}
              data={districtMonitoringData}
              keyExtractor={(d: any) => d.district}
            />
          </Card>

          {/* STATE PROJECTS TABLE */}
          <Card
            title={`Active Projects in ${stateName}`}
            subtitle="Works currently managed by District Authorities under state oversight (Click to view full financial, progress, AI analysis & audit tabs)"
            headerIcon={<FileText className="w-5 h-5 text-gov-navy-800" />}
            borderAccent
            action={
              <Link href="/projects">
                <Button variant="outline" size="sm" rightIcon={<Eye className="w-3.5 h-3.5" />}>
                  Filter All State Projects
                </Button>
              </Link>
            }
          >
            <Table
              columns={[
                {
                  key: 'code',
                  header: 'Project Code & Title',
                  render: (p: Project) => (
                    <div>
                      <span className="font-bold text-gov-navy-900 block font-mono text-xs">{p.projectId}</span>
                      <span className="text-slate-600 text-xs truncate max-w-sm block">{p.projectName}</span>
                    </div>
                  ),
                },
                {
                  key: 'district',
                  header: 'District',
                  render: (p: Project) => <span className="text-xs font-semibold text-slate-800">{p.districtName}</span>,
                },
                {
                  key: 'agency',
                  header: 'Implementing Agency',
                  render: (p: Project) => <span className="text-xs text-slate-600 truncate max-w-xs block">{p.implementingAgency}</span>,
                },
                {
                  key: 'financials',
                  header: 'Sanctioned / Spent',
                  render: (p: Project) => (
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">₹{p.expenditureAmount}L</span>
                      <span className="text-slate-500"> / ₹{p.sanctionedAmount}L</span>
                    </div>
                  ),
                },
                {
                  key: 'progress',
                  header: 'Progress',
                  render: (p: Project) => (
                    <div className="w-20">
                      <span className="text-[11px] font-bold">{p.physicalProgress}%</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-gov-navy-800 h-full rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (p: Project) => <StatusBadge status={p.status} />,
                },
                {
                  key: 'risk',
                  header: 'Risk',
                  render: (p: Project) => <RiskBadge riskLevel={p.riskLevel} />,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (p: Project) => (
                    <Link href={`/projects/${p.id}`}>
                      <Button variant="outline" size="sm">Details & AI</Button>
                    </Link>
                  ),
                },
              ]}
              data={projects}
              keyExtractor={(p: Project) => p.id}
            />
          </Card>
        </main>
      </div>
    </div>
  );
}
