'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UserCheck, Calendar, FileText, AlertCircle } from 'lucide-react';
import { collectorInspectionService } from '@/services/collectorInspectionService';
import { InspectionQueueItem } from '@/types';
import { useToast } from '@/context/ToastContext';

interface AssignInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InspectionQueueItem | null;
  onSuccess: (updated: InspectionQueueItem) => void;
}

export function AssignInspectionModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: AssignInspectionModalProps) {
  const { success, error: toastError } = useToast();
  const [officerName, setOfficerName] = useState('');
  const [officerDesignation, setOfficerDesignation] = useState('Executive Engineer (Civil)');
  const [deadline, setDeadline] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerName.trim()) {
      toastError('Validation Error', 'Inspecting Officer Name is required');
      return;
    }
    if (!deadline) {
      toastError('Validation Error', 'Inspection Deadline date is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await collectorInspectionService.assignInspection({
        projectId: item.projectId,
        assignedOfficerName: officerName.trim(),
        assignedOfficerDesignation: officerDesignation.trim(),
        deadline,
        remarks: remarks.trim() || undefined,
      });
      success('Inspection Directive Assigned', `Field inspection assigned to ${officerName} for ${item.projectCode}`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      toastError('Assignment Failed', err.message || 'Could not assign inspection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Field Inspection Directive"
      subtitle={`Statutory On-Site Verification for ${item.projectCode}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Project Context Box */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <p className="font-bold text-gov-navy-900 text-sm truncate">{item.projectName}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-600">
            <span>District: <strong>{item.districtName}</strong></span>
            <span>Category: <strong>{item.categoryName}</strong></span>
            <span>Risk Score: <strong className="text-red-700">{item.riskScore}/100</strong></span>
            <span>Mismatch Gap: <strong className="text-amber-700">{item.progressMismatchGapPct}%</strong></span>
          </div>
        </div>

        {/* Assigned Officer Name */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Designated Inspection Officer *
          </label>
          <div className="relative">
            <UserCheck className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              required
              placeholder="e.g. Er. Rajesh K. Sharma"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Designation */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Officer Designation / Department
          </label>
          <input
            type="text"
            placeholder="e.g. Executive Engineer (PWD / Zilla Parishad)"
            value={officerDesignation}
            onChange={(e) => setOfficerDesignation(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900"
          />
        </div>

        {/* Inspection Deadline */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Inspection Completion Deadline *
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Supervisory Remarks */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Special Inspection Terms & Measurement Directives
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Verify foundation depth and reinforcement steel against MB records. Cross-check certified 40% civil completion against ground state."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900"
          />
        </div>

        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
          <span>
            Issuing this directive records an unalterable audit log entry and notifies the District Collectorate Inspection Cell.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Confirm Directive & Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
}
