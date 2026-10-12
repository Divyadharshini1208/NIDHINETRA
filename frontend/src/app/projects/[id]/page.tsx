'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { LoadingState, ErrorState } from '@/components/ui/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { projectService } from '@/services/projectService';
import { aiMonitoringService } from '@/services/aiMonitoringService';
import {
  Project,
  ProjectFinancials,
  ProjectProgressLog,
  Document,
  RiskAlert,
  AiAnalysisPreview
} from '@/types';
import {
  Building2,
  IndianRupee,
  Calendar,
  MapPin,
  UserCheck,
  CheckCircle2,
  Clock,
  FileText,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  History,
  ArrowLeft,
  Download,
  AlertTriangle,
  Plus,
  ExternalLink,
  RefreshCw,
  Layers
} from 'lucide-react';

type TabKey = 'OVERVIEW' | 'FINANCIALS' | 'PAYMENTS' | 'PROGRESS' | 'DOCUMENTS' | 'AI_ANALYSIS' | 'AUDIT';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProjectProgressLog[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisPreview | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [duplicateResult, setDuplicateResult] = useState<any | null>(null);

  const handleRunAiAnalysis = async () => {
    if (!project) return;
    setIsAnalyzing(true);
    try {
      const [aiRes, dupRes] = await Promise.all([
        aiMonitoringService.analyzeProject(project.id),
        aiMonitoringService.detectDuplicates(project.id).catch(() => null)
      ]);
      setAiAnalysis(aiRes);
      setDuplicateResult(dupRes);
      success('AI Analysis Completed', `Updated risk score: ${aiRes.anomalyRiskScore}/100 (${aiRes.riskClassification})`);
      const updatedProj = await projectService.getProjectById(projectId);
      setProject(updatedProj);
    } catch (err: any) {
      toastError('AI Analysis Failed', err.message || 'Could not run inference engine');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadAllProjectData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const [proj, fin, prog, docs, alrts, ai] = await Promise.all([
        projectService.getProjectById(projectId),
        projectService.getProjectFinancials(projectId).catch(() => null),
        projectService.getProjectProgress(projectId).catch(() => []),
        projectService.getProjectDocuments(projectId).catch(() => []),
        projectService.getProjectAlerts(projectId).catch(() => []),
        projectService.getAiAnalysis(projectId).catch(() => null),
      ]);

      setProject(proj);
      setFinancials(fin);
      setProgressLogs(prog || []);
      setDocuments(docs || []);
      setAlerts(alrts || []);
      setAiAnalysis(ai);
    } catch (err: any) {
      toastError('Project Load Failed', err.message || 'Could not load project details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllProjectData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar title="Project Details" />
          <div className="flex-1 flex items-center justify-center p-12">
            <LoadingState message="Fetching master project record and telemetry..." />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-slate-100 font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar title="Project Not Found" />
          <div className="flex-1 flex items-center justify-center p-12">
            <ErrorState
              title="Project Record Not Found"
              message="The requested project record does not exist or your role does not have authorization to view it."
              onRetry={() => router.push('/projects')}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={`Project Dossier: ${project.projectId}`}
          scopeBadge={`${project.districtName || 'District'}, ${project.stateName || 'State'}`}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <Link
              href="/projects"
              className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-gov-navy-900 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Projects Registry
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/map">
                <Button variant="outline" size="sm" leftIcon={<MapPin className="w-3.5 h-3.5" />}>
                  Locate on GIS Map
                </Button>
              </Link>
            </div>
          </div>

          {/* Project Header Banner Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 border-l-4 border-l-gov-navy-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-gov-navy-900 text-white px-2.5 py-0.5 rounded">
                    {project.projectId}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                    {project.categoryName || 'Infrastructure'}
                  </span>
                  <StatusBadge status={project.status} />
                  <RiskBadge riskLevel={project.riskLevel} />
                </div>

                <h1 className="text-lg sm:text-xl font-black text-gov-navy-900 tracking-tight">
                  {project.projectName}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {project.districtName}, {project.stateName} {project.constituencyName && `(${project.constituencyName} PC)`}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    MP: {project.mpName || 'Hon. MP'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Agency: {project.implementingAgency || 'Designated Dept'}
                  </span>
                </div>
              </div>

              {/* Quick Metrics Header Pill */}
              <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sanctioned</span>
                  <span className="text-sm font-black text-slate-900">₹{project.sanctionedAmount}L</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Disbursed</span>
                  <span className="text-sm font-black text-emerald-700">₹{project.expenditureAmount}L</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Progress</span>
                  <span className="text-sm font-black text-gov-navy-900">{project.physicalProgress}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 7 TABS BAR */}
          <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar space-x-1">
            {[
              { key: 'OVERVIEW', label: '1. Overview', icon: FileText },
              { key: 'FINANCIALS', label: '2. Financials & Sanctions', icon: IndianRupee },
              { key: 'PAYMENTS', label: '3. Payments & PFMS', icon: CreditCard },
              { key: 'PROGRESS', label: '4. Physical Progress', icon: TrendingUp },
              { key: 'DOCUMENTS', label: '5. Documents & UCs', icon: FileText },
              { key: 'AI_ANALYSIS', label: '6. AI Risk Analysis', icon: Sparkles },
              { key: 'AUDIT', label: '7. Audit History', icon: History },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TabKey)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap border-b-2 transition ${isActive
                      ? 'border-gov-navy-900 text-gov-navy-900 bg-white shadow-xs rounded-t-md'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gov-navy-900' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Project Scope & Description */}
                <div className="lg:col-span-2 space-y-6">
                  <Card title="Project Scope & Technical Description" headerIcon={<FileText className="w-5 h-5" />}>
                    <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                      <p>{project.description || 'No detailed project narrative provided in the baseline sanction order.'}</p>
                      {project.riskReason && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 space-y-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Risk / Variance Assessment Note:
                          </span>
                          <p>{project.riskReason}</p>
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card title="Key Milestone Timeline" headerIcon={<Calendar className="w-5 h-5" />}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <span className="text-slate-400 font-medium block">Commencement Date</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                          {project.startDate || 'Not recorded'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <span className="text-slate-400 font-medium block">Expected Completion</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                          {project.expectedCompletionDate || 'Not recorded'}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
                        <span className="text-slate-400 font-medium block">Actual Completion</span>
                        <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                          {project.actualCompletionDate || (project.status === 'COMPLETED' ? 'Completed' : 'In Progress')}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Administrative Jurisdiction Summary */}
                <div className="lg:col-span-1 space-y-6">
                  <Card title="Administrative Jurisdiction" headerIcon={<Building2 className="w-5 h-5" />}>
                    <div className="space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">State / UT:</span>
                        <span className="font-bold text-slate-900">{project.stateName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">District Collectorate:</span>
                        <span className="font-bold text-slate-900">{project.districtName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Parliamentary Constituency:</span>
                        <span className="font-bold text-slate-900">{project.constituencyName || 'Lok Sabha Constituency'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Member of Parliament:</span>
                        <span className="font-bold text-slate-900">{project.mpName || 'Hon. MP'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Executing Agency:</span>
                        <span className="font-bold text-slate-900">{project.implementingAgency || 'Public Works Dept'}</span>
                      </div>
                      {project.latitude && project.longitude && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-slate-400 block font-medium">GIS Coordinates:</span>
                          <span className="font-mono text-gov-navy-900 font-semibold">
                            {project.latitude.toFixed(4)}° N, {project.longitude.toFixed(4)}° E
                          </span>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIALS */}
          {activeTab === 'FINANCIALS' && financials && (
            <div className="space-y-6">
              {/* Financial Summary KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Sanctioned Amount</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">₹{financials.sanctionedAmount} Lakhs</span>
                  <span className="text-[10px] text-slate-400">Total administrative sanction</span>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Released Amount</span>
                  <span className="text-xl font-black text-gov-navy-800 mt-1 block">₹{financials.releasedAmount} Lakhs</span>
                  <span className="text-[10px] text-slate-400">Installments released</span>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Total Expenditure</span>
                  <span className="text-xl font-black text-emerald-700 mt-1 block">₹{financials.expenditureAmount} Lakhs</span>
                  <span className="text-[10px] text-slate-400">PFMS verified vouchers</span>
                </div>

                <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
                  <span className="text-xs text-slate-500 font-medium block">Utilization Rate</span>
                  <span className="text-xl font-black text-gov-green mt-1 block">{financials.utilizationPercent}%</span>
                  <span className="text-[10px] text-slate-400">Disbursed / Released</span>
                </div>
              </div>

              {/* Sanctions & Fund Releases Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Sanction Orders" headerIcon={<IndianRupee className="w-5 h-5 text-gov-navy-800" />}>
                  <Table
                    columns={[
                      { key: 'no', header: 'Order No', render: (s: any) => <span className="font-mono font-bold text-xs">{s.sanctionOrderNumber}</span> },
                      { key: 'date', header: 'Date', render: (s: any) => <span className="text-xs">{s.sanctionDate}</span> },
                      { key: 'amount', header: 'Amount', render: (s: any) => <span className="font-bold text-xs">₹{s.sanctionedAmount}L</span> },
                      { key: 'auth', header: 'Authority', render: (s: any) => <span className="text-xs text-slate-500 truncate max-w-xs">{s.sanctioningAuthority}</span> },
                    ]}
                    data={financials.sanctions || []}
                    keyExtractor={(s: any) => s.id}
                  />
                </Card>

                <Card title="Installment Fund Releases" headerIcon={<TrendingUp className="w-5 h-5 text-gov-green" />}>
                  <Table
                    columns={[
                      { key: 'inst', header: 'Installment', render: (f: any) => <span className="font-bold text-xs">Inst #{f.installmentNumber}</span> },
                      { key: 'order', header: 'Release Order', render: (f: any) => <span className="font-mono text-xs">{f.releaseOrderNumber}</span> },
                      { key: 'date', header: 'Date', render: (f: any) => <span className="text-xs">{f.releaseDate}</span> },
                      { key: 'amount', header: 'Amount', render: (f: any) => <span className="font-bold text-emerald-700 text-xs">₹{f.releasedAmount}L</span> },
                    ]}
                    data={financials.fundReleases || []}
                    keyExtractor={(f: any) => f.id}
                  />
                </Card>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'PAYMENTS' && financials && (
            <Card
              title="PFMS & Treasury Payment Transactions"
              subtitle="Electronic payment vouchers and clearing records against approved component items"
              headerIcon={<CreditCard className="w-5 h-5 text-gov-navy-800" />}
              borderAccent
            >
              <Table
                columns={[
                  { key: 'ref', header: 'Transaction Reference', render: (p: any) => <span className="font-mono font-bold text-xs">{p.paymentReference}</span> },
                  { key: 'date', header: 'Payment Date', render: (p: any) => <span className="text-xs">{p.paymentDate}</span> },
                  { key: 'payee', header: 'Payee / Contractor', render: (p: any) => <span className="font-bold text-xs text-slate-800">{p.payeeName}</span> },
                  { key: 'mode', header: 'Payment Mode', render: (p: any) => <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">{p.paymentMode}</span> },
                  { key: 'amount', header: 'Amount', render: (p: any) => <span className="font-black text-xs text-emerald-700">₹{p.amount} Lakhs</span> },
                  {
                    key: 'status', header: 'Status', render: (p: any) => (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {p.paymentStatus}
                      </span>
                    )
                  },
                ]}
                data={financials.payments || []}
                keyExtractor={(p: any) => p.id}
              />
            </Card>
          )}

          {/* TAB 4: PROGRESS */}
          {activeTab === 'PROGRESS' && (
            <div className="space-y-6">
              <Card
                title="Site Inspection & Physical Progress History"
                subtitle="Official inspection notes and certified milestone progress log"
                headerIcon={<TrendingUp className="w-5 h-5 text-gov-navy-800" />}
                borderAccent
              >
                <Table
                  columns={[
                    { key: 'date', header: 'Inspection Date', render: (p: any) => <span className="font-semibold text-xs">{p.reportingDate}</span> },
                    {
                      key: 'phys', header: 'Physical Progress', render: (p: any) => (
                        <div className="w-24">
                          <span className="font-bold text-xs">{p.physicalProgressPercent}%</span>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-0.5">
                            <div className="bg-gov-navy-800 h-full rounded-full" style={{ width: `${p.physicalProgressPercent}%` }} />
                          </div>
                        </div>
                      )
                    },
                    { key: 'stage', header: 'Stage Description', render: (p: any) => <span className="text-xs text-slate-700">{p.stageDescription || '-'}</span> },
                    { key: 'officer', header: 'Reporting Officer', render: (p: any) => <span className="text-xs text-slate-500">{p.reportedBy}</span> },
                    {
                      key: 'delay', header: 'Delay Assessment', render: (p: any) => (
                        p.delayDays > 0 ? (
                          <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold">
                            +{p.delayDays} days delay
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                            On Schedule
                          </span>
                        )
                      )
                    },
                  ]}
                  data={progressLogs}
                  keyExtractor={(p: any) => p.id}
                />
              </Card>
            </div>
          )}

          {/* TAB 5: DOCUMENTS */}
          {activeTab === 'DOCUMENTS' && (
            <Card
              title="Official Documents, Sanction Orders & Utilization Certificates"
              subtitle="Secure document repository for GFR 12-A certificates, site photos, and technical sanctions"
              headerIcon={<FileText className="w-5 h-5 text-gov-navy-800" />}
              borderAccent
            >
              <Table
                columns={[
                  { key: 'type', header: 'Document Type', render: (d: any) => <span className="font-bold text-xs">{d.documentType.replace('_', ' ')}</span> },
                  { key: 'name', header: 'File Name', render: (d: any) => <span className="font-mono text-xs text-slate-700">{d.fileName}</span> },
                  { key: 'size', header: 'Size', render: (d: any) => <span className="text-xs text-slate-500">{(d.fileSize / 1024 / 1024).toFixed(2)} MB</span> },
                  { key: 'uploader', header: 'Uploaded By', render: (d: any) => <span className="text-xs text-slate-500">{d.uploadedBy}</span> },
                  {
                    key: 'action', header: 'Action', render: (d: any) => (
                      <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                        Download
                      </Button>
                    )
                  },
                ]}
                data={documents}
                keyExtractor={(d: any) => d.id}
              />
            </Card>
          )}

          {/* TAB 6: AI ANALYSIS */}
          {activeTab === 'AI_ANALYSIS' && aiAnalysis && (
            <div className="space-y-6">
              {/* Top Banner with Run Analysis Again Button */}
              <div className="p-6 bg-gradient-to-r from-gov-navy-900 to-indigo-950 text-white rounded-xl shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                      <Sparkles className="w-4 h-4" />
                      Explainable AI Monitoring & Telemetry
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Risk Classification: {aiAnalysis.riskClassification}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      Multivariate anomaly assessment derived from PFMS disbursement velocity, civil Schedule of Rates, and physical milestone progress.
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="bg-white/10 px-3.5 py-2 rounded-lg text-center border border-white/20">
                      <p className="text-[10px] uppercase font-bold text-slate-300">Composite Risk</p>
                      <p className="text-2xl font-black text-amber-400 font-mono">
                        {aiAnalysis.anomalyRiskScore}<span className="text-xs text-white">/100</span>
                      </p>
                    </div>

                    <button
                      onClick={handleRunAiAnalysis}
                      disabled={isAnalyzing}
                      className="inline-flex items-center px-4 py-2.5 bg-gov-saffron hover:bg-orange-600 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-md transition"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                      Run Analysis Again
                    </button>
                  </div>
                </div>
              </div>

              {/* Statutory Protocol Banner */}
              <div className="bg-amber-50 border-l-4 border-gov-saffron p-4 rounded-r-xl text-xs text-amber-950 shadow-xs flex items-start space-x-3">
                <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-900">
                    Statutory Monitoring Protocol:
                  </p>
                  <p className="text-amber-800 mt-0.5 leading-relaxed">
                    Flagged indicators represent statistical variations for human inspection. They are <strong>not proof of irregularity</strong>. Certified on-site verification by the District Planning Authority is required before any administrative action.
                  </p>
                </div>
              </div>

              {/* Anomaly Indicators List */}
              <Card title="Identified Predictive Indicators & Variance Analysis" headerIcon={<ShieldAlert className="w-5 h-5 text-red-600" />}>
                <div className="space-y-3">
                  {aiAnalysis.anomalyIndicators?.map((ind, i) => (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gov-navy-900 text-sm">{ind.featureName}</span>
                        <span className="font-bold px-2.5 py-0.5 rounded bg-red-100 text-red-800 text-[11px] border border-red-200">
                          Severity: {ind.severity} (Confidence: {ind.confidence})
                        </span>
                      </div>
                      <p className="text-slate-800 font-semibold">Pattern: {ind.detectedPattern}</p>
                      <p className="text-slate-600 leading-relaxed">{ind.explanation}</p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Duplicate Work Screening */}
              {duplicateResult && duplicateResult.possibleDuplicate && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-900">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Potential Duplicate Work Signature Detected ({duplicateResult.similarityScore}%)
                  </div>
                  <p className="text-xs text-red-800 leading-relaxed">
                    Project correlates semantically and spatially with existing record <strong className="font-mono">#{duplicateResult.matchingProjectId}</strong>. Flagged for verification by district planning cell.
                  </p>
                </div>
              )}

              {/* AI Recommendations */}
              <Card title="Suggested Decision Support Directives" headerIcon={<CheckCircle2 className="w-5 h-5 text-gov-green" />}>
                <ul className="space-y-2 text-xs">
                  {aiAnalysis.aiRecommendations?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-950 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* TAB 7: AUDIT HISTORY */}
          {activeTab === 'AUDIT' && (
            <Card
              title="Project Modification & Event Audit Trail"
              subtitle="Immutable activity log of all approvals, milestone updates, and voucher records"
              headerIcon={<History className="w-5 h-5 text-slate-600" />}
              borderAccent
            >
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-gov-navy-900">PROJECT_RECORD_CREATED</span>
                    <span className="text-slate-400 text-[11px]">System Initializer</span>
                  </div>
                  <p className="text-slate-600">Administrative sanction order recorded in master database.</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-gov-navy-900">MILESTONE_PROGRESS_INSPECTED</span>
                    <span className="text-slate-400 text-[11px]">District Inspection Cell</span>
                  </div>
                  <p className="text-slate-600">Physical progress certified and measurement book updated.</p>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
