'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, AlertTriangle, FileCheck, ShieldAlert } from 'lucide-react';
import { collectorInspectionService } from '@/services/collectorInspectionService';
import { InspectionQueueItem, InspectionOutcomePayload } from '@/types';
import { useToast } from '@/context/ToastContext';

interface InspectionOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InspectionQueueItem | null;
  onSuccess: (updated: InspectionQueueItem) => void;
}

export function InspectionOutcomeModal({
  isOpen,
  onClose,
  item,
  onSuccess,
}: InspectionOutcomeModalProps) {
  const { success, error: toastError } = useToast();
  const [outcome, setOutcome] = useState<InspectionOutcomePayload['findingsOutcome']>('SATISFACTORY');
  const [summary, setSummary] = useState('');
  const [action, setAction] = useState('Clear for next installment release');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item || !item.id) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!summary.trim()) {
      toastError('Validation Error', 'Findings summary is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await collectorInspectionService.recordInspectionOutcome({
        assignmentId: item.id!,
        findingsOutcome: outcome,
        findingsSummary: summary.trim(),
        recommendedAction: action.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });
      success('Inspection Findings Certified', `Recorded verified outcome (${outcome}) for ${item.projectCode}`);
      onSuccess(updated);
      onClose();
    } catch (err: any) {
      toastError('Submission Failed', err.message || 'Could not record inspection findings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Certify Site Inspection Findings"
      subtitle={`Statutory Measurement Book & Site Audit for ${item.projectCode}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Project Header */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="font-bold text-gov-navy-900 text-sm truncate">{item.projectName}</p>
          <div className="flex flex-wrap gap-x-4 text-slate-600 mt-1">
            <span>Officer: <strong>{item.assignedOfficer || 'Competent Authority'}</strong></span>
            <span>Target: <strong>{item.deadline || 'Immediate'}</strong></span>
          </div>
        </div>

        {/* Findings Outcome Select */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Certified Inspection Finding *
          </label>
          <select
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as any)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900 font-semibold"
          >
            <option value="SATISFACTORY">✅ SATISFACTORY — Work executes per approved DPR & MB records</option>
            <option value="MINOR_ISSUES">⚠️ MINOR ISSUES — Slight timeline lag; structural milestones certified</option>
            <option value="IRREGULARITY_FOUND">🚨 IRREGULARITY FOUND — Certified MB measurements do not match ground execution</option>
            <option value="SEVERE_MISMATCH">🛑 SEVERE MISMATCH — Disproportionate expenditure with nominal progress</option>
            <option value="ESCALATED">⚡ ESCALATED — Referred to State Nodal Authority & Technical Vigilance</option>
          </select>
        </div>

        {/* Detailed Findings Summary */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Inspection Findings Summary & Ground Measurements *
          </label>
          <textarea
            required
            rows={3}
            placeholder="e.g. Inspected site on 14-Oct-2026. Sub-structure complete, plinth beam concrete cast. Total measured physical execution matches 45%. Recommended for sanction of second tranche."
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900"
          />
        </div>

        {/* Recommended Action */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Recommended Administrative Next Action
          </label>
          <input
            type="text"
            placeholder="e.g. Authorize tranche disbursal / Hold bills pending rectification"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900"
          />
        </div>

        {/* Inspection Remarks */}
        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Measurement Book (MB) Reference & Photographic Notes
          </label>
          <input
            type="text"
            placeholder="e.g. MB Vol IV, Page 112, Item 4. Geotagged site photos uploaded."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-gov-navy-800 text-xs text-slate-900"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Submit Certified Outcome
          </Button>
        </div>
      </form>
    </Modal>
  );
}
