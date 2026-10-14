'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { KpiCard } from '@/components/ui/KpiCard';
import { agencyAnalyticsService } from '@/services/agencyAnalyticsService';
import { AgencyReliabilityProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/utils/useRequireAuth';
import { LoadingState } from '@/components/ui/StateViews';
import { useToast } from '@/context/ToastContext';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Award,
  ShieldAlert,
  Info,
  ExternalLink,
  BarChart3,
  Percent,
  Sliders,
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
  Cell
} from 'recharts';

export default function AgencyReliabilityPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [agencies, setAgencies] = useState<AgencyReliabilityProfile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBand, setSelectedBand] = useState<'ALL' | 'A+' | 'A' | 'B' | 'C'>('ALL');
  const [selectedAgency, setSelectedAgency] = useState<AgencyReliabilityProfile | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadAgencies = async () => {
    setIsLoading(true);
    try {
      const data = await agencyAnalyticsService.getAllAgencies({
        districtId: user?.districtId,
        stateId: user?.stateId,
      });
      setAgencies(data);
    } catch (err: any) {
      toastError('Load Error', err.message || 'Failed to load agency reliability index');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, [user]);

  const handleRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const res = await agencyAnalyticsService.recalculateAgencyScores();
      success('Scores Recalculated', res.message || `Recalculated scores for ${res.updatedCount} agencies`);
      loadAgencies();
    } catch (err: any) {
      toastError('Recalculation Failed', err.message || 'Could not recalculate agency indices');
    } finally {
      setIsRecalculating(false);
    }
  };

  const filteredAgencies = agencies.filter((a) => {
    const matchesSearch = a.agencyName.toLowerCase().includes(search.toLowerCase());
    const matchesBand = selectedBand === 'ALL' || a.performanceBand === selectedBand;
    return matchesSearch && matchesBand;
  });

  // KPI calculations
  const totalAgencies = agencies.length;
  const aPlusCount = agencies.filter((a) => a.performanceBand === 'A+' || a.performanceBand === 'A').length;
  const avgOnTime = totalAgencies > 0
    ? Math.round(agencies.reduce((sum, a) => sum + (a.onTimeCompletionRatePct || 0), 0) / totalAgencies)
    : 78;
  const totalWorksManaged = agencies.reduce((sum, a) => sum + (a.totalProjects || 0), 0);

  const getBandBadge = (band: string) => {
    switch (band) {
      case 'A+':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            Band A+
          </span>
        );
      case 'A':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Band A
          </span>
        );
      case 'B':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            Band B
          </span>
        );
      case 'C':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            Band C
          </span>
        );
    }
  };

  const getCompletenessBadge = (status: string) => {
    switch (status) {
      case 'ROBUST':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Robust Data
          </span>
        );
      case 'MODERATE':
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Moderate Data
          </span>
        );
      case 'PRELIMINARY':
      default:
        return (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            Preliminary
          </span>
        );
    }
  };

  // Prepare chart data for modal breakdown
  const getIndicatorChartData = (profile: AgencyReliabilityProfile) => {
    if (!profile.indicatorContributions) {
      return [
        { name: 'On-Time Milestone', score: profile.onTimeCompletionRatePct ? Math.min(30, Math.round(profile.onTimeCompletionRatePct * 0.3)) : 22, max: 30 },
        { name: 'Delay Mitigation', score: Math.max(0, 30 - Math.round((profile.averageDelayDays || 10) * 0.5)), max: 30 },
        { name: 'Budget Discipline', score: Math.max(0, 20 - Math.round((profile.budgetVariancePct || 5) * 0.5)), max: 20 },
        { name: 'Audit Compliance', score: 18, max: 20 },
      ];
    }
    return Object.entries(profile.indicatorContributions).map(([key, val]) => ({
      name: key.replace(/_/g, ' '),
      score: typeof val === 'number' ? Math.round(val) : 0,
      max: 30,
    }));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying official authorization credentials..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100/70 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title="Implementing Agency Reliability Index"
          scopeBadge="Contractor & Line Agency Execution Analytics"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Strip */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gov-navy-900 text-white flex items-center justify-center font-black text-sm shadow-sm border border-gov-navy-700">
                <Building2 className="w-5 h-5 text-gov-saffron" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
                    Implementing Agency & Contractor Performance Index
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Feature 7
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Explainable historical track records, milestone adherence, and budget variance across public execution entities
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadAgencies}
                isLoading={isLoading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleRecalculate}
                isLoading={isRecalculating}
                leftIcon={<Sliders className="w-3.5 h-3.5" />}
              >
                Recalculate Index
              </Button>
            </div>
          </div>

          {/* STATUTORY GOVERNANCE & NON-DISCRIMINATION BANNER */}
          <div className="bg-amber-50 border-l-4 border-gov-saffron p-4 rounded-r-xl text-xs text-amber-950 shadow-2xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">
                Statutory Notice & Procedural Safeguards (Feature 7 Protocol):
              </h4>
              <p className="text-amber-800 mt-1 leading-relaxed">
                The Agency Reliability Index is an <strong>explainable, evidence-based decision-support metric</strong> derived from milestone certifications, PFMS expenditure variance, and documented inspection findings.
                <strong> Rules:</strong> Missing historical records must not be assumed as poor performance. Ratings must never be used to automatically disqualify agencies without human review by the Competent Authority.
              </p>
            </div>
          </div>

          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              title="Monitored Agencies"
              value={totalAgencies.toString()}
              subtext="Line departments & contractors"
              icon={<Building2 className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Tier A+ / A Performers"
              value={aPlusCount.toString()}
              subtext="High reliability rating"
              icon={<Award className="w-5 h-5" />}
              accentColor="green"
            />
            <KpiCard
              title="Avg On-Time Milestone %"
              value={`${avgOnTime}%`}
              subtext="Milestone schedule adherence"
              icon={<Clock className="w-5 h-5" />}
              accentColor="navy"
            />
            <KpiCard
              title="Total Works Managed"
              value={totalWorksManaged.toString()}
              subtext="Sanctioned developmental works"
              icon={<CheckCircle2 className="w-5 h-5" />}
              accentColor="green"
            />
          </div>

          {/* FILTER CONTROLS & SEARCH */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by executing agency name (e.g. Zilla Parishad, PWD)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-gov-navy-900 focus:border-gov-navy-900"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Band:
              </span>
              {(['ALL', 'A+', 'A', 'B', 'C'] as const).map((band) => (
                <button
                  key={band}
                  onClick={() => setSelectedBand(band)}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                    selectedBand === band
                      ? 'bg-gov-navy-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>
          </div>

          {/* AGENCY DIRECTORY TABLE */}
          <Card
            title="Implementing Agency Reliability Scorecard"
            subtitle="Composite score synthesis of on-time milestone delivery, delay mitigation, budget variance, and inspection findings"
            headerIcon={<BarChart3 className="w-5 h-5 text-gov-navy-800" />}
            borderAccent
          >
            <Table
              columns={[
                {
                  key: 'agency',
                  header: 'Executing Agency & Scope',
                  render: (a: AgencyReliabilityProfile) => (
                    <div>
                      <span className="font-bold text-gov-navy-900 text-xs block">{a.agencyName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-500 font-mono">
                          {a.totalProjects} works ({a.completedProjects} done, {a.delayedProjects} delayed)
                        </span>
                        {getCompletenessBadge(a.dataCompletenessStatus)}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'band',
                  header: 'Performance Band',
                  render: (a: AgencyReliabilityProfile) => (
                    <div>
                      {getBandBadge(a.performanceBand)}
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {a.bandDescription || 'Consistent Execution'}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'score',
                  header: 'Reliability Score',
                  render: (a: AgencyReliabilityProfile) => (
                    <div className="w-28 text-xs">
                      <div className="flex justify-between font-mono font-bold">
                        <span className="text-gov-navy-900">{a.compositeReliabilityScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full rounded-full ${
                            a.compositeReliabilityScore >= 80
                              ? 'bg-emerald-600'
                              : a.compositeReliabilityScore >= 65
                              ? 'bg-blue-600'
                              : a.compositeReliabilityScore >= 50
                              ? 'bg-amber-600'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${a.compositeReliabilityScore}%` }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'onTime',
                  header: 'On-Time Adherence',
                  render: (a: AgencyReliabilityProfile) => (
                    <div className="text-xs font-mono">
                      <span className="font-bold text-slate-800">{a.onTimeCompletionRatePct}%</span>
                      <span className="text-[10px] text-slate-500 block">
                        Avg delay: {a.averageDelayDays} days
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'financials',
                  header: 'Sanctioned / Spent',
                  render: (a: AgencyReliabilityProfile) => (
                    <div className="text-xs font-mono">
                      <span className="font-bold text-slate-800">₹{a.totalExpenditureCr?.toFixed(1) || '0.0'} Cr</span>
                      <span className="text-[10px] text-slate-500 block">
                        of ₹{a.totalSanctionedCr?.toFixed(1) || '0.0'} Cr
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'budgetVariance',
                  header: 'Budget Variance',
                  render: (a: AgencyReliabilityProfile) => (
                    <span
                      className={`text-xs font-mono font-bold ${
                        (a.budgetVariancePct || 0) <= 5
                          ? 'text-emerald-700'
                          : (a.budgetVariancePct || 0) <= 15
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {a.budgetVariancePct !== undefined ? `${a.budgetVariancePct > 0 ? '+' : ''}${a.budgetVariancePct}%` : '0%'}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (a: AgencyReliabilityProfile) => (
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAgency(a);
                          setIsDetailModalOpen(true);
                        }}
                        leftIcon={<BarChart3 className="w-3.5 h-3.5" />}
                        className="text-xs font-semibold"
                      >
                        Breakdown
                      </Button>
                      <Link href={`/projects?agency=${encodeURIComponent(a.agencyName)}`}>
                        <Button variant="ghost" size="sm" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Works
                        </Button>
                      </Link>
                    </div>
                  ),
                },
              ]}
              data={filteredAgencies}
              keyExtractor={(a: AgencyReliabilityProfile) => a.agencyName}
            />
          </Card>
        </main>
      </div>

      {/* DETAILED SCORE BREAKDOWN MODAL */}
      {selectedAgency && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Agency Reliability Profile: ${selectedAgency.agencyName}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {/* Summary strip */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Composite Score</span>
                <span className="text-xl font-black font-mono text-gov-navy-900">
                  {selectedAgency.compositeReliabilityScore}/100
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned Performance Band</span>
                <div className="mt-0.5">{getBandBadge(selectedAgency.performanceBand)}</div>
              </div>
            </div>

            {/* Indicator Contribution Chart */}
            <div>
              <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-gov-navy-800" />
                Indicator Weightage & Score Contribution Breakdown
              </h5>
              <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getIndicatorChartData(selectedAgency)}
                    margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 35]} />
                    <Tooltip formatter={(val: any) => [`${val} points`, 'Contribution']} />
                    <Bar dataKey="score" fill="#0A2540" radius={[4, 4, 0, 0]}>
                      {getIndicatorChartData(selectedAgency).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={['#0A2540', '#138808', '#D97706', '#1E609A'][index % 4]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">Total Works</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">{selectedAgency.totalProjects}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">Completed</span>
                <span className="text-sm font-bold font-mono text-emerald-700 mt-0.5 block">{selectedAgency.completedProjects}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">Delayed</span>
                <span className="text-sm font-bold font-mono text-amber-700 mt-0.5 block">{selectedAgency.delayedProjects}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                <span className="text-[10px] text-slate-400 block font-bold">Budget Variance</span>
                <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                  {selectedAgency.budgetVariancePct || 0}%
                </span>
              </div>
            </div>

            {/* Statutory Disclaimer */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-[11px] leading-relaxed">
              <strong>Procedural Note:</strong> {selectedAgency.statutoryNotice || 'This score is calculated based on verified milestone entries in the MPLADS portal and is intended to inform planning allocation, not to replace official tender evaluations.'}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
              <Link href={`/projects?agency=${encodeURIComponent(selectedAgency.agencyName)}`}>
                <Button variant="primary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
                  Inspect Agency Works
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
