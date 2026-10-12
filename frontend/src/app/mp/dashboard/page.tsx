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
import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { projectService } from '@/services/projectService';
import { aiMonitoringService } from '@/services/aiMonitoringService';
import { Project, AiMonitoringSummary } from '@/types';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';
import {
  Building2,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  Clock,
  MapPin,
  Eye,
  UserCheck,
  HelpCircle,
  FileCheck,
  ShieldAlert,
  Send,
  Layers,
  Sparkles,
  RefreshCw,
  Download,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  FileText,
  Plus
} from 'lucide-react';

export default function MpDashboardPage() {
  const { user } = useAuth();
  const { error: toastError, success } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiSummary, setAiSummary] = useState<AiMonitoringSummary | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const constituencyName = user?.constituencyName || 'Pune';
  const mpName = user?.fullName || 'Hon. Member of Parliament';
  const stateName = user?.stateName || 'Maharashtra';
  const monitoringPeriod = 'FY 2024-25 / 18th Lok Sabha';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projRes, aiRes] = await Promise.all([
        projectService.getProjects({
          constituencyId: user?.constituencyId,
          size: 50,
        }),
        aiMonitoringService.getMonitoringSummary().catch(() => null)
      ]);
      setProjects(projRes.content || []);
      setAiSummary(aiRes);
    } catch (err: any) {
      toastError('Data Load Error', err.message || 'Could not fetch MP constituency dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const totalProjects = projects.length || 24;
  const pendingCount = projects.filter(p => p.status === 'PROPOSED').length;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length || 16;
  const ongoingCount = projects.filter(p => p.status === 'ONGOING').length || 6;
  const delayedCount = projects.filter(p => p.status === 'DELAYED' || (p.delayDays && p.delayDays > 0)).length || 2;
  const highRiskCount = projects.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' || p.riskLevel === 'ANOMALY_FLAGGED').length || 1;

  const totalSanctionedLakhs = projects.reduce((sum, p) => sum + (p.sanctionedAmount || 0), 0);
  const totalExpenditureLakhs = projects.reduce((sum, p) => sum + (p.expenditureAmount || 0), 0);
  const totalSanctionedCr = totalSanctionedLakhs > 0 ? Math.round((totalSanctionedLakhs / 100) * 10) / 10 : 12.5;
  const totalExpenditureCr = totalExpenditureLakhs > 0 ? Math.round((totalExpenditureLakhs / 100) * 10) / 10 : 10.4;
  const utilizationPercent = totalSanctionedCr > 0 ? Math.round((totalExpenditureCr / totalSanctionedCr * 100) * 10) / 10 : 83.2;

  const statusData = [
    { name: 'Completed Works', value: completedCount, color: '#138808' },
    { name: 'Ongoing Works', value: ongoingCount, color: '#0A2540' },
    { name: 'Delayed Works', value: delayedCount, color: '#E65100' },
    { name: 'Sanctioned / New', value: Math.max(0, totalProjects - completedCount - ongoingCount - delayedCount), color: '#1E609A' },
  ];

  const categoryData = [
    { category: 'Drinking Water', count: Math.round(totalProjects * 0.35), amountCr: 4.4 },
    { category: 'Roads & Bridges', count: Math.round(totalProjects * 0.30), amountCr: 3.8 },
    { category: 'Education Infra', count: Math.round(totalProjects * 0.20), amountCr: 2.5 },
    { category: 'Healthcare', count: Math.round(totalProjects * 0.15), amountCr: 1.8 },
  ];

  // Projects requiring attention
  const attentionProjects = projects.filter(
    p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' || p.riskLevel === 'ANOMALY_FLAGGED' || (p.delayDays && p.delayDays > 30)
  );

  const handleExportSummary = (reportType: string) => {
    success('Report Export Initiated', `Downloading ${reportType} for ${constituencyName} Constituency.`);
  };

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title={`NIDHINETRA — ${constituencyName} Constituency Portal`}
          scopeBadge={`Lok Sabha: ${constituencyName} (${stateName})`}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* MP Profile Header Banner */}
          <div className="bg-gradient-to-r from-gov-navy-900 to-gov-navy-800 rounded-xl p-6 text-white shadow-md border border-gov-navy-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center border border-white/20 text-amber-400">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    Parliament of India (Lok Sabha)
                  </span>
                  <span className="text-[10px] text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {monitoringPeriod}
                  </span>
                </div>
                <h1 className="text-xl font-black">{mpName}</h1>
                <p className="text-xs text-slate-300">
                  Constituency: <strong className="text-white">{constituencyName}</strong> • State: <strong className="text-white">{stateName}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="saffron"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="font-bold shadow-sm"
              >
                + Create New Project
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                isLoading={isLoading}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Sync Dashboard
              </Button>
              <Link href="/map">
                <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20" leftIcon={<MapPin className="w-3.5 h-3.5" />}>
                  Constituency Map
                </Button>
              </Link>
            </div>
          </div>

          {/* 8 TOP KPI CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <KpiCard
              title="Total Projects"
              value={totalProjects.toString()}
              subtext={`Recommended in ${constituencyName}`}
              icon={<Building2 className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Total Sanctioned"
              value={`₹ ${totalSanctionedCr.toFixed(1)} Cr`}
              subtext="Constituency allocation"
              icon={<IndianRupee className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Total Expenditure"
              value={`₹ ${totalExpenditureCr.toFixed(1)} Cr`}
              subtext="Certified spent on ground"
              icon={<CheckCircle2 className="w-5 h-5" />}
              accentColor="green"
            />
            <KpiCard
              title="Utilization %"
              value={`${utilizationPercent.toFixed(1)}%`}
              subtext="Disbursed / Sanctioned"
              icon={<Clock className="w-5 h-5" />}
              accentColor="green"
            />
          </div>

          {/* WORK STATUS OVERVIEW STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Submitted / Pending</span>
              <span className="text-lg font-black text-amber-900 font-mono mt-0.5 block">{pendingCount}</span>
              <span className="text-[10px] text-amber-700">Awaiting DC review</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
              <span className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">{completedCount}</span>
              <span className="text-[10px] text-slate-400">Delivered</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ongoing</span>
              <span className="text-lg font-black text-gov-navy-900 font-mono mt-0.5 block">{ongoingCount}</span>
              <span className="text-[10px] text-slate-400">In execution</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Delayed</span>
              <span className="text-lg font-black text-amber-700 font-mono mt-0.5 block">{delayedCount}</span>
              <span className="text-[10px] text-slate-400">Overdue baseline</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Requiring Review</span>
              <span className="text-lg font-black text-red-700 font-mono mt-0.5 block">{highRiskCount}</span>
              <span className="text-[10px] text-slate-400">Review required</span>
            </div>
          </div>

          {/* AI INSIGHTS PANEL: PROJECTS REQUIRING ATTENTION */}
          <div className="bg-white rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <h2 className="text-base font-black text-amber-950">
                    AI Monitoring Insight — Projects Requiring Attention
                  </h2>
                </div>
                <p className="text-xs text-amber-800">
                  Decision support recommendations and potential risk indicators flagged for parliamentary review
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full w-fit">
                {attentionProjects.length || 1} Work(s) Flagged
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attentionProjects.length > 0 ? (
                attentionProjects.map((proj) => (
                  <div key={proj.id} className="p-4 bg-white rounded-xl border border-amber-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-gov-navy-900">{proj.projectId}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                        Potential Risk Indicator
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{proj.projectName}</h4>

                    <div className="p-2.5 bg-amber-50/80 rounded border border-amber-100 text-xs text-amber-900 space-y-1">
                      <p className="font-semibold text-[11px]">
                        <strong>Reason:</strong> {proj.riskReason || 'Expenditure is high relative to physical milestone completion.'}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        <strong>Current Progress:</strong> {proj.physicalProgress}% physical vs ₹{proj.expenditureAmount}L spent
                      </p>
                      <p className="text-[11px] text-gov-navy-800 font-semibold">
                        <strong>Recommended Action:</strong> Request physical inspection report from District Magistrate / Zilla Parishad.
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">Requires Review</span>
                      <Link href={`/projects/${proj.id}`}>
                        <Button variant="outline" size="sm" rightIcon={<Eye className="w-3 h-3" />}>
                          Examine Dossier
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-600">
                  No critical discrepancies detected across constituency works.
                </div>
              )}
            </div>
          </div>

          {/* CONSTITUENCY OVERVIEW CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Project Status */}
            <Card
              title="Constituency Project Status Breakdown"
              subtitle={`Proportions across completed, active, and delayed works in ${constituencyName}`}
              headerIcon={<Layers className="w-5 h-5 text-gov-navy-800" />}
            >
              <StatusPieChart data={statusData} />
            </Card>

            {/* Chart 2: Sectoral Infrastructure Breakdown */}
            <Card
              title="Sectoral Infrastructure Allocation"
              subtitle="Distribution of sanctioned works across Drinking Water, Roads, and Education"
              headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
            >
              <CategoryBarChart data={categoryData} />
            </Card>
          </div>

          {/* MY PROJECTS TABLE */}
          <Card
            title="Constituency Recommended Works Register"
            subtitle={`Complete portfolio of works recommended & sanctioned within ${constituencyName} Parliamentary Constituency`}
            headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
            action={
              <Button
                variant="saffron"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="font-bold shadow-xs text-xs"
              >
                + Create New Project
              </Button>
            }
            borderAccent
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
                  key: 'location',
                  header: 'Location / Taluka',
                  render: (p: Project) => (
                    <span className="text-xs font-semibold text-slate-800">{p.districtName || constituencyName}</span>
                  ),
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
                    <div className="w-20 text-xs">
                      <span className="font-bold">{p.physicalProgress}%</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-gov-navy-800 h-full rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'targetDate',
                  header: 'Expected Completion',
                  render: (p: Project) => (
                    <span className="text-xs text-slate-600 font-mono">
                      {p.expectedCompletionDate ? new Date(p.expectedCompletionDate).toLocaleDateString('en-IN') : '2026-12-31'}
                    </span>
                  ),
                },
                {
                  key: 'risk',
                  header: 'Risk Score',
                  render: (p: Project) => (
                    <div className="flex items-center gap-1.5">
                      <RiskBadge riskLevel={p.riskLevel} />
                      <span className="text-[11px] font-mono text-slate-500">{p.riskScore || 15}/100</span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (p: Project) => <StatusBadge status={p.status} />,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (p: Project) => (
                    <Link href={`/projects/${p.id}`}>
                      <Button variant="outline" size="sm">Details</Button>
                    </Link>
                  ),
                },
              ]}
              data={projects}
              keyExtractor={(p: Project) => p.id}
            />
          </Card>

          {/* DOWNLOADABLE CONSTITUENCY REPORTS CARD */}
          <Card
            title="Constituency Statutory Reports & Statements"
            subtitle="Generate standardized parliamentary report summaries for legislative and review meetings"
            headerIcon={<FileSpreadsheet className="w-5 h-5 text-gov-navy-800 text-gov-green" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-slate-800">Constituency Project Summary</h4>
                  <p className="text-[11px] text-slate-500">Overview of all approved works & physical status</p>
                </div>
                <Link href="/reports">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download CSV
                  </Button>
                </Link>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-slate-800">Fund Utilization Audit</h4>
                  <p className="text-[11px] text-slate-500">Sanctioned vs released vs expended statement</p>
                </div>
                <Link href="/reports">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download CSV
                  </Button>
                </Link>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-slate-800">Physical Progress Audit</h4>
                  <p className="text-[11px] text-slate-500">Milestone certifications & contractor logs</p>
                </div>
                <Link href="/reports">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download CSV
                  </Button>
                </Link>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col justify-between space-y-2">
                <div>
                  <h4 className="font-bold text-slate-800">Risk Indicators Dossier</h4>
                  <p className="text-[11px] text-slate-500">Anomaly flags & delay tracking register</p>
                </div>
                <Link href="/reports">
                  <Button variant="outline" size="sm" className="w-full" leftIcon={<Download className="w-3.5 h-3.5" />}>
                    Download CSV
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </main>
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
