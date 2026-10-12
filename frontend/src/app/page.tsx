'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { officialDataService } from '@/services/officialDataService';
import { OfficialMpladsData } from '@/types';
import { formatNumber } from '@/utils/formatters';
import { BRAND } from '@/config/branding';
import {
  ShieldCheck,
  BarChart3,
  TrendingUp,
  FileCheck2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Building2,
  Users,
  MapPin,
  RefreshCw,
  ExternalLink,
  Landmark,
  Layers,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function HomePage() {
  const [officialData, setOfficialData] = useState<OfficialMpladsData>(officialDataService.getFallbackOfficialData());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    officialDataService.getOfficialSummary().then((data) => {
      if (data) setOfficialData(data);
    });
  }, []);

  const handleSyncOfficialData = async () => {
    setIsSyncing(true);
    try {
      const data = await officialDataService.syncOfficialData();
      if (data) setOfficialData(data);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-[#0A2540] to-[#0D3356] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-b-2 border-gov-saffron">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium text-slate-200">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>{BRAND.fullBranding}</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  NIDHI<span className="text-amber-400">NETRA</span>
                </h1>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300 mt-1.5">
                  {BRAND.subtitle}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-200 italic mt-1">
                  &ldquo;{BRAND.tagline}&rdquo;
                </p>
              </div>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
                {BRAND.purpose}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="md"
                    variant="saffron"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full font-bold shadow-xs"
                  >
                    Access NIDHINETRA Portal
                  </Button>
                </Link>

                <Link href="/insights" className="w-full sm:w-auto">
                  <Button
                    size="md"
                    variant="outline"
                    className="w-full text-white border-white/30 hover:bg-white/10"
                    leftIcon={<BarChart3 className="w-4 h-4 text-gov-saffron-light" />}
                  >
                    Explore Public Insights
                  </Button>
                </Link>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-gov-green" /> 5-Tier RBAC
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-gov-saffron-light" /> Explainable AI Engine
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" /> 543 Constituencies
                </span>
              </div>
            </div>

            {/* Right: 1-Click Evaluation Personas */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 rounded-xl border border-slate-700/80 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-4 h-4 text-gov-saffron" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Quick Role Evaluation
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gov-green/20 text-gov-green-light border border-gov-green/30">
                    TEST ACCESS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Link
                    href="/login"
                    className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-gov-saffron transition flex flex-col justify-between"
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      Ministry Admin
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">National MoSPI Oversight</span>
                  </Link>

                  <Link
                    href="/login"
                    className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-gov-saffron transition flex flex-col justify-between"
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-amber-400" />
                      State Nodal
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">State Planning Dept</span>
                  </Link>

                  <Link
                    href="/login"
                    className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-gov-saffron transition flex flex-col justify-between"
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      District Collector
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">District Execution Authority</span>
                  </Link>

                  <Link
                    href="/login"
                    className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-gov-saffron transition flex flex-col justify-between"
                  >
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      Hon. MP
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">Parliamentary Constituency</span>
                  </Link>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Preloaded demonstration credentials</span>
                  <Link href="/login" className="text-gov-saffron hover:underline font-semibold">
                    Sign In &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFICIAL MOSPI DATA TELEMETRY */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full -mt-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gov-navy-900">
                  Official MoSPI MPLADS National Telemetry
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800">
                  {officialData.isLiveFetched ? 'LIVE SYNC' : 'VERIFIED SNAPSHOT'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Verified against Central eSAKSHI Server (
                <a
                  href={officialData.sourcePortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gov-navy-800 underline inline-flex items-center gap-0.5"
                >
                  mplads.mospi.gov.in <ExternalLink className="w-2.5 h-2.5" />
                </a>
                ) &bull; Tenure: <strong>{officialData.currentTenure}</strong>
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncOfficialData}
              isLoading={isSyncing}
              leftIcon={<RefreshCw className="w-3 h-3" />}
            >
              Sync Official Feed
            </Button>
          </div>

          {/* 5 Macro Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Allocated Limit</span>
              <span className="text-base sm:text-lg font-black text-gov-navy-900 block mt-0.5">
                {officialData.allocatedLimitCr}
              </span>
              <span className="text-[10px] text-slate-400">Total entitlement pool</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Works Recommended</span>
              <span suppressHydrationWarning className="text-base sm:text-lg font-black text-blue-800 block mt-0.5">
                {formatNumber(officialData.worksRecommendedCount)}
              </span>
              <span className="text-[10px] text-slate-400">{officialData.worksRecommendedCr}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Works Sanctioned</span>
              <span suppressHydrationWarning className="text-base sm:text-lg font-black text-indigo-800 block mt-0.5">
                {formatNumber(officialData.worksSanctionedCount)}
              </span>
              <span className="text-[10px] text-slate-400">{officialData.worksSanctionedCr}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Works Completed</span>
              <span suppressHydrationWarning className="text-base sm:text-lg font-black text-gov-green block mt-0.5">
                {formatNumber(officialData.worksCompletedCount)}
              </span>
              <span className="text-[10px] text-slate-400">{officialData.worksCompletedCr}</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Expenditure Incurred</span>
              <span className="text-base sm:text-lg font-black text-emerald-800 block mt-0.5">
                {officialData.expenditureOngoingCompletedCr}
              </span>
              <span className="text-[10px] text-slate-400">PFMS verified utilization</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CORE PLATFORM PILLARS (4 CONCISE CARDS) */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gov-navy-900 tracking-tight">
            Integrated Scheme Governance Pillars
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            End-to-end telemetry and analytical decision support across all 543 Parliamentary Constituencies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center mb-3">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-900 mb-1">Project Telemetry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track MP recommendations, administrative sanctions, geotagged progress, and PFMS financial disbursements.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-900 mb-1">Explainable AI Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Isolation Forest anomaly detection, progress vs expenditure mismatch, and duplicate civil work screening.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-900 mb-1">Geospatial GIS Map</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interactive Leaflet satellite grid with clustered markers, risk heatmaps, and constituency asset drilling.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition">
            <div className="w-8 h-8 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-gov-navy-900 mb-1">Multi-Tier RBAC</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dedicated operational dashboards tailored for Ministry Admins, State Nodal Officers, District Collectors, and MPs.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SCHEME LIFECYCLE PROGRESSION */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
          <div className="text-xs font-bold text-gov-navy-900 uppercase tracking-wider mb-3">
            Standard Scheme Execution Lifecycle
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-gov-navy-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <div>
                <span className="font-bold text-gov-navy-900 block">MP Recommendation</span>
                <span className="text-[10px] text-slate-500">Citizen felt need</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-gov-navy-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <div>
                <span className="font-bold text-gov-navy-900 block">District Sanction</span>
                <span className="text-[10px] text-slate-500">Technical estimate</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-gov-navy-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
              <div>
                <span className="font-bold text-gov-navy-900 block">PFMS Fund Release</span>
                <span className="text-[10px] text-slate-500">Tranche disbursal</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-gov-navy-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
              <div>
                <span className="font-bold text-gov-navy-900 block">Milestone Inspection</span>
                <span className="text-[10px] text-slate-500">Geotagged photos & UC</span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-gov-green text-white flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
              <div>
                <span className="font-bold text-gov-navy-900 block">Asset Handover</span>
                <span className="text-[10px] text-slate-500">Commissioned work</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-start space-x-2 text-[11px] text-slate-500">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Administrative Guidance:</strong> The AI Anomaly engine provides decision-support indicators for administrative review and audit inquiry, adhering to MoSPI non-accusatory guidelines.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
