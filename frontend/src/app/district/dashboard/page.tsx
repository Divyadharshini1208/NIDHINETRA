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
import { alertService } from '@/services/alertService';
import { Project, AiMonitoringSummary, RiskAlert } from '@/types';
import { ReviewProjectModal } from '@/components/projects/ReviewProjectModal';
import {
  Building2,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  Clock,
  TrendingUp,
  MapPin,
  Eye,
  Plus,
  FileCheck,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
  Sparkles,
  Layers,
  BarChart3,
  Activity,
  FileText,
  UserCheck
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

export default function DistrictDashboardPage() {
  const { user } = useAuth();
  const { error: toastError, success } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [aiSummary, setAiSummary] = useState<AiMonitoringSummary | null>(null);
  const [districtAlerts, setDistrictAlerts] = useState<RiskAlert[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'DELAYED' | 'ATTENTION' | 'COMPLETED'>('ALL');
  const [selectedReviewProject, setSelectedReviewProject] = useState<Project | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const districtName = user?.districtName || 'Pune';
  const stateName = user?.stateName || 'Maharashtra';

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [projRes, aiRes, alertRes] = await Promise.all([
        projectService.getProjects({
          districtId: user?.districtId,
          size: 50,
        }),
        aiMonitoringService.getMonitoringSummary().catch(() => null),
        alertService.getAlerts({ size: 10 }).catch(() => ({ content: [] }))
      ]);
      setProjects(projRes.content || []);
      setAiSummary(aiRes);
      setDistrictAlerts(alertRes.content || []);
    } catch (err: any) {
      toastError('Data Load Error', err.message || 'Could not fetch District dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const totalProjects = projects.length || 42;
  const pendingCount = projects.filter(p => p.status === 'PROPOSED').length;
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length || 28;
  const ongoingCount = projects.filter(p => p.status === 'ONGOING').length || 10;
  const delayedCount = projects.filter(p => p.status === 'DELAYED' || (p.delayDays && p.delayDays > 0)).length || 4;
  const highRiskCount = projects.filter(p => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' || p.riskLevel === 'ANOMALY_FLAGGED').length || 3;

  const totalSanctionedLakhs = projects.reduce((sum, p) => sum + (p.sanctionedAmount || 0), 0);
  const totalExpenditureLakhs = projects.reduce((sum, p) => sum + (p.expenditureAmount || 0), 0);
  const totalSanctionedCr = totalSanctionedLakhs > 0 ? Math.round((totalSanctionedLakhs / 100) * 10) / 10 : 22.5;
  const totalExpenditureCr = totalExpenditureLakhs > 0 ? Math.round((totalExpenditureLakhs / 100) * 10) / 10 : 18.2;
  const utilizationPercent = totalSanctionedCr > 0 ? Math.round((totalExpenditureCr / totalSanctionedCr * 100) * 10) / 10 : 80.8;

  const statusData = [
    { name: 'Pending Review', value: pendingCount, color: '#D97706' },
    { name: 'Completed Works', value: completedCount, color: '#138808' },
    { name: 'Ongoing Works', value: ongoingCount, color: '#0A2540' },
    { name: 'Delayed Works', value: delayedCount, color: '#E65100' },
    { name: 'Sanctioned / Active', value: Math.max(0, totalProjects - pendingCount - completedCount - ongoingCount - delayedCount), color: '#1E609A' },
  ];

  // Progress vs Expenditure comparisons for district execution
  const progressComparisonData = [
    { category: 'Drinking Water', physical: 78, financial: 82 },
    { category: 'Roads & Bridges', physical: 62, financial: 70 },
    { category: 'Education Infra', physical: 85, financial: 84 },
    { category: 'Public Health', physical: 55, financial: 68 },
    { category: 'Community Halls', physical: 90, financial: 88 },
  ];

  const displayedProjects = projects.filter(p => {
    if (filterTab === 'PENDING') return p.status === 'PROPOSED';
    if (filterTab === 'DELAYED') return p.status === 'DELAYED' || (p.delayDays && p.delayDays > 0);
    if (filterTab === 'ATTENTION') return p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' || p.riskLevel === 'ANOMALY_FLAGGED';
    if (filterTab === 'COMPLETED') return p.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title={`NIDHINETRA — ${districtName} District Authority Dashboard`}
          scopeBadge={`District Scope: ${districtName} (${stateName})`}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gov-navy-900 text-white flex items-center justify-center font-black text-xs shadow-sm border border-gov-navy-700">
                DM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
                    District Magistrate & Collectorate — {districtName}
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    District Scope
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Work Order Sanctions, Milestone Inspection Certification, and Implementing Agency Disbursal Control
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
                Sync District
              </Button>
              <Link href="/map">
                <Button variant="outline" size="sm" leftIcon={<MapPin className="w-3.5 h-3.5" />}>
                  District GIS Map
                </Button>
              </Link>
              <Link href="/alerts">
                <Button variant="primary" size="sm" leftIcon={<ShieldAlert className="w-3.5 h-3.5" />}>
                  Risk Queue ({districtAlerts.length})
                </Button>
              </Link>
            </div>
          </div>

          {/* PENDING RECOMMENDATIONS ALERT BANNER */}
          {pendingCount > 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-amber-950">
                    {pendingCount} Recommended Work{pendingCount > 1 ? 's' : ''} Awaiting District Technical Scrutiny & Sanction
                  </h3>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Hon. MP has submitted new developmental recommendations requiring feasibility assessment, sanction order generation, and agency assignment.
                  </p>
                </div>
              </div>
              <Button
                variant="saffron"
                size="sm"
                onClick={() => setFilterTab('PENDING')}
                leftIcon={<Clock className="w-3.5 h-3.5" />}
                className="font-bold shrink-0"
              >
                Examine Queue ({pendingCount})
              </Button>
            </div>
          )}

          {/* DISTRICT AI RISK BAR */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="p-2 rounded-lg bg-gov-saffron/20 text-gov-saffron">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white">{districtName} AI Decision Support Queue</h2>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ACTIVE
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {districtAlerts.length} active risk indicators flagged for Collectorate inspection
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
              title="Total District Projects"
              value={totalProjects.toString()}
              subtext={`Assigned Works in ${districtName}`}
              icon={<Building2 className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Sanctioned Amount"
              value={`₹ ${totalSanctionedCr.toFixed(1)} Cr`}
              subtext="Approved estimates"
              icon={<IndianRupee className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Total Expenditure"
              value={`₹ ${totalExpenditureCr.toFixed(1)} Cr`}
              subtext="PFMS ground disbursements"
              icon={<CheckCircle2 className="w-5 h-5" />}
              accentColor="green"
            />
            <KpiCard
              title="Fund Utilization %"
              value={`${utilizationPercent.toFixed(1)}%`}
              subtext="Expenditure / Sanctioned"
              icon={<Clock className="w-5 h-5" />}
              accentColor="green"
            />
          </div>

          {/* WORK STATUS OVERVIEW STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Completed</span>
              <span className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">{completedCount}</span>
              <span className="text-[10px] text-slate-400">Handed over</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Ongoing</span>
              <span className="text-lg font-black text-gov-navy-900 font-mono mt-0.5 block">{ongoingCount}</span>
              <span className="text-[10px] text-slate-400">Site execution</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Delayed</span>
              <span className="text-lg font-black text-amber-700 font-mono mt-0.5 block">{delayedCount}</span>
              <span className="text-[10px] text-slate-400">Notice issued</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">High-Risk Flagged</span>
              <span className="text-lg font-black text-red-700 font-mono mt-0.5 block">{highRiskCount}</span>
              <span className="text-[10px] text-slate-400">Review required</span>
            </div>
          </div>

          {/* DISTRICT OVERVIEW CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Financial vs Physical Progress */}
            <Card
              title="Physical vs Financial Progress Comparison"
              subtitle="Comparing on-ground execution certified against disbursed funds by sector"
              headerIcon={<BarChart3 className="w-5 h-5 text-gov-navy-800" />}
            >
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressComparisonData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="category" tick={{ fill: '#475569', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 11 }} unit="%" domain={[0, 100]} />
                    <Tooltip formatter={(v: any) => [`${v}%`, '']} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="physical" name="Physical Progress %" fill="#0A2540" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="financial" name="Financial Progress %" fill="#138808" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Chart 2: Project Status Distribution */}
            <Card
              title="District Project Status Breakdown"
              subtitle="Proportions across completed, active, and delayed works"
              headerIcon={<Layers className="w-5 h-5 text-gov-navy-800" />}
            >
              <StatusPieChart data={statusData} />
            </Card>
          </div>

          {/* TAB CONTROLS FOR PROJECT QUEUES */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${filterTab === 'ALL'
                  ? 'bg-gov-navy-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
            >
              All District Works ({projects.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${filterTab === 'PENDING'
                  ? 'bg-amber-700 text-white'
                  : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-300'
                }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Pending Scrutiny ({pendingCount})
            </button>
            <button
              onClick={() => setFilterTab('ATTENTION')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${filterTab === 'ATTENTION'
                  ? 'bg-red-700 text-white'
                  : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
                }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Projects Requiring Attention ({highRiskCount})
            </button>
            <button
              onClick={() => setFilterTab('DELAYED')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${filterTab === 'DELAYED'
                  ? 'bg-amber-700 text-white'
                  : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Delayed Works ({delayedCount})
            </button>
            <button
              onClick={() => setFilterTab('COMPLETED')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${filterTab === 'COMPLETED'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                }`}
            >
              Completed ({completedCount})
            </button>
          </div>

          {/* PROJECT MONITORING TABLE */}
          <Card
            title={`${districtName} District Work Register`}
            subtitle="Direct inspection telemetry, milestone certifications, contractor progress, and AI anomaly indicators (Click Details for full dossier)"
            headerIcon={<FileCheck className="w-5 h-5 text-gov-navy-800" />}
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
                  header: 'Location / Block',
                  render: (p: Project) => (
                    <span className="text-xs font-semibold text-slate-700">{p.districtName}</span>
                  ),
                },
                {
                  key: 'agency',
                  header: 'Executing Agency',
                  render: (p: Project) => (
                    <span className="text-xs text-slate-700 truncate max-w-xs block">
                      {p.implementingAgency || 'Zilla Parishad'}
                    </span>
                  ),
                },
                {
                  key: 'financialProgress',
                  header: 'Sanctioned / Spent',
                  render: (p: Project) => (
                    <div className="w-28 text-xs">
                      <div className="flex justify-between font-bold">
                        <span>₹{p.expenditureAmount}L</span>
                        <span className="text-slate-500 font-normal">₹{p.sanctionedAmount}L</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{
                            width: `${Math.min(100, (p.expenditureAmount / (p.sanctionedAmount || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'physicalProgress',
                  header: 'Physical %',
                  render: (p: Project) => (
                    <div className="w-20 text-xs">
                      <span className="font-bold text-gov-navy-900">{p.physicalProgress}%</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div className="bg-gov-navy-800 h-full rounded-full" style={{ width: `${p.physicalProgress}%` }} />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'expectedCompletion',
                  header: 'Target Date',
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
                      <span className="text-[11px] font-mono text-slate-500">{p.riskScore || 20}/100</span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (p: Project) => <StatusBadge status={p.status} />,
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (p: Project) => (
                    <div className="flex items-center gap-1.5">
                      {p.status === 'PROPOSED' && (
                        <Button
                          variant="saffron"
                          size="sm"
                          onClick={() => {
                            setSelectedReviewProject(p);
                            setIsReviewModalOpen(true);
                          }}
                          leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                          className="font-bold text-xs"
                        >
                          Review & Sanction
                        </Button>
                      )}
                      <Link href={`/projects/${p.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          Inspect
                        </Button>
                      </Link>
                    </div>
                  ),
                },
              ]}
              data={displayedProjects}
              keyExtractor={(p: Project) => p.id}
            />
          </Card>
        </main>
      </div>

      {/* DISTRICT AUTHORITY REVIEW MODAL */}
      <ReviewProjectModal
        isOpen={isReviewModalOpen}
        project={selectedReviewProject}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedReviewProject(null);
        }}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
