'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/common/Topbar';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { dashboardService } from '@/services/dashboardService';
import {
  Building2,
  AlertTriangle,
  IndianRupee,
  CheckCircle2,
  Clock,
  History,
  ShieldAlert,
  Search,
  Download,
  Filter,
  Eye,
  FileCheck,
  Send,
  Sparkles
} from 'lucide-react';

export default function MinistryDashboard() {
  const { user } = useAuth();
  const { success } = useToast();

  const [selectedAnomaly, setSelectedAnomaly] = useState<any | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Sample Anomaly Queue Data
  const anomalyQueue = [
    {
      id: 1,
      code: 'MPLADS-UP-2024-003',
      title: 'Deep Tube-well Water Distribution Pipeline in Rohania Block',
      state: 'Uttar Pradesh',
      district: 'Varanasi',
      sanctionedLakhs: 55.0,
      expenditureLakhs: 50.0,
      progress: 20,
      riskLevel: 'ANOMALY_FLAGGED',
      reason: 'Potential Anomaly: Unusually rapid payment release (91% in 30 days) with low physical milestone verification (20%).',
      flaggedDate: '28 Sep 2026',
    },
    {
      id: 2,
      code: 'MPLADS-MH-2024-003',
      title: 'Rural Concrete Connectivity Road connecting Velhe to Ketkawle',
      state: 'Maharashtra',
      district: 'Pune',
      sanctionedLakhs: 85.0,
      expenditureLakhs: 72.0,
      progress: 35,
      riskLevel: 'HIGH',
      reason: 'Progress vs Expenditure Mismatch: 84% funds disbursed but only 35% physical progress recorded. Milestone delay > 120 days.',
      flaggedDate: '25 Sep 2026',
    },
    {
      id: 3,
      code: 'MPLADS-BR-2024-012',
      title: 'Construction of Community Hall and Skill Training Room',
      state: 'Bihar',
      district: 'Patna',
      sanctionedLakhs: 40.0,
      expenditureLakhs: 38.0,
      progress: 30,
      riskLevel: 'HIGH',
      reason: 'Timeline Drift: Expected completion date lapsed by 9 months with minimal physical site updates.',
      flaggedDate: '22 Sep 2026',
    },
    {
      id: 4,
      code: 'MPLADS-RJ-2024-009',
      title: 'Solar High-Mast Street Lighting Installation in 18 Wards',
      state: 'Rajasthan',
      district: 'Jaipur',
      sanctionedLakhs: 32.0,
      expenditureLakhs: 10.0,
      progress: 25,
      riskLevel: 'MODERATE',
      reason: 'Material procurement halt reported by executing agency.',
      flaggedDate: '20 Sep 2026',
    },
  ];

  // State Allocations
  const stateAllocations = [
    { code: 'UP', name: 'Uttar Pradesh', sanctionedCr: 640.0, expenditureCr: 528.0, activeProjects: 1280, util: 82.5 },
    { code: 'MH', name: 'Maharashtra', sanctionedCr: 480.0, expenditureCr: 412.5, activeProjects: 920, util: 85.9 },
    { code: 'WB', name: 'West Bengal', sanctionedCr: 420.0, expenditureCr: 350.0, activeProjects: 840, util: 83.3 },
    { code: 'BR', name: 'Bihar', sanctionedCr: 400.0, expenditureCr: 310.0, activeProjects: 800, util: 77.5 },
    { code: 'TN', name: 'Tamil Nadu', sanctionedCr: 390.0, expenditureCr: 345.0, activeProjects: 780, util: 88.5 },
    { code: 'KA', name: 'Karnataka', sanctionedCr: 320.0, expenditureCr: 275.4, activeProjects: 640, util: 86.1 },
  ];

  // Audit Logs
  const auditLogs = [
    { id: 101, action: 'USER_LOGIN', user: 'ministry.admin@gov.in', role: 'ROLE_MINISTRY_ADMIN', time: 'Today, 22:34', ip: '127.0.0.1', status: 'SUCCESS' },
    { id: 102, action: 'RISK_FLAG_INSPECTED', user: 'ministry.admin@gov.in', role: 'ROLE_MINISTRY_ADMIN', time: 'Today, 21:15', ip: '127.0.0.1', status: 'SUCCESS' },
    { id: 103, action: 'STATE_SANCTION_POOL_SYNC', user: 'SYSTEM_DAEMON', role: 'SYSTEM', time: 'Today, 18:00', ip: '10.0.4.12', status: 'SUCCESS' },
    { id: 104, action: 'USER_LOGIN', user: 'district.pune@gov.in', role: 'ROLE_DISTRICT_AUTHORITY', time: 'Today, 15:20', ip: '192.168.1.45', status: 'SUCCESS' },
  ];

  const handleInspectAnomaly = (item: any) => {
    setSelectedAnomaly(item);
    setIsActionModalOpen(true);
  };

  const handleRequestVerification = () => {
    setIsActionModalOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirmDirective = () => {
    setIsConfirmOpen(false);
    success(
      'Inspection Directive Issued',
      `Formal inquiry request dispatched to District Magistrate (${selectedAnomaly?.district}) for project ${selectedAnomaly?.code}.`
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="NIDHINETRA — Central Ministry Administration Dashboard"
        scopeBadge="National Scope (Central MoSPI)"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total Projects Monitored"
            value="9,344"
            subtext="Across 36 States/UTs"
            icon={<Building2 className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Total Sanctioned"
            value="₹ 4,860.5 Cr"
            subtext="Central allocation pool"
            icon={<IndianRupee className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Total Expenditure"
            value="₹ 4,120.2 Cr"
            subtext="PFMS disbursed"
            icon={<CheckCircle2 className="w-5 h-5" />}
            accentColor="green"
          />
          <KpiCard
            title="National Utilization"
            value="84.8%"
            subtext="+3.2% vs target"
            icon={<Clock className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Potential Anomaly Flags"
            value="94"
            subtext="Requires field review"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="red"
          />
        </div>

        {/* SECTION: ANOMALY QUEUE */}
        <div id="anomalies">
          <Card
            title="National AI Risk & Anomaly Review Queue"
            subtitle="Prioritized list of works exhibiting significant variance between financial disbursements and physical milestone execution"
            headerIcon={<ShieldAlert className="w-5 h-5 text-red-600" />}
            borderAccent
            action={
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-semibold">94 Active Flags</span>
                <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  Export CSV
                </Button>
              </div>
            }
          >
            <Table
              columns={[
                {
                  key: 'code',
                  header: 'Project Code & Title',
                  render: (item: any) => (
                    <div>
                      <span className="font-bold text-gov-navy-900 block font-mono text-xs">{item.code}</span>
                      <span className="text-slate-600 text-xs truncate max-w-xs block">{item.title}</span>
                    </div>
                  ),
                },
                {
                  key: 'location',
                  header: 'Jurisdiction',
                  render: (item: any) => (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-900">{item.district}</span>
                      <span className="text-slate-500 block">{item.state}</span>
                    </div>
                  ),
                },
                {
                  key: 'financials',
                  header: 'Sanctioned / Spent',
                  render: (item: any) => (
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">₹{item.expenditureLakhs}L</span>
                      <span className="text-slate-500"> / ₹{item.sanctionedLakhs}L</span>
                    </div>
                  ),
                },
                {
                  key: 'progress',
                  header: 'Physical Progress',
                  render: (item: any) => (
                    <div className="w-24">
                      <div className="flex justify-between text-[11px] font-bold mb-0.5">
                        <span>{item.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gov-navy-800 h-full rounded-full"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'riskLevel',
                  header: 'Risk Classification',
                  render: (item: any) => <RiskBadge riskLevel={item.riskLevel} />,
                },
                {
                  key: 'actions',
                  header: 'Action',
                  render: (item: any) => (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInspectAnomaly(item)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                  ),
                },
              ]}
              data={anomalyQueue}
              keyExtractor={(item: any) => item.id}
            />
          </Card>
        </div>

        {/* SECTION: STATE ALLOCATION TELEMETRY & AUDIT LOGS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* State Allocation Matrix */}
          <div id="states" className="lg:col-span-2">
            <Card
              title="State Nodal Allocation & Fund Utilization"
              subtitle="Overview of state-wise fund envelope and active projects"
              headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
            >
              <Table
                columns={[
                  {
                    key: 'name',
                    header: 'State / UT',
                    render: (item: any) => (
                      <div className="font-bold text-gov-navy-900">
                        {item.name} <span className="font-normal text-slate-400">({item.code})</span>
                      </div>
                    ),
                  },
                  {
                    key: 'sanctionedCr',
                    header: 'Sanctioned',
                    render: (item: any) => <span>₹{item.sanctionedCr.toFixed(1)} Cr</span>,
                  },
                  {
                    key: 'expenditureCr',
                    header: 'Expenditure',
                    render: (item: any) => <span className="font-bold text-gov-green">₹{item.expenditureCr.toFixed(1)} Cr</span>,
                  },
                  {
                    key: 'activeProjects',
                    header: 'Works',
                    render: (item: any) => <span>{item.activeProjects}</span>,
                  },
                  {
                    key: 'util',
                    header: 'Utilization',
                    render: (item: any) => (
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-green-50 text-gov-green border border-green-200">
                        {item.util}%
                      </span>
                    ),
                  },
                ]}
                data={stateAllocations}
                keyExtractor={(item: any) => item.code}
              />
            </Card>
          </div>

          {/* Live System Audit Log */}
          <div id="audit" className="lg:col-span-1">
            <Card
              title="System Audit Trail"
              subtitle="Latest security & administrative events"
              headerIcon={<History className="w-5 h-5 text-slate-600" />}
            >
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-50 rounded-md border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-gov-navy-900">{log.action}</span>
                      <span className="text-[10px] text-slate-400">{log.time}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] truncate">User: {log.user}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                      <span>Role: {log.role}</span>
                      <span className="text-gov-green font-bold">{log.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* INSPECTION MODAL */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title="Project Telemetry & Risk Dossier"
        subtitle={selectedAnomaly?.code}
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsActionModalOpen(false)}>
              Close
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={handleRequestVerification}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              Issue District Verification Directive
            </Button>
          </>
        }
      >
        {selectedAnomaly && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-bold text-sm text-gov-navy-900">{selectedAnomaly.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Location: {selectedAnomaly.district}, {selectedAnomaly.state}
              </p>
            </div>

            {/* Financial vs Physical Progress */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded">
                <span className="text-xs text-slate-500 block">Funds Disbursed:</span>
                <span className="text-base font-black text-gov-navy-900">
                  ₹{selectedAnomaly.expenditureLakhs} Lakhs
                </span>
                <span className="text-[11px] text-slate-400 block">
                  of ₹{selectedAnomaly.sanctionedLakhs} Lakhs (
                  {Math.round((selectedAnomaly.expenditureLakhs / selectedAnomaly.sanctionedLakhs) * 100)}%)
                </span>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded">
                <span className="text-xs text-slate-500 block">Certified Physical Progress:</span>
                <span className="text-base font-black text-red-600">{selectedAnomaly.progress}%</span>
                <span className="text-[11px] text-slate-400 block">Last inspection: 14 days ago</span>
              </div>
            </div>

            {/* Risk Explanation */}
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg space-y-1">
              <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>Identified Variance Indicator</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">{selectedAnomaly.reason}</p>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              Issuing a verification directive requires the District Magistrate to deploy an inspection engineer to certify on-ground asset status within 14 working days.
            </p>
          </div>
        )}
      </Modal>

      {/* CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDirective}
        title="Confirm Verification Directive Dispatch"
        message={`Are you sure you want to issue an official inquiry directive to the District Magistrate of ${selectedAnomaly?.district} regarding project ${selectedAnomaly?.code}?`}
        confirmLabel="Issue Official Directive"
        variant="warning"
      />
    </div>
  );
}
