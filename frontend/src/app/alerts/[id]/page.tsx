'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { alertService } from '@/services/alertService';
import { aiMonitoringService } from '@/services/aiMonitoringService';
import { RiskAlert, Project, AiAnalysisPreview } from '@/types';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { LoadingState, ErrorState } from '@/components/ui/StateViews';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  UserCheck,
  FileText,
  Building2,
  IndianRupee,
  Calendar,
  Layers,
  Sparkles,
  Send,
  Upload,
  RefreshCw,
  HelpCircle,
  TrendingUp,
  FileCheck2,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

export default function AlertDetailPage() {
  const params = useParams();
  const router = useRouter();
  const alertId = params?.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [alert, setAlert] = useState<RiskAlert | null>(null);
  const [aiPreview, setAiPreview] = useState<AiAnalysisPreview | null>(null);
  const [duplicateCheck, setDuplicateCheck] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Investigation action states
  const [noteText, setNoteText] = useState<string>('');
  const [assigneeName, setAssigneeName] = useState<string>('');
  const [escalationReason, setEscalationReason] = useState<string>('');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);

  const loadAlertData = async () => {
    if (!alertId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await alertService.getAlertById(alertId);
      setAlert(data);
      if (data.assignedTo) setAssigneeName(data.assignedTo);

      // Load on-demand AI telemetry
      if (data.projectId) {
        aiMonitoringService.analyzeProject(data.projectId).then(setAiPreview).catch(() => null);
        aiMonitoringService.detectDuplicates(data.projectId).then(setDuplicateCheck).catch(() => null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not retrieve risk alert details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlertData();
  }, [alertId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!alert) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await alertService.updateStatus(alert.id, {
        status: newStatus,
        noteText: `Investigation status changed to ${newStatus} by ${user?.fullName || 'Authority'}`,
      });
      setAlert(updated);
      success('Status Updated', `Case status updated to ${newStatus}.`);
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not update alert status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alert || !assigneeName.trim()) return;
    try {
      const updated = await alertService.assignAlert(alert.id, assigneeName.trim());
      setAlert(updated);
      success('Investigation Assigned', `Assigned case to ${assigneeName.trim()}.`);
    } catch (err: any) {
      toastError('Assignment Failed', err.message || 'Could not assign case');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alert || !noteText.trim()) return;
    setIsSubmittingNote(true);
    try {
      const updated = await alertService.addNote(alert.id, noteText.trim());
      setAlert(updated);
      setNoteText('');
      success('Note Recorded', 'Official investigation observation committed to audit trail.');
    } catch (err: any) {
      toastError('Note Recording Failed', err.message || 'Could not record note');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleEscalate = async () => {
    if (!alert) return;
    const reason = prompt('Please state justification for escalating this case to CRITICAL priority:');
    if (!reason) return;

    try {
      const updated = await alertService.escalate(alert.id, reason);
      setAlert(updated);
      success('Case Escalated', 'Alert priority elevated to CRITICAL with executive flag.');
    } catch (err: any) {
      toastError('Escalation Failed', err.message || 'Could not escalate case');
    }
  };

  const handleReanalyzeProject = async () => {
    if (!alert) return;
    setIsReanalyzing(true);
    try {
      const res = await aiMonitoringService.analyzeProject(alert.projectId);
      setAiPreview(res);
      success('AI Re-evaluation Completed', `Updated risk score: ${res.anomalyRiskScore}/100.`);
      loadAlertData();
    } catch (err: any) {
      toastError('Analysis Failed', err.message || 'Could not run AI inference');
    } finally {
      setIsReanalyzing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar title="Risk Alert Investigation Dossier" />
          <main className="p-8 max-w-7xl mx-auto w-full">
            <LoadingState message="Loading risk alert telemetry and case notes..." />
          </main>
        </div>
      </div>
    );
  }

  if (errorMsg || !alert) {
    return (
      <div className="flex min-h-screen bg-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Topbar title="Risk Alert Investigation Dossier" />
          <main className="p-8 max-w-7xl mx-auto w-full">
            <ErrorState
              title="Alert Dossier Not Found"
              description={errorMsg || 'The specified risk alert does not exist or you lack jurisdiction.'}
              onRetry={() => router.push('/alerts')}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={`Investigation Dossier: #ALT-${alert.id}`}
          scopeBadge={`${alert.stateName} / ${alert.districtName}`}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Navigation & Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Link
              href="/alerts"
              className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-gov-navy-900 bg-white hover:bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-lg shadow-2xs transition w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-1 text-slate-500" />
              Back to Risk Alerts Queue
            </Link>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleReanalyzeProject}
                disabled={isReanalyzing}
                className="inline-flex items-center px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold shadow-2xs transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-gov-saffron ${isReanalyzing ? 'animate-spin' : ''}`} />
                Run AI Inference Again
              </button>

              <button
                onClick={handleEscalate}
                className="inline-flex items-center px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                Escalate Priority
              </button>
            </div>
          </div>

          {/* Statutory Protocol Alert Notice */}
          <div className="bg-amber-50 border-l-4 border-gov-saffron p-4 rounded-r-xl text-xs text-amber-950 shadow-xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                Statutory Human-in-the-Loop Protocol: Potential Anomaly Verification
              </p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                This case has been highlighted for executive and technical scrutiny based on statistical variance algorithms. It is not an assertion of administrative irregularity until certified by physical site inspection.
              </p>
            </div>
          </div>

          {/* Core Case Dossier Header Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Project Details & 6 Core Answers */}
            <div className="lg:col-span-2 space-y-6">
              {/* Project Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {alert.projectCode}
                    </span>
                    <h2 className="text-lg font-black text-gov-navy-900 mt-1">{alert.projectName}</h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Sector: <span className="font-semibold text-slate-800">{alert.categoryName || 'Infrastructure'}</span> | Jurisdiction: <span className="font-semibold text-slate-800">{alert.stateName}, {alert.districtName}</span>
                    </p>
                  </div>
                  <Link
                    href={`/projects/${alert.projectId}`}
                    className="inline-flex items-center text-xs font-bold text-gov-navy-800 hover:text-gov-navy-900 bg-gov-navy-50 border border-gov-navy-200 px-3 py-1.5 rounded-lg transition"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1 text-gov-saffron" />
                    Open Master Record
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Sanctioned Budget</p>
                    <p className="font-mono font-bold text-gov-navy-900 text-sm mt-0.5">
                      ₹{Number(alert.sanctionedAmount || 0).toFixed(2)} Lakhs
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Physical Progress</p>
                    <p className="font-mono font-bold text-gov-navy-900 text-sm mt-0.5">
                      {alert.physicalProgress || 0}%
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Financial Progress</p>
                    <p className="font-mono font-bold text-gov-navy-900 text-sm mt-0.5">
                      {Number(alert.financialProgress || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-slate-500 text-[10px] font-bold uppercase">Progress Gap</p>
                    <p className="font-mono font-bold text-amber-700 text-sm mt-0.5">
                      {((alert.financialProgress || 0) - (alert.physicalProgress || 0)).toFixed(1)} pts
                    </p>
                  </div>
                </div>
              </div>

              {/* The 6 Core Investigation Questions Framework */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-black text-gov-navy-900 uppercase tracking-wide flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gov-saffron" /> Comprehensive Statutory Anomaly Framework
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Q1: WHAT Happened */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-gov-navy-900 uppercase text-[11px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-gov-navy-800 text-white flex items-center justify-center text-[10px]">1</span>
                      WHAT HAPPENED?
                    </p>
                    <p className="text-slate-700 leading-relaxed pl-6.5">
                      {alert.title}: {alert.description || 'Discrepancy detected between financial disbursement rate and on-site certified engineering milestones.'}
                    </p>
                  </div>

                  {/* Q2: WHY Was It Flagged */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-gov-navy-900 uppercase text-[11px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-gov-navy-800 text-white flex items-center justify-center text-[10px]">2</span>
                      WHY WAS IT FLAGGED?
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700 pl-6.5">
                      {alert.reasons && alert.reasons.length > 0 ? (
                        alert.reasons.map((r, idx) => <li key={idx}>{r}</li>)
                      ) : (
                        <li>Isolation Forest model flagged multivariate deviation in expenditure-to-progress ratio.</li>
                      )}
                    </ul>
                  </div>

                  {/* Q3: HOW Severe Is It */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-gov-navy-900 uppercase text-[11px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-gov-navy-800 text-white flex items-center justify-center text-[10px]">3</span>
                      HOW SEVERE IS IT?
                    </p>
                    <p className="text-slate-700 leading-relaxed pl-6.5">
                      Categorized as <strong className="uppercase text-red-700">{alert.severity} PRIORITY</strong> with a calibrated ML Risk Score of <strong>{alert.riskScore || 50}/100</strong>.
                    </p>
                  </div>

                  {/* Q4: WHAT Data Supports The Flag */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-gov-navy-900 uppercase text-[11px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-gov-navy-800 text-white flex items-center justify-center text-[10px]">4</span>
                      WHAT DATA SUPPORTS THE FLAG?
                    </p>
                    <p className="text-slate-700 leading-relaxed pl-6.5">
                      PFMS disbursement ledger reflects ₹{Number(alert.sanctionedAmount || 0).toFixed(2)} Lakhs sanctioned, with recorded physical execution at {alert.physicalProgress || 0}% vs financial expenditure at {Number(alert.financialProgress || 0).toFixed(1)}%.
                    </p>
                  </div>

                  {/* Q5: WHO Needs To Review It */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-gov-navy-900 uppercase text-[11px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-gov-navy-800 text-white flex items-center justify-center text-[10px]">5</span>
                      WHO NEEDS TO REVIEW IT?
                    </p>
                    <p className="text-slate-700 leading-relaxed pl-6.5">
                      Assigned to <strong className="text-indigo-900">{alert.assignedTo || `${alert.districtName} Planning Authority`}</strong> for on-site verification and technical engineering audit.
                    </p>
                  </div>

                  {/* Q6: WHAT Is The Investigation Status */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <p className="font-bold text-gov-navy-900 uppercase text-[11px] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded bg-gov-navy-800 text-white flex items-center justify-center text-[10px]">6</span>
                      WHAT IS THE CURRENT INVESTIGATION STATUS?
                    </p>
                    <p className="text-slate-700 leading-relaxed pl-6.5">
                      Active status: <strong className="uppercase text-gov-navy-900 font-bold">{alert.status}</strong>.
                      {alert.resolvedAt && ` (Resolved on ${new Date(alert.resolvedAt).toLocaleDateString()} by ${alert.resolvedBy})`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Duplicate Work Screening Summary */}
              {duplicateCheck && duplicateCheck.possibleDuplicate && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Potential Duplicate Work Signature Detected
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    AI text vectorizer detected a <strong>{duplicateCheck.similarityScore}% similarity</strong> with project <span className="font-mono font-bold text-red-950">#{duplicateCheck.matchingProjectId}</span>.
                  </p>
                  <ul className="list-disc list-inside text-xs text-red-800">
                    {duplicateCheck.reasons?.map((r: string, idx: number) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Column: Workflow Control & Investigation Notes Log */}
            <div className="space-y-6">
              {/* Status Control Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-gov-navy-900 uppercase tracking-wide flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-gov-saffron" /> Investigation Lifecycle
                </h4>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Current Case Stage</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-black text-gov-navy-900 uppercase">{alert.status}</span>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gov-navy-100 text-gov-navy-800">
                      Score: {alert.riskScore || 50}/100
                    </span>
                  </div>
                </div>

                {/* Status Transition Buttons */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-700">Transition Status:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusChange('UNDER_REVIEW')}
                      disabled={isUpdatingStatus || alert.status === 'UNDER_REVIEW'}
                      className="px-3 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition disabled:opacity-40"
                    >
                      Under Review
                    </button>
                    <button
                      onClick={() => handleStatusChange('INVESTIGATING')}
                      disabled={isUpdatingStatus || alert.status === 'INVESTIGATING'}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-900 rounded-lg text-xs font-bold transition disabled:opacity-40"
                    >
                      Investigating
                    </button>
                    <button
                      onClick={() => handleStatusChange('RESOLVED')}
                      disabled={isUpdatingStatus || alert.status === 'RESOLVED'}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold transition disabled:opacity-40"
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleStatusChange('DISMISSED')}
                      disabled={isUpdatingStatus || alert.status === 'DISMISSED'}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition disabled:opacity-40"
                    >
                      Dismiss Flag
                    </button>
                  </div>
                </div>

                {/* Assign Investigator Form */}
                <form onSubmit={handleAssignSubmit} className="pt-3 border-t border-slate-100 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700 block">
                    Assign Investigating Authority:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={assigneeName}
                      onChange={(e) => setAssigneeName(e.target.value)}
                      placeholder="e.g. District Planning Officer"
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-600 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      Assign
                    </button>
                  </div>
                </form>
              </div>

              {/* Investigation Notes & Audit Log */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-gov-navy-900 uppercase tracking-wide flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gov-saffron" /> Official Notes & Findings
                </h4>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter official investigation observation, site report findings, or engineering verification note..."
                    rows={3}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-600 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !noteText.trim()}
                      className="inline-flex items-center px-4 py-1.5 bg-gov-navy-800 hover:bg-gov-navy-900 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs transition"
                    >
                      <Send className="w-3 h-3 mr-1.5" />
                      Record Note
                    </button>
                  </div>
                </form>

                {/* Notes Timeline */}
                <div className="space-y-3 pt-3 border-t border-slate-100 max-h-80 overflow-y-auto pr-1">
                  {alert.investigation?.notes && alert.investigation.notes.length > 0 ? (
                    alert.investigation.notes.map((n) => (
                      <div key={n.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-bold text-gov-navy-900">{n.authorName}</span>
                          <span suppressHydrationWarning className="font-mono text-[10px]">
                            {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : 'Recent'}
                          </span>
                        </div>
                        <p className="text-slate-700 leading-relaxed">{n.noteText}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No investigation notes recorded yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
