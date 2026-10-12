'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { IndiaMap } from '@/components/map/IndiaMap';
import { StateBarChart } from '@/components/charts/StateBarChart';
import { StatusPieChart } from '@/components/charts/StatusPieChart';
import { TrendAreaChart } from '@/components/charts/TrendAreaChart';
import { CategoryBarChart } from '@/components/charts/CategoryBarChart';
import { publicService } from '@/services/publicService';
import { officialDataService } from '@/services/officialDataService';
import { InsightsSummary, OfficialMpladsData } from '@/types';
import { formatNumber } from '@/utils/formatters';
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  Filter,
  Info,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsSummary | null>(null);
  const [officialData, setOfficialData] = useState<OfficialMpladsData>(officialDataService.getFallbackOfficialData());
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filters
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedYear, setSelectedYear] = useState<string>('2024-25');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Statuses');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [res, offData] = await Promise.all([
          publicService.getInsightsSummary().catch(() => null),
          officialDataService.getOfficialSummary().catch(() => null)
        ]);
        if (res && res.data) setInsights(res.data);
        if (offData) setOfficialData(offData);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSyncOfficial = async () => {
    setIsSyncing(true);
    try {
      const data = await officialDataService.syncOfficialData();
      if (data) setOfficialData(data);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedState('All States');
    setSelectedYear('2024-25');
    setSelectedCategory('All Categories');
    setSelectedStatus('All Statuses');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      {/* Hero Banner */}
      <section className="bg-gov-navy-900 text-white py-6 px-4 sm:px-6 lg:px-8 border-b-2 border-gov-saffron">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-gov-saffron-light text-xs font-bold uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Public Fund Telemetry</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              NIDHINETRA | MPLADS Public Insights & Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Statistical aggregation, fund utilization analytics, and physical execution telemetry across Parliamentary Constituencies.
            </p>
          </div>

          <div className="bg-white/10 border border-white/20 px-3.5 py-2 rounded-lg text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-gov-saffron-light block">
              Central Telemetry Node
            </span>
            <span className="text-xs font-bold text-white">18th Lok Sabha National View</span>
          </div>
        </div>
      </section>

      {/* 1. OFFICIAL MOSPI SCHEME TELEMETRY PANEL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-3 w-full">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded bg-gov-navy-100 text-gov-navy-900">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <span className="text-xs font-black text-gov-navy-900 block">
                  Official MoSPI MPLADS Macro Totals
                </span>
                <span className="text-[11px] text-slate-500">
                  Direct live stream from{' '}
                  <a
                    href={officialData.sourcePortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gov-navy-700 underline font-semibold inline-flex items-center gap-0.5"
                  >
                    mplads.mospi.gov.in <ExternalLink className="w-2.5 h-2.5" />
                  </a>{' '}
                  &bull; Tenure: <strong>{officialData.currentTenure}</strong>
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncOfficial}
              isLoading={isSyncing}
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Sync Official Feed
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Allocated Limit</span>
              <span className="text-base font-black text-gov-navy-900 block mt-0.5">{officialData.allocatedLimitCr}</span>
              <span className="text-[10px] text-slate-400">Total entitlement pool</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Works Recommended</span>
              <span suppressHydrationWarning className="text-base font-black text-blue-800 block mt-0.5">{formatNumber(officialData.worksRecommendedCount)}</span>
              <span className="text-[10px] text-slate-400">{officialData.worksRecommendedCr}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Works Sanctioned</span>
              <span suppressHydrationWarning className="text-base font-black text-indigo-800 block mt-0.5">{formatNumber(officialData.worksSanctionedCount)}</span>
              <span className="text-[10px] text-slate-400">{officialData.worksSanctionedCr}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Works Completed</span>
              <span suppressHydrationWarning className="text-base font-black text-gov-green block mt-0.5">{formatNumber(officialData.worksCompletedCount)}</span>
              <span className="text-[10px] text-slate-400">{officialData.worksCompletedCr}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Expenditure Incurred</span>
              <span className="text-base font-black text-emerald-800 block mt-0.5">{officialData.expenditureOngoingCompletedCr}</span>
              <span className="text-[10px] text-slate-400">On ongoing & completed works</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 w-full">
        {/* Notice for Project Dataset */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-gov-navy-800 shrink-0" />
            <span>
              <strong>Micro-Analytics Dataset:</strong> Detailed telemetry below is computed from active monitored projects across Parliamentary Constituencies.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
            Live Stream
          </span>
        </div>

        {/* 2. MULTI-LEVEL FILTER CONTROL PANEL */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-gov-navy-900 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-gov-saffron" />
              <span>Multi-Dimensional Telemetry Filters</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">
                Filtered Scope: <strong className="text-gov-navy-900">{selectedState}</strong>
              </span>
              <Button variant="ghost" size="sm" onClick={handleResetFilters} leftIcon={<RefreshCw className="w-3 h-3" />}>
                Reset
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Select
              label="State / Union Territory"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="All States">All States & UTs (National)</option>
              <option value="Maharashtra">Maharashtra (MH)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (UP)</option>
              <option value="Karnataka">Karnataka (KA)</option>
              <option value="Tamil Nadu">Tamil Nadu (TN)</option>
              <option value="Gujarat">Gujarat (GJ)</option>
              <option value="Rajasthan">Rajasthan (RJ)</option>
              <option value="Bihar">Bihar (BR)</option>
              <option value="West Bengal">West Bengal (WB)</option>
            </Select>

            <Select
              label="Financial Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2024-25">FY 2024-25 (Current)</option>
              <option value="2023-24">FY 2023-24</option>
              <option value="2022-23">FY 2022-23</option>
              <option value="2021-22">FY 2021-22</option>
              <option value="2020-21">FY 2020-21</option>
            </Select>

            <Select
              label="Project Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All Categories">All Development Sectors</option>
              <option value="Drinking Water">Drinking Water & RO Plants</option>
              <option value="Education">Education & School Labs</option>
              <option value="Roads & Bridges">Roads & Bridges</option>
              <option value="Healthcare">Healthcare & Diagnostic Centers</option>
              <option value="Sanitation">Sanitation & Solar Lights</option>
            </Select>

            <Select
              label="Execution Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="All Statuses">All Project Statuses</option>
              <option value="COMPLETED">Completed Only</option>
              <option value="ONGOING">Ongoing / In Progress</option>
              <option value="DELAYED">Delayed / Milestone Exceeded</option>
              <option value="SANCTIONED">Sanctioned / Pending Commencement</option>
            </Select>
          </div>
        </div>

        {/* 3. CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title="State-Wise Fund Utilization"
            subtitle="Sanctioned allocation vs actual PFMS disbursements across top states"
            headerIcon={<TrendingUp className="w-5 h-5 text-gov-navy-800" />}
          >
            <div className="h-72 w-full pt-2">
              <StateBarChart data={insights?.stateWiseDistribution} />
            </div>
          </Card>

          <Card
            title="Multi-Year Completion & Sanction Trajectory"
            subtitle="Historical trend of works sanctioned and completed across 5 financial years"
            headerIcon={<Clock className="w-5 h-5 text-gov-navy-800" />}
          >
            <div className="h-72 w-full pt-2">
              <TrendAreaChart data={insights?.completionTrends} />
            </div>
          </Card>

          <Card
            title="Sectoral Development Works Distribution"
            subtitle="Proportional breakdown across critical community infrastructure sectors"
            headerIcon={<Layers className="w-5 h-5 text-gov-navy-800" />}
          >
            <div className="h-72 w-full pt-2">
              <CategoryBarChart data={insights?.categoryWiseDistribution} />
            </div>
          </Card>

          <Card
            title="Execution Status Breakdown"
            subtitle="Current execution distribution of monitored projects"
            headerIcon={<PieIcon className="w-5 h-5 text-gov-navy-800" />}
          >
            <div className="h-72 w-full pt-2">
              <StatusPieChart data={insights?.statusBreakdown} />
            </div>
          </Card>
        </div>

        {/* 4. GEOGRAPHIC HEATMAP */}
        <Card
          title="Geographic Implementation Map & State Heatmap"
          subtitle="Interactive spatial distribution of MPLADS fund utilization across States & Union Territories"
          headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
        >
          <div className="p-2">
            <IndiaMap onSelectState={(stateCode) => setSelectedState(stateCode)} />
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
