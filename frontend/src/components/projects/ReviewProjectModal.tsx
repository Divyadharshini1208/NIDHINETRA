'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { projectService } from '@/services/projectService';
import { Project, ProjectReviewRequest } from '@/types';
import {
  Building2,
  FileCheck,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  FileText,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';

interface ReviewProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess?: (updated: Project) => void;
}

export function ReviewProjectModal({ isOpen, project, onClose, onSuccess }: ReviewProjectModalProps) {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [remarks, setRemarks] = useState('');
  const [sanctionedAmount, setSanctionedAmount] = useState('');
  const [sanctionOrderNumber, setSanctionOrderNumber] = useState('');
  const [sanctionDate, setSanctionDate] = useState('');
  const [implementingAgency, setImplementingAgency] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project && isOpen) {
      setRemarks(project.feasibilityRemarks || '');
      setSanctionedAmount(project.sanctionedAmount ? project.sanctionedAmount.toString() : '');
      const defaultOrderNum = `DM/${project.districtCode || 'PUN'}/MPLADS/${new Date().getFullYear()}/${String(project.id).padStart(3, '0')}`;
      setSanctionOrderNumber(defaultOrderNum);
      setSanctionDate(new Date().toISOString().split('T')[0]);
      setImplementingAgency(project.implementingAgency || 'Zilla Parishad Engineering Division');
      setErrors({});
    }
  }, [project, isOpen]);

  if (!project) return null;

  const handleAction = async (action: 'SANCTION' | 'REJECT') => {
    const newErrors: Record<string, string> = {};

    if (!remarks.trim()) {
      newErrors.remarks = action === 'SANCTION'
        ? 'Feasibility assessment and technical scrutiny remarks are required'
        : 'Please state the specific reason/objection for rejection';
    }

    if (action === 'SANCTION') {
      if (!sanctionedAmount || parseFloat(sanctionedAmount) <= 0) {
        newErrors.sanctionedAmount = 'Approved sanctioned amount must be greater than 0';
      }
      if (!sanctionOrderNumber.trim()) {
        newErrors.sanctionOrderNumber = 'Sanction order number is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ProjectReviewRequest = {
        action,
        remarks: remarks.trim(),
        sanctionedAmount: action === 'SANCTION' ? parseFloat(sanctionedAmount) : undefined,
        sanctionOrderNumber: action === 'SANCTION' ? sanctionOrderNumber.trim() : undefined,
        sanctionDate: action === 'SANCTION' ? sanctionDate : undefined,
        implementingAgency: implementingAgency.trim() || undefined,
      };

      const updated = await projectService.reviewProject(project.id, payload);

      if (action === 'SANCTION') {
        toastSuccess(
          'Project Sanctioned & Approved',
          `Work ${project.projectId} has been formally sanctioned under Order ${sanctionOrderNumber}.`
        );
      } else {
        toastSuccess(
          'Project Rejected / Returned',
          `Work ${project.projectId} has been rejected with objections recorded in the dossier.`
        );
      }

      if (onSuccess) {
        onSuccess(updated);
      }
      onClose();
    } catch (err: any) {
      toastError(
        'Review Action Failed',
        err.message || 'Unable to process project review. Please check your permissions and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="District Technical Scrutiny & Sanction Assessment"
      subtitle={`Review recommendation submitted by MP for ${project.projectId}`}
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Close
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAction('REJECT')}
              isLoading={isSubmitting}
              className="text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400"
              leftIcon={<XCircle className="w-3.5 h-3.5 text-red-600" />}
            >
              Reject / Return Work
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAction('SANCTION')}
              isLoading={isSubmitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Approve & Sanction Work
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1 text-slate-800 text-xs">
        {/* Project Profile Summary Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono font-bold text-xs text-gov-navy-900">{project.projectId}</span>
                <StatusBadge status={project.status} />
              </div>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{project.projectName}</h4>
            </div>
            <div className="text-right whitespace-nowrap">
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Recommended Budget</span>
              <span className="text-sm font-black text-gov-navy-900 font-mono">₹ {project.sanctionedAmount} Lakhs</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
            <div>
              <span className="text-slate-500 block">Recommended By</span>
              <strong className="text-slate-800">{project.mpName || 'Hon. MP'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Category</span>
              <strong className="text-slate-800">{project.categoryName || 'Infrastructure'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Constituency</span>
              <strong className="text-slate-800">{project.constituencyName || 'Pune'}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Beneficiaries</span>
              <strong className="text-slate-800">{project.beneficiaries ? `${project.beneficiaries.toLocaleString('en-IN')} citizens` : 'General Public'}</strong>
            </div>
          </div>

          {project.locationDetails && (
            <div className="text-[11px] pt-1">
              <span className="text-slate-500">Site Location: </span>
              <span className="text-slate-800 font-medium">{project.locationDetails}</span>
            </div>
          )}

          {project.description && (
            <div className="p-2.5 bg-white rounded border border-slate-200 text-[11px] text-slate-700">
              <strong className="text-slate-900 block mb-0.5">MP Justification & Scope:</strong>
              {project.description}
            </div>
          )}
        </div>

        {/* Technical Feasibility & Scrutiny Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-xs">
              District Technical Feasibility Assessment
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feasibility & Technical Scrutiny Remarks <span className="text-red-600">*</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Field inspection carried out by Executive Engineer on site. Estimates conform to State PWD Schedule of Rates. Land title verified as public property without encumbrances."
              className="w-full text-xs rounded-md border border-slate-300 p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy-600"
            />
            {errors.remarks && <p className="mt-1 text-xs text-red-600 font-medium">{errors.remarks}</p>}
          </div>

          {/* Sanction Details (Pre-filled for approval) */}
          <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-lg space-y-3">
            <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wide block">
              Official Sanction Parameters (Applied on Approval)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Sanction Order Number"
                  value={sanctionOrderNumber}
                  onChange={(e) => setSanctionOrderNumber(e.target.value)}
                  error={errors.sanctionOrderNumber}
                  helperText="Official administrative dispatch reference"
                />
              </div>
              <div>
                <Input
                  label="Approved Sanction Amount (₹ Lakhs)"
                  type="number"
                  step="0.01"
                  value={sanctionedAmount}
                  onChange={(e) => setSanctionedAmount(e.target.value)}
                  error={errors.sanctionedAmount}
                  helperText="Final amount formally approved by District Authority"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Input
                  label="Sanction Order Date"
                  type="date"
                  value={sanctionDate}
                  onChange={(e) => setSanctionDate(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Designated Implementing Agency"
                  value={implementingAgency}
                  onChange={(e) => setImplementingAgency(e.target.value)}
                  helperText="Agency authorized to issue tender & execute work"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
