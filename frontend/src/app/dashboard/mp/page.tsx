'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/common/Topbar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  UserCheck,
  IndianRupee,
  Building2,
  CheckCircle2,
  Clock,
  PlusCircle,
  Users,
  Award,
  Send,
  Droplet,
  GraduationCap,
  HeartPulse,
  Truck
} from 'lucide-react';

export default function MpDashboard() {
  const { user } = useAuth();
  const { success } = useToast();
  const pcName = user?.constituencyName || 'Pune Parliamentary Constituency (Lok Sabha)';

  const [isNewWorkModalOpen, setIsNewWorkModalOpen] = useState(false);
  const [workTitle, setWorkTitle] = useState('');
  const [category, setCategory] = useState('Drinking Water');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [taluka, setTaluka] = useState('Haveli / Pune Urban');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MP Recommended Works Queue
  const mpWorks = [
    {
      id: 1,
      code: 'MPLADS-MH-2024-001',
      title: 'Construction of Solar-Powered RO Drinking Water Plants in 12 Rural Schools',
      category: 'Drinking Water',
      sanctionedLakhs: 45.0,
      expenditureLakhs: 45.0,
      progress: 100,
      status: 'COMPLETED',
      impact: '12,500 Students Benefited',
    },
    {
      id: 2,
      code: 'MPLADS-MH-2024-002',
      title: 'Modern Smart Classrooms & Science Laboratory at Model Govt High School',
      category: 'Education',
      sanctionedLakhs: 60.0,
      expenditureLakhs: 42.0,
      progress: 75,
      status: 'ONGOING',
      impact: '850 High School Students',
    },
    {
      id: 3,
      code: 'MPLADS-MH-2024-004',
      title: 'Installation of 150 LED High-Mast Solar Street Lights in Peri-Urban Wards',
      category: 'Sanitation & Utilities',
      sanctionedLakhs: 30.0,
      expenditureLakhs: 12.0,
      progress: 40,
      status: 'ONGOING',
      impact: '18,000 Residents',
    },
    {
      id: 4,
      code: 'MP-REC-2024-88',
      title: 'Installation of Solar-Powered Mini Drinking Water Grid in Khed Taluka',
      category: 'Drinking Water',
      sanctionedLakhs: 24.5,
      expenditureLakhs: 0.0,
      progress: 0,
      status: 'SANCTIONED',
      impact: '3,200 Villagers',
    },
  ];

  const handleRecommendWork = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsNewWorkModalOpen(false);
      success(
        'Recommendation Dispatched to District Collector',
        `Proposal for "${workTitle}" (₹${estimatedCost} Lakhs) submitted for technical feasibility scrutiny.`
      );
      setWorkTitle('');
      setEstimatedCost('');
      setJustification('');
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="NIDHINETRA — Member of Parliament (MP) Constituency Portal"
        scopeBadge={pcName}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Annual Entitlement Gauge Card */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs border-t-4 border-t-gov-navy-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-gov-saffron uppercase tracking-wider">
                Annual Constituency Allocation (FY 2024-25)
              </span>
              <h2 className="text-xl font-black text-gov-navy-900 mt-0.5">
                MPLADS Fund Entitlement: ₹ 5.00 Crore
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Allocated to Hon'ble Member of Parliament for developmental works in {pcName}
              </p>
            </div>

            <Button
              variant="saffron"
              size="md"
              onClick={() => setIsNewWorkModalOpen(true)}
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Recommend New Work
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">Sanctioned Amount:</span>
              <span className="text-base font-black text-gov-navy-900">₹ 4.25 Crore</span>
              <span className="text-[11px] text-gov-green font-semibold block mt-0.5">85% Entitlement Committed</span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">Actual Expenditure Disbursed:</span>
              <span className="text-base font-black text-gov-green">₹ 3.65 Crore</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">73% of Total Envelope</span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-500 block">Available Balance for New Works:</span>
              <span className="text-base font-black text-gov-navy-900">₹ 0.75 Crore</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">₹ 75 Lakhs uncommitted</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Overall Fund Commitment Progress:</span>
              <span>85% Committed</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-gov-navy-800 h-full rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>

        {/* MP KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Recommended Works"
            value="34"
            subtext="Total lifetime proposals"
            icon={<Building2 className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Completed Works"
            value="18"
            subtext="Commissioned for public use"
            icon={<CheckCircle2 className="w-5 h-5" />}
            accentColor="green"
          />
          <KpiCard
            title="Under Execution"
            value="12"
            subtext="Milestones in progress"
            icon={<Clock className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Estimated Citizens Impacted"
            value="68,000+"
            subtext="Constituency residents"
            icon={<Users className="w-5 h-5" />}
            accentColor="saffron"
          />
        </div>

        {/* SECTION: CONSTITUENCY WORKS TRACKER */}
        <div id="works">
          <Card
            title="Constituency Project Lifecycle & Progress Tracker"
            subtitle="Status of works recommended by Hon'ble MP and approved by District Collector"
            headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
            borderAccent
          >
            <Table
              columns={[
                {
                  key: 'title',
                  header: 'Work Title & Code',
                  render: (item: any) => (
                    <div>
                      <span className="font-bold text-gov-navy-900 block text-xs">{item.title}</span>
                      <span className="text-[11px] font-mono text-slate-500">{item.code}</span>
                    </div>
                  ),
                },
                {
                  key: 'category',
                  header: 'Sector',
                  render: (item: any) => (
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  ),
                },
                {
                  key: 'cost',
                  header: 'Sanctioned Cost',
                  render: (item: any) => <span className="text-xs font-bold text-gov-navy-900">₹{item.sanctionedLakhs} Lakhs</span>,
                },
                {
                  key: 'progress',
                  header: 'Physical Progress',
                  render: (item: any) => (
                    <div className="w-24">
                      <span className="text-[11px] font-bold text-slate-800 block mb-0.5">{item.progress}%</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.progress === 100 ? 'bg-gov-green' : 'bg-gov-navy-800'}`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item: any) => <StatusBadge status={item.status} />,
                },
                {
                  key: 'impact',
                  header: 'Citizen Impact',
                  render: (item: any) => (
                    <span className="text-xs text-gov-navy-800 font-medium">{item.impact}</span>
                  ),
                },
              ]}
              data={mpWorks}
              keyExtractor={(item: any) => item.id}
            />
          </Card>
        </div>

        {/* SECTION: CITIZEN IMPACT HIGHLIGHTS */}
        <div id="impact">
          <Card
            title="Constituency Community Impact Breakdown"
            subtitle="Creation of durable public assets for local population in Pune Parliamentary Constituency"
            headerIcon={<Award className="w-5 h-5 text-gov-saffron" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-200 flex items-start space-x-3">
                <div className="p-2 rounded bg-blue-100 text-blue-800 flex-shrink-0">
                  <Droplet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gov-navy-900 text-sm">Drinking Water</h4>
                  <p className="text-slate-600 mt-1">12 RO purification plants operational, delivering clean water to 12,500 school children.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50/60 border border-green-200 flex items-start space-x-3">
                <div className="p-2 rounded bg-green-100 text-gov-green flex-shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gov-navy-900 text-sm">Education & Tech</h4>
                  <p className="text-slate-600 mt-1">4 high school science labs and smart classrooms equipped with digital libraries.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 flex items-start space-x-3">
                <div className="p-2 rounded bg-amber-100 text-amber-800 flex-shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gov-navy-900 text-sm">Public Health</h4>
                  <p className="text-slate-600 mt-1">2 primary health diagnostic sub-centers equipped with pathology equipment.</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-100/70 border border-slate-200 flex items-start space-x-3">
                <div className="p-2 rounded bg-slate-200 text-slate-800 flex-shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gov-navy-900 text-sm">Rural Connectivity</h4>
                  <p className="text-slate-600 mt-1">6.2 km of all-weather concrete roads linking interior agricultural hamlets.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* RECOMMEND NEW WORK MODAL */}
      <Modal
        isOpen={isNewWorkModalOpen}
        onClose={() => setIsNewWorkModalOpen(false)}
        title="Submit New MPLADS Work Recommendation"
        subtitle="Formal recommendation under MPLADS Scheme Guidelines"
        maxWidth="lg"
      >
        <form onSubmit={handleRecommendWork} className="space-y-4 text-xs">
          <Input
            label="Title of Proposed Developmental Work"
            required
            placeholder="e.g. Construction of Community Center & Skill Hall"
            value={workTitle}
            onChange={(e) => setWorkTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Priority Sector"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Drinking Water">Drinking Water & Purification</option>
              <option value="Education">Education & School Infrastructure</option>
              <option value="Healthcare">Healthcare & Primary Diagnostics</option>
              <option value="Roads & Bridges">Rural Roads & Connectivity</option>
              <option value="Sanitation">Sanitation & Solar Lighting</option>
            </Select>

            <Input
              label="Estimated Cost (₹ Lakhs)"
              type="number"
              required
              placeholder="e.g. 25.0"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
            />
          </div>

          <Input
            label="Location / Taluka / Block in Constituency"
            required
            placeholder="e.g. Haveli Block, Pune District"
            value={taluka}
            onChange={(e) => setTaluka(e.target.value)}
          />

          <div className="w-full">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Public Utility & Community Justification
            </label>
            <textarea
              rows={3}
              required
              className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-gov-navy-600 focus:outline-none"
              placeholder="Explain how this community asset directly benefits local citizens..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsNewWorkModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="saffron" size="sm" type="submit" isLoading={isSubmitting} leftIcon={<Send className="w-3.5 h-3.5" />}>
              Submit Recommendation to District Collector
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
