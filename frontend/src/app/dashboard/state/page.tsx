'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/common/Topbar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Building,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Eye,
  Building2,
  TrendingUp,
  MapPin
} from 'lucide-react';

export default function StateNodalDashboard() {
  const { user } = useAuth();
  const { success } = useToast();
  const stateName = user?.stateName || 'Maharashtra';

  const districtLeaderboard = [
    { id: 1, name: 'Pune', collector: 'Dr. Suhas Diwase, IAS', sanctionedCr: 65.0, expenditureCr: 58.5, works: 140, completedRate: 74, util: 90.0 },
    { id: 2, name: 'Nagpur', collector: 'Dr. Vipin Itankar, IAS', sanctionedCr: 50.0, expenditureCr: 43.0, works: 110, completedRate: 71, util: 86.0 },
    { id: 3, name: 'Nashik', collector: 'Shri Jalaj Sharma, IAS', sanctionedCr: 48.0, expenditureCr: 41.5, works: 95, completedRate: 68, util: 86.4 },
    { id: 4, name: 'Thane', collector: 'Shri Ashok Shingare, IAS', sanctionedCr: 55.0, expenditureCr: 44.0, works: 120, completedRate: 65, util: 80.0 },
    { id: 5, name: 'Chhatrapati Sambhajinagar', collector: 'Shri Dilip Swami, IAS', sanctionedCr: 42.0, expenditureCr: 33.6, works: 85, completedRate: 62, util: 80.0 },
  ];

  const stateDelayedWorks = [
    {
      id: 1,
      code: 'MPLADS-MH-2024-003',
      title: 'Rural Concrete Connectivity Road connecting Velhe to Ketkawle',
      district: 'Pune',
      agency: 'Rural Development Agency',
      sanctionedLakhs: 85.0,
      expenditureLakhs: 72.0,
      progress: 35,
      delayDays: 120,
    },
    {
      id: 2,
      code: 'MPLADS-MH-2024-019',
      title: 'Construction of Solar Water Storage Tank at Ambegaon',
      district: 'Pune',
      agency: 'Zilla Parishad Water Cell',
      sanctionedLakhs: 28.0,
      expenditureLakhs: 22.0,
      progress: 40,
      delayDays: 95,
    },
    {
      id: 3,
      code: 'MPLADS-MH-2024-044',
      title: 'Primary Health Center Sub-Unit Renovation',
      district: 'Nagpur',
      agency: 'PWD Building Division',
      sanctionedLakhs: 45.0,
      expenditureLakhs: 30.0,
      progress: 50,
      delayDays: 75,
    },
  ];

  const handleSendDistrictReminder = (district: string, code: string) => {
    success('District Alert Dispatched', `Urgent milestone review notification sent to District Collector (${district}) for project ${code}.`);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="NIDHINETRA — State Nodal Authority Dashboard"
        scopeBadge={`State Jurisdiction: ${stateName}`}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* State KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="State Monitored Works"
            value="920"
            subtext="Across 36 Districts"
            icon={<Building className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="State Sanction Pool"
            value="₹ 480.0 Cr"
            subtext="State allocation"
            icon={<IndianRupee className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="State Expenditure"
            value="₹ 412.5 Cr"
            subtext="85.9% utilization"
            icon={<CheckCircle2 className="w-5 h-5" />}
            accentColor="green"
          />
          <KpiCard
            title="Completed Projects"
            value="648"
            subtext="70.4% state rate"
            icon={<Clock className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Delayed Works"
            value="24"
            subtext="Under active escalation"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="amber"
          />
        </div>

        {/* SECTION: DISTRICT PERFORMANCE LEADERBOARD */}
        <div id="districts">
          <Card
            title={`District Performance & Utilization Matrix (${stateName})`}
            subtitle="Comparative review of project sanction pacing, expenditure velocity, and completion milestones across district collectorates"
            headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
            borderAccent
          >
            <Table
              columns={[
                {
                  key: 'name',
                  header: 'District Collectorate',
                  render: (item: any) => (
                    <div>
                      <span className="font-bold text-gov-navy-900 block">{item.name}</span>
                      <span className="text-[11px] text-slate-500">{item.collector}</span>
                    </div>
                  ),
                },
                {
                  key: 'financials',
                  header: 'Sanctioned / Spent',
                  render: (item: any) => (
                    <div className="text-xs">
                      <span className="font-bold text-gov-green">₹{item.expenditureCr} Cr</span>
                      <span className="text-slate-500"> / ₹{item.sanctionedCr} Cr</span>
                    </div>
                  ),
                },
                {
                  key: 'works',
                  header: 'Total Works',
                  render: (item: any) => <span className="text-xs font-semibold">{item.works}</span>,
                },
                {
                  key: 'completedRate',
                  header: 'Completion %',
                  render: (item: any) => (
                    <div className="w-24">
                      <span className="text-[11px] font-bold text-slate-800 block mb-0.5">{item.completedRate}%</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gov-green h-full rounded-full" style={{ width: `${item.completedRate}%` }} />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'util',
                  header: 'Fund Utilization',
                  render: (item: any) => (
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-green-50 text-gov-green border border-green-200">
                      {item.util}%
                    </span>
                  ),
                },
              ]}
              data={districtLeaderboard}
              keyExtractor={(item: any) => item.id}
            />
          </Card>
        </div>

        {/* SECTION: DELAYED WORKS REVIEW */}
        <div id="delayed">
          <Card
            title="State Delayed Works Escalation Queue"
            subtitle="Projects exceeding scheduled completion dates by over 60 days requiring state nodal review"
            headerIcon={<AlertTriangle className="w-5 h-5 text-gov-saffron" />}
          >
            <Table
              columns={[
                {
                  key: 'code',
                  header: 'Project Code & Description',
                  render: (item: any) => (
                    <div>
                      <span className="font-bold font-mono text-gov-navy-900 block">{item.code}</span>
                      <span className="text-slate-600 text-xs truncate max-w-sm block">{item.title}</span>
                    </div>
                  ),
                },
                {
                  key: 'district',
                  header: 'District',
                  render: (item: any) => <span className="font-semibold text-slate-800">{item.district}</span>,
                },
                {
                  key: 'agency',
                  header: 'Executing Agency',
                  render: (item: any) => <span className="text-slate-600 text-xs">{item.agency}</span>,
                },
                {
                  key: 'progress',
                  header: 'Physical Progress',
                  render: (item: any) => (
                    <span className="font-bold text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {item.progress}%
                    </span>
                  ),
                },
                {
                  key: 'delayDays',
                  header: 'Delay Duration',
                  render: (item: any) => (
                    <span className="text-xs font-bold text-red-600">
                      {item.delayDays} Days Overdue
                    </span>
                  ),
                },
                {
                  key: 'action',
                  header: 'Escalate',
                  render: (item: any) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendDistrictReminder(item.district, item.code)}
                      leftIcon={<Send className="w-3 h-3 text-gov-saffron" />}
                    >
                      Alert DM
                    </Button>
                  ),
                },
              ]}
              data={stateDelayedWorks}
              keyExtractor={(item: any) => item.id}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}
