'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import {
  ClipboardCheck,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  FileCheck,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { collectorInspectionService } from '@/services/collectorInspectionService';
import { InspectionQueueItem, WeeklyInspectionSummary } from '@/types';
import { AssignInspectionModal } from './AssignInspectionModal';
import { InspectionOutcomeModal } from './InspectionOutcomeModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface CollectorInspectionSectionProps {
  districtId?: number;
  initialQueue?: InspectionQueueItem[];
}

export function CollectorInspectionSection({ districtId }: CollectorInspectionSectionProps) {
  const { user } = useAuth();
  const { error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [queue, setQueue] = useState<InspectionQueueItem[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklyInspectionSummary | null>(null);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'URGENT' | 'UNASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  // Modals state
  const [assignModalItem, setAssignModalItem] = useState<InspectionQueueItem | null>(null);
  const [outcomeModalItem, setOutcomeModalItem] = useState<InspectionQueueItem | null>(null);

  const effectiveDistrictId = districtId || user?.districtId;

  const loadInspectionData = async () => {
    setIsLoading(true);
    try {
      const [queueRes, summaryRes] = await Promise.all([
        collectorInspectionService.getInspectionQueue({
          districtId: effectiveDistrictId,
          size: 50,
        }),
        collectorInspectionService.getWeeklySummary(effectiveDistrictId).catch(() => null),
      ]);
      setQueue(queueRes?.content || []);
      setWeeklySummary(summaryRes);
    } catch (err: any) {
      toastError('Inspection Load Error', err.message || 'Could not load inspection queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInspectionData();
  }, [effectiveDistrictId]);

  const handleUpdateItem = (updated: InspectionQueueItem) => {
    setQueue((prev) =>
      prev.map((item) => (item.projectId === updated.projectId ? updated : item))
    );
  };

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      item.projectCode.toLowerCase().includes(search.toLowerCase()) ||
      item.projectName.toLowerCase().includes(search.toLowerCase()) ||
      (item.assignedOfficer && item.assignedOfficer.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'URGENT') return item.priorityRank === 'URGENT' || item.priorityRank === 'HIGH';
    if (filterTab === 'UNASSIGNED') return item.inspectionStatus === 'UNASSIGNED';
    if (filterTab === 'IN_PROGRESS') return item.inspectionStatus === 'PENDING_INSPECTION' || item.inspectionStatus === 'IN_PROGRESS';
    if (filterTab === 'COMPLETED') return item.inspectionStatus === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. WEEKLY COMPLIANCE KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Total Assigned</span>
            <ClipboardCheck className="w-4 h-4 text-gov-navy-800" />
          </div>
          <p className="text-xl font-bold text-gov-navy-900 mt-1">
            {weeklySummary?.totalAssignedInspections || queue.filter(q => q.inspectionStatus !== 'UNASSIGNED').length || 0}
          </p>
          <span className="text-[10px] text-slate-400">Past 7 days active</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Completed Inspections</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {weeklySummary?.completedInspectionsCount || queue.filter(q => q.inspectionStatus === 'COMPLETED').length || 0}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {weeklySummary?.compliancePercentage ? `${weeklySummary.compliancePercentage}% certified` : 'Certified on-ground'}
          </span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>High-Priority Pending</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-amber-700 mt-1">
            {weeklySummary?.pendingHighPriorityCount || queue.filter(q => q.priorityRank === 'URGENT' && q.inspectionStatus !== 'COMPLETED').length || 0}
          </p>
          <span className="text-[10px] text-amber-600 font-semibold">Immediate site review required</span>
        </div>

        <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-semibold">
            <span>Average Turnaround</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-slate-800 mt-1">
            {weeklySummary?.averageInspectionTurnaroundDays || 8.4} <span className="text-xs font-normal text-slate-500">days</span>
          </p>
          <span className="text-[10px] text-slate-400">Assignment to report</span>
        </div>
      </div>

      {/* 2. INSPECTION QUEUE TABLE CARD */}
      <Card
        title="AI-Prioritized Collectorate Field Inspection Queue"
        subtitle="Intelligent risk scoring prioritizing projects with high expenditure drawdowns, delay trajectories, or progress anomalies"
        headerIcon={<Sparkles className="w-5 h-5 text-gov-navy-800" />}
        borderAccent
      >
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {(
              [
                { key: 'ALL', label: `All Flagged (${queue.length})` },
                { key: 'URGENT', label: 'Urgent / High Risk' },
                { key: 'UNASSIGNED', label: 'Unassigned' },
                { key: 'IN_PROGRESS', label: 'In Progress' },
                { key: 'COMPLETED', label: 'Completed' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap transition ${
                  filterTab === tab.key
                    ? 'bg-gov-navy-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by code, title, officer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="mt-2">
          <Table
            columns={[
              {
                key: 'rank',
                header: 'Priority Rank',
                render: (item: InspectionQueueItem) => (
                  <div className="space-y-0.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black uppercase ${
                        item.priorityRank === 'URGENT'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : item.priorityRank === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {item.priorityRank}
                    </span>
                    <span className="block text-[10px] font-bold text-slate-500">
                      Score: {item.riskScore}/100
                    </span>
                  </div>
                ),
              },
              {
                key: 'project',
                header: 'Project Details',
                render: (item: InspectionQueueItem) => (
                  <div className="max-w-xs space-y-0.5">
                    <Link
                      href={`/projects/${item.projectId}`}
                      className="font-bold text-gov-navy-900 hover:text-gov-navy-700 hover:underline line-clamp-1 text-xs"
                      title={item.projectName}
                    >
                      {item.projectName}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="font-mono font-semibold">{item.projectCode}</span>
                      <span>•</span>
                      <span>{item.categoryName}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: 'progress',
                header: 'Financial vs Physical Drawdown',
                render: (item: InspectionQueueItem) => (
                  <div className="w-36 space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="font-semibold text-slate-600">Fin: {item.financialProgressPct}%</span>
                      <span className="font-semibold text-slate-600">Phys: {item.physicalProgressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-600 h-full"
                        style={{ width: `${Math.min(item.physicalProgressPct, 100)}%` }}
                        title={`Physical Progress: ${item.physicalProgressPct}%`}
                      />
                      {item.progressMismatchGapPct > 0 && (
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${Math.min(item.progressMismatchGapPct, 100 - item.physicalProgressPct)}%` }}
                          title={`Disproportionate Gap: +${item.progressMismatchGapPct}%`}
                        />
                      )}
                    </div>
                    {item.progressMismatchGapPct >= 20 && (
                      <span className="block text-[9px] font-bold text-red-600">
                        Gap: +{item.progressMismatchGapPct}% mismatch
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'reasons',
                header: 'Risk Diagnostic Rationale',
                render: (item: InspectionQueueItem) => (
                  <div className="max-w-xs space-y-0.5">
                    {item.contributingReasons && item.contributingReasons.length > 0 ? (
                      item.contributingReasons.slice(0, 2).map((r, i) => (
                        <p key={i} className="text-[11px] text-slate-600 line-clamp-1 leading-snug">
                          • {r}
                        </p>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">Routine milestone review</span>
                    )}
                  </div>
                ),
              },
              {
                key: 'status',
                header: 'Inspection Status',
                render: (item: InspectionQueueItem) => (
                  <div className="space-y-0.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.inspectionStatus === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : item.inspectionStatus === 'IN_PROGRESS' || item.inspectionStatus === 'PENDING_INSPECTION'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {item.inspectionStatus.replace('_', ' ')}
                    </span>
                    {item.assignedOfficer && (
                      <span className="block text-[10px] text-slate-500 truncate max-w-[120px]">
                        {item.assignedOfficer}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                key: 'actions',
                header: 'Action Directive',
                render: (item: InspectionQueueItem) => (
                  <div className="flex items-center gap-1.5">
                    {item.inspectionStatus === 'UNASSIGNED' ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setAssignModalItem(item)}
                      >
                        <UserCheck className="w-3 h-3 mr-1" /> Assign Officer
                      </Button>
                    ) : item.inspectionStatus !== 'COMPLETED' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setOutcomeModalItem(item)}
                      >
                        <FileCheck className="w-3 h-3 mr-1" /> Record Findings
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Certified
                      </span>
                    )}
                  </div>
                ),
              },
            ]}
            data={filteredQueue}
            keyExtractor={(item) => item.projectId}
            emptyMessage="No projects currently queued for physical inspection in this filter view."
          />
        </div>
      </Card>

      {/* MODALS */}
      <AssignInspectionModal
        isOpen={!!assignModalItem}
        onClose={() => setAssignModalItem(null)}
        item={assignModalItem}
        onSuccess={handleUpdateItem}
      />

      <InspectionOutcomeModal
        isOpen={!!outcomeModalItem}
        onClose={() => setOutcomeModalItem(null)}
        item={outcomeModalItem}
        onSuccess={handleUpdateItem}
      />
    </div>
  );
}
