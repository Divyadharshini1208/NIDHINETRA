'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { adminImportService } from '@/services/adminImportService';
import { DataImportResult, DataImportRecord } from '@/types';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  RotateCcw,
  Database,
  ArrowRight,
  ShieldAlert,
  Download,
  Clock,
  UserCheck,
  Check,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

const SAMPLE_CSV = `ProjectCode,ProjectName,StateCode,DistrictCode,Category,SanctionedAmountLakhs,ImplementingAgency
MPLAD-IMP-901,Construction of 4-lane Rural Approach Road,MH,MH-PUN,Roads & Bridges,85.50,State PWD Division
MPLAD-IMP-902,Installation of 25 Solar Street Light Units,MH,MH-PUN,Energy & Lighting,22.00,Zilla Parishad Pune
MPLAD-IMP-903,Upgradation of Primary Health Sub-Centre,MH,MH-PUN,Healthcare & Sanitation,45.00,District Health Society
MPLAD-IMP-904,RO Safe Drinking Water Plant with 5000L Capacity,MH,MH-PUN,Drinking Water,18.75,Rural Water Supply Dept
MPLAD-IMP-905,Smart Classroom Digital Labs in 5 High Schools,MH,MH-PUN,Education & Schools,35.00,School Education Board`;

export default function AdminDataImportPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success, error: toastError, info } = useToast();

  // Wizard state: 1 = UPLOAD, 2 = VALIDATE, 3 = PREVIEW, 4 = CONFIRM, 5 = IMPORTED
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('sample_mplads_projects.csv');
  const [csvContent, setCsvContent] = useState<string>(SAMPLE_CSV);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<DataImportResult | null>(null);
  const [confirmedAuthorized, setConfirmedAuthorized] = useState<boolean>(false);
  const [history, setHistory] = useState<DataImportRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await adminImportService.getHistory();
      setHistory(data || []);
    } catch (err: any) {
      console.warn('Could not load import history:', err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      info('File Loaded', `${file.name} ready for structure validation.`);
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!csvContent.trim()) {
      toastError('Validation Error', 'Please select or enter CSV data before validation.');
      return;
    }

    setIsValidating(true);
    setCurrentStep(2);
    try {
      const result = await adminImportService.validateRawCsv(fileName, csvContent);
      setImportResult(result);
      setCurrentStep(3); // Advance to PREVIEW
      if (result.canProceed) {
        success('Validation Successful', `${result.validRecords} of ${result.totalRecords} records verified.`);
      } else {
        toastError('Validation Issues Detected', `${result.invalidRecords + result.duplicateRecords} issues must be resolved.`);
      }
    } catch (err: any) {
      toastError('Validation Failed', err.message || 'Error occurred while analyzing import payload.');
      setCurrentStep(1);
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importResult || !importResult.previewRows || importResult.previewRows.length === 0) {
      toastError('Import Error', 'No validated records to import.');
      return;
    }

    if (!confirmedAuthorized) {
      toastError('Authorization Required', 'Please confirm the administrative authorization sign-off checkbox.');
      return;
    }

    setIsImporting(true);
    try {
      const validRowsToSubmit = importResult.previewRows
        .filter((r) => r.isValid)
        .map((r) => ({
          projectId: r.projectId,
          projectName: r.projectName,
          description: `Bulk imported via ${fileName} (Batch: ${importResult.batchId})`,
          stateId: r.stateId || 1,
          districtId: r.districtId || 1,
          categoryName: r.category || 'General Infrastructure',
          sanctionedAmount: Number(r.sanctionedAmount) || 0,
          releasedAmount: Number(r.sanctionedAmount) * 0.75, // standard initial release
          expenditureAmount: 0,
          implementingAgency: r.implementingAgency || 'Public Works Dept',
          physicalProgress: 0,
          financialProgress: 0,
          status: 'ONGOING',
          riskLevel: 'LOW',
          latitude: 18.5204 + (Math.random() - 0.5) * 0.1,
          longitude: 73.8567 + (Math.random() - 0.5) * 0.1,
        }));

      const finalResult = await adminImportService.confirmImport(importResult.batchId, validRowsToSubmit);
      setImportResult(finalResult);
      setCurrentStep(5); // IMPORTED
      success('Import Completed', `${finalResult.validRecords} projects successfully committed to database.`);
      loadHistory();
    } catch (err: any) {
      toastError('Import Failed', err.message || 'Database commit failed during project creation.');
    } finally {
      setIsImporting(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setImportResult(null);
    setConfirmedAuthorized(false);
    setCsvContent(SAMPLE_CSV);
    setFileName('sample_mplads_projects.csv');
  };

  const downloadSampleTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mplads_project_import_template.csv';
    link.click();
  };

  if (!authLoading && (!isAuthenticated || user?.role !== 'ROLE_MINISTRY_ADMIN')) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <ShieldAlert className="w-16 h-16 text-amber-600 mb-4 animate-bounce" />
          <h2 className="text-2xl font-black text-gov-navy-900">Restricted Administrative Facility</h2>
          <p className="text-slate-600 max-w-md mt-2 text-sm">
            Bulk Project Master Data Import is exclusively provisioned for <strong>Ministry Administrators (MoSPI)</strong>.
          </p>
          <Link
            href="/login"
            className="mt-6 px-6 py-2.5 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded-lg text-sm font-bold shadow-md transition"
          >
            Authenticate with Ministry Credentials
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="NIDHINETRA — Bulk Data Ingestion Engine" scopeBadge="Central MoSPI Master Data Facility" />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#0A2540] via-[#0E3558] to-[#144773] text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
              <Database className="w-64 h-64 text-white" />
            </div>

            <div className="relative z-10 max-w-3xl">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-gov-saffron text-white rounded-full inline-flex items-center gap-1.5 shadow-xs mb-3">
                <FileSpreadsheet className="w-3.5 h-3.5" /> High-Throughput Relational Ingestion
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                NIDHINETRA Data Import & Validation Pipeline
              </h1>
              <p className="text-sm text-slate-200 mt-2 leading-relaxed">
                Ingest sanctioned MPLADS works directly into PostgreSQL with multi-layer schema verification, duplicate detection, and automated foreign-key resolution.
              </p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between relative max-w-4xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gov-navy-800 transition-all duration-300 z-0"
                style={{
                  width:
                    currentStep === 1
                      ? '0%'
                      : currentStep === 2
                      ? '25%'
                      : currentStep === 3
                      ? '50%'
                      : currentStep === 4
                      ? '75%'
                      : '100%',
                }}
              />

              {[
                { step: 1, label: 'Upload Data', icon: UploadCloud },
                { step: 2, label: 'Schema Validation', icon: RefreshCw },
                { step: 3, label: 'Integrity Preview', icon: FileSpreadsheet },
                { step: 4, label: 'Admin Sign-Off', icon: UserCheck },
                { step: 5, label: 'Committed to DB', icon: Database },
              ].map((item) => {
                const isCompleted = currentStep > item.step || currentStep === 5;
                const isCurrent = currentStep === item.step;
                const Icon = item.icon;

                return (
                  <div key={item.step} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                        isCompleted
                          ? 'bg-gov-green text-white ring-4 ring-emerald-50'
                          : isCurrent
                          ? 'bg-gov-navy-800 text-white ring-4 ring-gov-navy-100 animate-pulse'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-xs mt-2 font-bold tracking-tight text-center hidden sm:block ${
                        isCurrent
                          ? 'text-gov-navy-900 font-black'
                          : isCompleted
                          ? 'text-gov-green'
                          : 'text-slate-400'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 1 & 2: Upload and Validate */}
          {currentStep <= 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Dropzone & CSV Editor */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-base font-bold text-gov-navy-900">1. Select or Paste Master Dataset</h3>
                      <p className="text-xs text-slate-500">Supports standard CSV or Excel exports formatted according to MoSPI schema</p>
                    </div>
                    <button
                      onClick={downloadSampleTemplate}
                      className="inline-flex items-center text-xs font-bold text-gov-navy-800 hover:text-gov-navy-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5 text-gov-saffron" />
                      Download Schema CSV
                    </button>
                  </div>

                  {/* Dropzone */}
                  <div className="mt-6 border-2 border-dashed border-slate-300 hover:border-gov-navy-800 rounded-xl p-8 text-center transition bg-slate-50/50">
                    <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gov-navy-900">Drag and drop your CSV dataset here</p>
                    <p className="text-xs text-slate-500 mt-1">or click below to browse your local file system</p>
                    <label className="mt-4 inline-flex items-center px-4 py-2 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition">
                      <FileSpreadsheet className="w-4 h-4 mr-2 text-gov-saffron" />
                      Choose Local CSV File
                      <input
                        type="file"
                        accept=".csv,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-2">Active file: <span className="font-mono text-slate-700 font-semibold">{fileName}</span></p>
                  </div>

                  {/* Textarea Preview / Edit */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Raw CSV Content Inspector
                      </label>
                      <button
                        onClick={() => {
                          setCsvContent(SAMPLE_CSV);
                          setFileName('sample_mplads_projects.csv');
                          info('Sample Loaded', 'Preset verified dataset inserted.');
                        }}
                        className="text-xs text-gov-navy-800 font-bold hover:underline"
                      >
                        Reset to Sample Dataset
                      </button>
                    </div>
                    <textarea
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      rows={8}
                      className="w-full font-mono text-xs p-3 bg-slate-900 text-emerald-400 rounded-lg border border-slate-700 focus:ring-2 focus:ring-gov-navy-600 focus:outline-none"
                    />
                  </div>

                  {/* Validation Action */}
                  <div className="mt-6 flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={handleValidate}
                      disabled={isValidating || !csvContent.trim()}
                      className="inline-flex items-center px-6 py-2.5 bg-gov-navy-800 hover:bg-gov-navy-900 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-md transition"
                    >
                      {isValidating ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gov-saffron" />
                          Validating Schema & Constraints...
                        </>
                      ) : (
                        <>
                          Validate Schema Integrity
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Col: Specification & Guidelines */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                  <h4 className="text-sm font-black text-gov-navy-900 uppercase tracking-wide flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-gov-saffron" /> Schema Requirements
                  </h4>
                  <ul className="mt-4 space-y-3 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gov-green shrink-0 mt-0.5" />
                      <span><strong>ProjectCode:</strong> Unique alphanumeric identifier (e.g., MPLAD-MH-101).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gov-green shrink-0 mt-0.5" />
                      <span><strong>ProjectName:</strong> Official title of the sanctioned civil work.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gov-green shrink-0 mt-0.5" />
                      <span><strong>StateCode:</strong> Valid 2-letter state ISO code (e.g., MH, KA, DL).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gov-green shrink-0 mt-0.5" />
                      <span><strong>DistrictCode:</strong> Valid district code mapping to assigned state.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gov-green shrink-0 mt-0.5" />
                      <span><strong>SanctionedAmountLakhs:</strong> Non-negative monetary figure in Lakhs (INR).</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                    <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Non-Destructive Ingestion
                    </p>
                    <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                      This validation step executes in-memory checks against current database records without modifying tables until final administrator authorization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 & 4: Preview & Confirm Sign-Off */}
          {(currentStep === 3 || currentStep === 4) && importResult && (
            <div className="space-y-6">
              {/* Summary Metric Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Total Records</p>
                  <p className="text-2xl font-black text-gov-navy-900 mt-1 font-mono">{importResult.totalRecords}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-emerald-200 bg-emerald-50/40 shadow-xs">
                  <p className="text-xs font-semibold text-emerald-800 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-gov-green" /> Valid & Clean
                  </p>
                  <p className="text-2xl font-black text-gov-green mt-1 font-mono">{importResult.validRecords}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-red-200 bg-red-50/40 shadow-xs">
                  <p className="text-xs font-semibold text-red-800 uppercase flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-red-500" /> Invalid Rows
                  </p>
                  <p className="text-2xl font-black text-red-600 mt-1 font-mono">{importResult.invalidRecords}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-amber-200 bg-amber-50/40 shadow-xs">
                  <p className="text-xs font-semibold text-amber-800 uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Duplicates
                  </p>
                  <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{importResult.duplicateRecords}</p>
                </div>
              </div>

              {/* Validation Errors List (if any) */}
              {importResult.validationErrors && importResult.validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-900 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Validation Issues Found ({importResult.validationErrors.length})
                  </div>
                  <ul className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                    {importResult.validationErrors.map((err, idx) => (
                      <li key={idx} className="text-xs text-red-800 font-mono flex items-start gap-2">
                        <span className="text-red-500 font-bold">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gov-navy-900">Parsed Records Preview (First 50 Rows)</h3>
                    <p className="text-xs text-slate-500">Inspecting Batch ID: <span className="font-mono font-bold text-gov-navy-800">{importResult.batchId}</span></p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      importResult.canProceed
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}
                  >
                    {importResult.canProceed ? 'Ready for Database Commit' : 'Execution Blocked by Schema Errors'}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                        <th className="p-3">#</th>
                        <th className="p-3">Project Code</th>
                        <th className="p-3">Project Name</th>
                        <th className="p-3">Jurisdiction</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Sanctioned (₹ Lakhs)</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {importResult.previewRows.map((row, idx) => (
                        <tr key={idx} className={row.isValid ? 'hover:bg-slate-50' : 'bg-red-50/50 hover:bg-red-50'}>
                          <td className="p-3 text-slate-400 font-mono">{row.rowNumber || idx + 1}</td>
                          <td className="p-3 font-mono font-bold text-gov-navy-900">{row.projectId}</td>
                          <td className="p-3 font-semibold text-slate-800">{row.projectName}</td>
                          <td className="p-3 text-slate-600 font-mono">{row.stateCode} / {row.districtCode}</td>
                          <td className="p-3 text-slate-600">{row.category}</td>
                          <td className="p-3 text-right font-mono font-bold text-gov-navy-900">
                            ₹{Number(row.sanctionedAmount).toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            {row.isValid ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> VALID
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300"
                                title={row.error}
                              >
                                <XCircle className="w-3 h-3 mr-1" /> INVALID
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Step 4: Admin Authorization Checkbox & Actions */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-gov-navy-900 uppercase tracking-wide">
                  Step 4: Statutory Confirmation & Execution Authorization
                </h4>

                <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={confirmedAuthorized}
                    onChange={(e) => setConfirmedAuthorized(e.target.checked)}
                    className="mt-1 w-4 h-4 text-gov-navy-800 rounded focus:ring-gov-navy-600"
                  />
                  <div className="text-xs text-slate-700">
                    <p className="font-bold text-gov-navy-900">
                      I hereby verify and authorize the bulk ingestion of {importResult.validRecords} projects into the live MPLADS PostgreSQL database.
                    </p>
                    <p className="text-slate-500 mt-0.5">
                      This action will generate permanent project identifiers, initialize financial monitoring ledgers, and log an audit trail entry under <span className="font-semibold text-slate-800">{user?.fullName} (Ministry Administrator)</span>.
                    </p>
                  </div>
                </label>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <button
                    onClick={resetWizard}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Cancel & Upload New Dataset
                  </button>

                  <button
                    onClick={handleConfirmImport}
                    disabled={isImporting || !confirmedAuthorized || !importResult.canProceed}
                    className="inline-flex items-center px-6 py-2.5 bg-gov-navy-800 hover:bg-gov-navy-900 disabled:opacity-50 text-white rounded-lg text-sm font-bold shadow-md transition"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin text-gov-saffron" />
                        Committing to PostgreSQL...
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4 mr-2 text-gov-saffron" />
                        Execute Batch Import ({importResult.validRecords} Records)
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Success State */}
          {currentStep === 5 && importResult && (
            <div className="bg-white rounded-xl border border-emerald-200 p-8 text-center shadow-xs space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-gov-green rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <h2 className="text-2xl font-black text-gov-navy-900">Bulk Ingestion Successfully Executed</h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto">
                <strong>{importResult.validRecords}</strong> projects have been permanently registered and are now actively monitored across all role dashboards.
              </p>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg max-w-md mx-auto text-left text-xs space-y-1 font-mono">
                <p><span className="text-slate-500">Batch Code:</span> <span className="font-bold text-gov-navy-900">{importResult.batchId}</span></p>
                <p><span className="text-slate-500">Source File:</span> <span className="font-bold text-slate-800">{importResult.fileName}</span></p>
                <p><span className="text-slate-500">Committed By:</span> <span className="font-bold text-slate-800">{user?.fullName}</span></p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  onClick={resetWizard}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                >
                  Import Another Dataset
                </button>
                <Link
                  href="/projects"
                  className="px-6 py-2.5 bg-gov-navy-800 hover:bg-gov-navy-900 text-white rounded-lg text-xs font-bold shadow-md transition inline-flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2 text-gov-saffron" />
                  View Projects Registry
                </Link>
              </div>
            </div>
          )}

          {/* Import History Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gov-navy-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gov-saffron" /> Statutory Import Audit Log
                </h3>
                <p className="text-xs text-slate-500">Historical records of verified data migrations and administrative uploads</p>
              </div>
              <button
                onClick={loadHistory}
                disabled={loadingHistory}
                className="p-1.5 text-slate-500 hover:text-gov-navy-800 hover:bg-slate-200 rounded transition"
                title="Refresh History"
              >
                <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <th className="p-3">Import ID</th>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Uploaded By</th>
                    <th className="p-3 text-center">Total</th>
                    <th className="p-3 text-center">Imported</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        Loading import history...
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        No previous bulk imports found in the system log.
                      </td>
                    </tr>
                  ) : (
                    history.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-gov-navy-900">#IMP-{rec.id}</td>
                        <td className="p-3 font-semibold text-slate-800">{rec.fileName}</td>
                        <td className="p-3 text-slate-600">{rec.uploadedBy || 'MoSPI System'}</td>
                        <td className="p-3 text-center font-mono">{rec.totalRecords || 0}</td>
                        <td className="p-3 text-center font-mono font-bold text-gov-green">{rec.validRecords || 0}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td suppressHydrationWarning className="p-3 text-slate-500 font-mono text-[11px]">
                          {rec.createdAt ? new Date(rec.createdAt).toLocaleString('en-IN') : 'Recent'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
