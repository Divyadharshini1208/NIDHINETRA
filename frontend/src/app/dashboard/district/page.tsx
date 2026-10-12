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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  FileCheck2,
  IndianRupee,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Check,
  Send,
  Camera,
  MapPin,
  Building
} from 'lucide-react';

export default function DistrictDashboard() {
  const { user } = useAuth();
  const { success } = useToast();
  const districtName = user?.districtName || 'Pune District Collectorate';

  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Approvals Queue
  const pendingApprovals = [
    {
      id: 1,
      recommendationNo: 'MP-REC-2024-88',
      workTitle: 'Installation of Solar-Powered Mini Drinking Water Grid in Khed Taluka',
      recommendedBy: 'Hon. Member of Parliament (Pune PC)',
      estimatedCostLakhs: 24.5,
      technicalSanctionStatus: 'TECHNICAL_SCRUTINY_PASSED',
      implementingAgency: 'Zilla Parishad Pune (Water Supply Dept)',
      dateSubmitted: '24 Sep 2026',
    },
    {
      id: 2,
      recommendationNo: 'MP-REC-2024-91',
      workTitle: 'Establishment of Computer Learning Laboratory in Govt Girls Secondary School',
      recommendedBy: 'Hon. Member of Parliament (Baramati PC)',
      estimatedCostLakhs: 35.0,
      technicalSanctionStatus: 'TECHNICAL_SCRUTINY_PASSED',
      implementingAgency: 'PWD Electrical Division',
      dateSubmitted: '22 Sep 2026',
    },
    {
      id: 3,
      recommendationNo: 'MP-REC-2024-94',
      workTitle: 'Construction of Cement Concrete Road at Gram Panchayat Shindewadi',
      recommendedBy: 'Hon. Member of Parliament (Pune PC)',
      estimatedCostLakhs: 18.0,
      technicalSanctionStatus: 'DPR_VERIFICATION_PENDING',
      implementingAgency: 'Rural Road Development Agency',
      dateSubmitted: '19 Sep 2026',
    },
  ];

  // Active Works Under Execution
  const activeWorks = [
    {
      id: 1,
      code: 'MPLADS-MH-2024-001',
      title: 'Solar-Powered RO Drinking Water Plants in 12 Rural Schools',
      agency: 'Zilla Parishad Pune',
      sanctionedLakhs: 45.0,
      expenditureLakhs: 45.0,
      progress: 100,
      status: 'COMPLETED',
      risk: 'LOW',
    },
    {
      id: 2,
      code: 'MPLADS-MH-2024-002',
      title: 'Modern Smart Classrooms & Science Laboratory at Model Govt High School',
      agency: 'PWD Building Div',
      sanctionedLakhs: 60.0,
      expenditureLakhs: 42.0,
      progress: 75,
      status: 'ONGOING',
      risk: 'LOW',
    },
    {
      id: 3,
      code: 'MPLADS-MH-2024-003',
      title: 'Rural Concrete Connectivity Road connecting Velhe to Ketkawle',
      agency: 'Rural Development Agency',
      sanctionedLakhs: 85.0,
      expenditureLakhs: 72.0,
      progress: 35,
      status: 'DELAYED',
      risk: 'HIGH',
    },
  ];

  const handleReviewApproval = (item: any) => {
    setSelectedApproval(item);
    setIsApprovalModalOpen(true);
  };

  const handleIssueSanction = () => {
    setIsApprovalModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSanction = () => {
    setIsConfirmModalOpen(false);
    success(
      'Administrative Sanction Issued',
      `Official AS order generated for recommendation ${selectedApproval?.recommendationNo} (₹${selectedApproval?.estimatedCostLakhs} Lakhs). Work order allocated to ${selectedApproval?.implementingAgency}.`
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="NIDHINETRA — District Magistrate / Collector Authority Portal"
        scopeBadge={`District Scope: ${districtName}`}
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* District KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard
            title="Total Works Recommended"
            value="140"
            subtext="From Hon'ble MPs"
            icon={<FileCheck2 className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Sanctioned Works"
            value="125"
            subtext="₹58.5 Cr Sanctioned"
            icon={<IndianRupee className="w-5 h-5" />}
            accentColor="green"
          />
          <KpiCard
            title="Under Active Execution"
            value="38"
            subtext="Live physical sites"
            icon={<Activity className="w-5 h-5" />}
            accentColor="navy"
          />
          <KpiCard
            title="Pending AS Orders"
            value="3"
            subtext="Technical DPR passed"
            icon={<Clock className="w-5 h-5" />}
            accentColor="amber"
          />
          <KpiCard
            title="Field Inspection Flags"
            value="3"
            subtext="Site visits scheduled"
            icon={<AlertTriangle className="w-5 h-5" />}
            accentColor="red"
          />
        </div>

        {/* SECTION: PENDING ADMINISTRATIVE SANCTION APPROVALS */}
        <div id="approvals">
          <Card
            title="MP Recommendation & Administrative Sanction (AS) Queue"
            subtitle="Scrutinized developmental proposals awaiting District Magistrate sanction orders"
            headerIcon={<FileCheck2 className="w-5 h-5 text-gov-navy-800" />}
            borderAccent
          >
            <Table
              columns={[
                {
                  key: 'recNo',
                  header: 'Recommendation No & Work Title',
                  render: (item: any) => (
                    <div>
                      <span className="font-bold text-gov-navy-900 font-mono block text-xs">
                        {item.recommendationNo}
                      </span>
                      <span className="text-slate-600 text-xs truncate max-w-md block">{item.workTitle}</span>
                    </div>
                  ),
                },
                {
                  key: 'mp',
                  header: 'Recommended By',
                  render: (item: any) => <span className="text-xs font-semibold text-slate-800">{item.recommendedBy}</span>,
                },
                {
                  key: 'cost',
                  header: 'Estimated Cost',
                  render: (item: any) => <span className="text-xs font-bold text-gov-navy-900">₹{item.estimatedCostLakhs} Lakhs</span>,
                },
                {
                  key: 'status',
                  header: 'Technical Scrutiny',
                  render: (item: any) => (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        item.technicalSanctionStatus === 'TECHNICAL_SCRUTINY_PASSED'
                          ? 'bg-green-50 text-gov-green border-green-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.technicalSanctionStatus === 'TECHNICAL_SCRUTINY_PASSED' ? 'DPR APPROVED' : 'DPR UNDER REVIEW'}
                    </span>
                  ),
                },
                {
                  key: 'agency',
                  header: 'Implementing Agency',
                  render: (item: any) => <span className="text-slate-600 text-xs">{item.implementingAgency}</span>,
                },
                {
                  key: 'action',
                  header: 'Action',
                  render: (item: any) => (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReviewApproval(item)}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Issue Sanction
                    </Button>
                  ),
                },
              ]}
              data={pendingApprovals}
              keyExtractor={(item: any) => item.id}
            />
          </Card>
        </div>

        {/* SECTION: ACTIVE WORKS INSPECTION STATUS */}
        <div id="inspections">
          <Card
            title="District Works Physical Progress & Milestone Telemetry"
            subtitle="Execution monitoring across implementing departments in Pune district"
            headerIcon={<Activity className="w-5 h-5 text-gov-navy-800" />}
          >
            <Table
              columns={[
                {
                  key: 'code',
                  header: 'Work Code & Title',
                  render: (item: any) => (
                    <div>
                      <span className="font-bold text-gov-navy-900 font-mono block text-xs">{item.code}</span>
                      <span className="text-slate-600 text-xs truncate max-w-sm block">{item.title}</span>
                    </div>
                  ),
                },
                {
                  key: 'agency',
                  header: 'Agency',
                  render: (item: any) => <span className="text-slate-700 text-xs font-semibold">{item.agency}</span>,
                },
                {
                  key: 'progress',
                  header: 'Physical Progress',
                  render: (item: any) => (
                    <div className="w-24">
                      <span className="text-[11px] font-bold text-slate-900 block mb-0.5">{item.progress}%</span>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.progress === 100 ? 'bg-gov-green' : item.progress < 40 ? 'bg-gov-saffron' : 'bg-gov-navy-800'
                          }`}
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
                  key: 'risk',
                  header: 'Risk Telemetry',
                  render: (item: any) => <RiskBadge riskLevel={item.risk} />,
                },
              ]}
              data={activeWorks}
              keyExtractor={(item: any) => item.id}
            />
          </Card>
        </div>
      </main>

      {/* APPROVAL DETAIL MODAL */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Sanction Order Preparation & Scrutiny"
        subtitle={selectedApproval?.recommendationNo}
        maxWidth="lg"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleIssueSanction} leftIcon={<FileCheck2 className="w-4 h-4" />}>
              Issue Formal Administrative Sanction (AS)
            </Button>
          </>
        }
      >
        {selectedApproval && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-bold text-sm text-gov-navy-900">{selectedApproval.workTitle}</h4>
              <p className="text-slate-500 mt-1">Recommended By: {selectedApproval.recommendedBy}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 block">Sanction Estimate:</span>
                <span className="text-sm font-black text-gov-navy-900">₹{selectedApproval.estimatedCostLakhs} Lakhs</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 block">Designated Executing Agency:</span>
                <span className="text-xs font-bold text-slate-800">{selectedApproval.implementingAgency}</span>
              </div>
            </div>

            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-900">
              <span className="font-bold block text-xs">Technical Feasibility & DPR Compliance Certified</span>
              <p className="mt-0.5 text-[11px] text-green-800">
                Executive Engineer has certified technical viability and estimated schedule of rates compliance under MPLADS guidelines.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM SANCTION DIALOG */}
      <ConfirmDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSanction}
        title="Confirm Administrative Sanction Issuance"
        message={`Are you sure you want to issue the official Administrative Sanction Order for ${selectedApproval?.recommendationNo}? This will allocate ₹${selectedApproval?.estimatedCostLakhs} Lakhs to ${selectedApproval?.implementingAgency} and notify the Hon'ble MP.`}
        confirmLabel="Confirm & Issue AS Order"
        variant="info"
      />
    </div>
  );
}
