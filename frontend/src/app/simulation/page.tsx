'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { KpiCard } from '@/components/ui/KpiCard';
import { Modal } from '@/components/ui/Modal';
import { projectService } from '@/services/projectService';
import { fundSimulationService } from '@/services/fundSimulationService';
import { Project, SimulationResult, SimulationAdjustment } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/utils/useRequireAuth';
import { LoadingState } from '@/components/ui/StateViews';
import { useToast } from '@/context/ToastContext';
import {
  Sliders,
  Sparkles,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  History,
  Save,
  RotateCcw,
  Users,
  Clock,
  IndianRupee,
  Building2,
  HelpCircle,
  FileText
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

export default function FundSimulationPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { success, error: toastError } = useToast();

  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Adjustments map: projectId -> deltaLakhs
  const [adjustments, setAdjustments] = useState<Record<number, number>>({});
  const [scenarioTitle, setScenarioTitle] = useState('Drinking Water & Healthcare Priority Reallocation');
  const [scenarioDescription, setScenarioDescription] = useState('Reallocating funds from severely stalled road contracts to essential water supply projects');
  
  // Evaluation Result
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  // Saved Scenarios Drawer / Modal
  const [savedScenarios, setSavedScenarios] = useState<SimulationResult[]>([]);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const res = await projectService.getProjects({
        districtId: user?.districtId,
        stateId: user?.stateId,
        size: 25,
      });
      setProjects(res.content || []);
    } catch (err: any) {
      toastError('Project Load Failed', err.message || 'Could not load projects for simulation');
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadSavedScenarios = async () => {
    try {
      const list = await fundSimulationService.getSavedScenarios();
      setSavedScenarios(list);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    loadProjects();
    loadSavedScenarios();
  }, [user]);

  const handleDeltaChange = (projectId: number, value: string) => {
    const num = parseFloat(value);
    setAdjustments((prev) => ({
      ...prev,
      [projectId]: isNaN(num) ? 0 : num,
    }));
  };

  const handleResetAdjustments = () => {
    setAdjustments({});
    setSimulationResult(null);
  };

  const buildPayload = () => {
    const adjustmentList: SimulationAdjustment[] = Object.entries(adjustments)
      .filter(([_, delta]) => delta !== 0)
      .map(([id, delta]) => ({
        projectId: parseInt(id, 10),
        adjustmentDeltaLakhs: delta,
      }));

    return {
      title: scenarioTitle,
      description: scenarioDescription,
      scopeType: (user?.role === 'ROLE_MINISTRY_ADMIN'
        ? 'NATIONAL'
        : user?.role === 'ROLE_STATE_NODAL_AUTHORITY'
        ? 'STATE'
        : 'DISTRICT') as any,
      scopeId: user?.districtId || user?.stateId,
      adjustments: adjustmentList,
    };
  };

  const handleEvaluate = async () => {
    const payload = buildPayload();
    if (payload.adjustments.length === 0) {
      toastError('No Adjustments Made', 'Please specify a hypothetical budget adjustment (± ₹ Lakhs) for at least one project.');
      return;
    }

    setIsEvaluating(true);
    try {
      const result = await fundSimulationService.evaluateScenario(payload);
      setSimulationResult(result);
      if (result.isValidScenario) {
        success('Scenario Evaluated', `Projected net reallocation: ₹${result.netReallocatedCr.toFixed(2)} Cr across ${result.projectsAdjustedCount} projects.`);
      } else {
        toastError('Scenario Constraint Warning', result.validationMessages?.[0] || 'One or more constraints were violated.');
      }
    } catch (err: any) {
      toastError('Evaluation Failed', err.message || 'Error processing what-if calculation');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveScenario = async () => {
    const payload = buildPayload();
    if (payload.adjustments.length === 0) {
      toastError('Cannot Save', 'Make at least one adjustment before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const saved = await fundSimulationService.saveScenario(payload);
      setSimulationResult(saved);
      success('Scenario Saved', `Scenario "${scenarioTitle}" saved for administrative review.`);
      loadSavedScenarios();
    } catch (err: any) {
      toastError('Save Failed', err.message || 'Could not save simulation scenario');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick preset helper
  const handleApplyPreset = () => {
    const newAdjustments: Record<number, number> = {};
    projects.forEach((p) => {
      // If delayed road/bridge project with low progress, reallocate -₹25 Lakhs
      if ((p.categoryName?.includes('Road') || p.categoryName?.includes('Bridge')) && (p.delayDays && p.delayDays > 30)) {
        const canDeduct = Math.max(0, (p.sanctionedAmount || 50) - (p.expenditureAmount || 0));
        newAdjustments[p.id] = -Math.min(25, Math.floor(canDeduct));
      }
      // If drinking water or education project, reallocate +₹25 Lakhs
      if (p.categoryName?.includes('Water') || p.categoryName?.includes('Education') || p.categoryName?.includes('Health')) {
        newAdjustments[p.id] = 25;
      }
    });
    setAdjustments(newAdjustments);
    setScenarioTitle('Essential Drinking Water & Health Priority Reallocation');
    setScenarioDescription('Hypothetically redirecting unutilized sanctions from stalled road contracts to high-impact drinking water works.');
    success('Preset Applied', 'Sample policy reallocation adjustments populated in table. Click Evaluate.');
  };

  // Sector chart data comparison
  const getSectorComparisonData = () => {
    if (!simulationResult?.simulatedProjectDeltas) {
      return [
        { sector: 'Drinking Water', original: 4.5, hypothetical: 5.5 },
        { sector: 'Public Health', original: 3.2, hypothetical: 4.0 },
        { sector: 'Roads & Bridges', original: 8.0, hypothetical: 6.2 },
        { sector: 'Education Infra', original: 5.0, hypothetical: 5.0 },
      ];
    }

    const sectorMap: Record<string, { original: number; hypothetical: number }> = {};
    simulationResult.simulatedProjectDeltas.forEach((d) => {
      const sector = d.sector || 'General';
      if (!sectorMap[sector]) sectorMap[sector] = { original: 0, hypothetical: 0 };
      sectorMap[sector].original += d.originalSanctionedLakhs / 100;
      sectorMap[sector].hypothetical += d.hypotheticalSanctionedLakhs / 100;
    });

    return Object.entries(sectorMap).map(([sector, val]) => ({
      sector,
      original: Math.round(val.original * 10) / 10,
      hypothetical: Math.round(val.hypothetical * 10) / 10,
    }));
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying official authorization credentials..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100/70 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title="What-If Fund Allocation Simulator"
          scopeBadge="Non-Destructive Scenario Exploration Sandbox"
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gov-navy-900 text-white flex items-center justify-center font-black text-sm shadow-sm border border-gov-navy-700">
                <Sliders className="w-5 h-5 text-gov-saffron" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
                    What-If Fund Allocation Simulator
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    Feature 9
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Simulate hypothetical budget reallocations across sectors, estimate beneficiary coverage, and preview delivery timeline shifts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleApplyPreset}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-gov-saffron" />}
              >
                Sample Scenario Preset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSavedModalOpen(true)}
                leftIcon={<History className="w-3.5 h-3.5" />}
              >
                Saved Scenarios ({savedScenarios.length})
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetAdjustments}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* STATUTORY SANDBOX BANNER */}
          <div className="bg-amber-50 border-l-4 border-gov-saffron p-4 rounded-r-xl text-xs text-amber-950 shadow-2xs flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900">
                Statutory Separation & Sandbox Protocol (Feature 9 Safeguard):
              </h4>
              <p className="text-amber-800 mt-1 leading-relaxed">
                This simulator is an <strong>analytical modeling sandbox</strong>. It <strong>NEVER modifies actual sanctioned allocations, treasury accounts, or PFMS records</strong>.
                Hypothetical reallocations are subject to mathematical constraints: a project’s budget cannot drop below its already disbursed expenditure, cannot be negative, and must conform to statutory MPLADS guidelines before any formal submission.
              </p>
            </div>
          </div>

          {/* SIMULATION RESULT KPIS (When Evaluated) */}
          {simulationResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <KpiCard
                  title="Net Reallocated"
                  value={`₹ ${Math.abs(simulationResult.netReallocatedCr || 0).toFixed(2)} Cr`}
                  subtext={`${simulationResult.projectsAdjustedCount} works adjusted`}
                  icon={<ArrowRightLeft className="w-5 h-5" />}
                  accentColor="navy"
                />
                <KpiCard
                  title="Projected Beneficiaries"
                  value={`${simulationResult.projectedBeneficiaryImpact > 0 ? '+' : ''}${simulationResult.projectedBeneficiaryImpact.toLocaleString()} citizens`}
                  subtext="Estimated coverage shift"
                  icon={<Users className="w-5 h-5" />}
                  accentColor="green"
                />
                <KpiCard
                  title="Timeline Delivery Shift"
                  value={`${simulationResult.projectedTimelineDeltaMonths.toFixed(1)} mos`}
                  subtext="Expected project cycle delta"
                  icon={<Clock className="w-5 h-5" />}
                  accentColor="navy"
                />
                <KpiCard
                  title="Constraint Status"
                  value={simulationResult.isValidScenario ? 'Permissible' : 'Violations'}
                  subtext={simulationResult.isValidScenario ? 'All validation checks passed' : 'Exceeds budget/spent limit'}
                  icon={simulationResult.isValidScenario ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                  accentColor={simulationResult.isValidScenario ? 'green' : 'amber'}
                />
              </div>

              {/* Constraint Violations Alert if any */}
              {simulationResult.validationMessages && simulationResult.validationMessages.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    Scenario Validation Warnings:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-red-800">
                    {simulationResult.validationMessages.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sector Shift Comparison Chart */}
              <Card
                title="Sectoral Reallocation Comparison"
                subtitle="Original vs hypothetical budget distribution across developmental sectors (₹ Cr)"
                headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
              >
                <div className="w-full h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getSectorComparisonData()} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="sector" tick={{ fill: '#475569', fontSize: 10 }} />
                      <YAxis tick={{ fill: '#475569', fontSize: 10 }} unit="Cr" />
                      <Tooltip formatter={(v: any) => [`₹${v} Cr`, '']} />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '5px' }} />
                      <Bar dataKey="original" name="Original Sanctioned" fill="#0A2540" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="hypothetical" name="Hypothetical Budget" fill="#138808" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {/* SCENARIO CONFIGURATION & ADJUSTMENT REGISTER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Scenario Metadata Card */}
            <div className="lg:col-span-1 space-y-4">
              <Card
                title="Scenario Parameters"
                subtitle="Name and explain the hypothetical policy reallocation"
                headerIcon={<FileText className="w-5 h-5 text-gov-navy-800" />}
              >
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Scenario Title *</label>
                    <input
                      type="text"
                      value={scenarioTitle}
                      onChange={(e) => setScenarioTitle(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-semibold focus:ring-1 focus:ring-gov-navy-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Policy Rationale</label>
                    <textarea
                      rows={3}
                      value={scenarioDescription}
                      onChange={(e) => setScenarioDescription(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-gov-navy-800"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                    <span className="font-bold text-slate-700 block">Calculation Assumptions:</span>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      &bull; Estimated beneficiary coverage scales at ~2,500 citizens per ₹10 Lakhs in high-priority sectors (Water, Health, Schools).
                      <br />
                      &bull; Funding acceleration on stalled works shifts delivery timeline by ~0.8 months per ₹20 Lakhs injected.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleEvaluate}
                      isLoading={isEvaluating}
                      leftIcon={<Sparkles className="w-4 h-4 text-gov-saffron" />}
                      className="w-full font-bold"
                    >
                      Evaluate Scenario Simulation
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveScenario}
                      isLoading={isSaving}
                      leftIcon={<Save className="w-4 h-4" />}
                      className="w-full font-bold"
                    >
                      Save Scenario for Record
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Project Adjustments Table */}
            <div className="lg:col-span-2 space-y-4">
              <Card
                title="Project Reallocation Matrix"
                subtitle="Adjust hypothetical funding (± ₹ Lakhs). Reductions cannot exceed unspent balances."
                headerIcon={<Sliders className="w-5 h-5 text-gov-navy-800" />}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="py-2.5 px-3">Project & Sector</th>
                        <th className="py-2.5 px-3">Sanctioned</th>
                        <th className="py-2.5 px-3">Disbursed</th>
                        <th className="py-2.5 px-3">Physical %</th>
                        <th className="py-2.5 px-3 text-center">Reallocation Delta (₹ Lakhs)</th>
                        <th className="py-2.5 px-3 text-right">Hypothetical</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {projects.map((p) => {
                        const delta = adjustments[p.id] || 0;
                        const original = p.sanctionedAmount || 0;
                        const spent = p.expenditureAmount || 0;
                        const hypothetical = original + delta;
                        const isViolatingSpent = hypothetical < spent;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-gov-navy-900 block font-mono text-[11px]">{p.projectId}</span>
                              <span className="text-slate-600 block truncate max-w-xs">{p.projectName}</span>
                              <span className="text-[10px] text-slate-400">{p.categoryName || 'Infrastructure'}</span>
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                              ₹{original}L
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-700">
                              ₹{spent}L
                            </td>
                            <td className="py-2.5 px-3 font-mono">
                              {p.physicalProgress}%
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="inline-flex items-center gap-1.5">
                                <input
                                  type="number"
                                  step="5"
                                  placeholder="0"
                                  value={adjustments[p.id] !== undefined ? adjustments[p.id] : ''}
                                  onChange={(e) => handleDeltaChange(p.id, e.target.value)}
                                  className={`w-20 px-2 py-1 text-center font-mono text-xs border rounded-md font-bold ${
                                    delta > 0
                                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                                      : delta < 0
                                      ? 'border-amber-500 bg-amber-50 text-amber-800'
                                      : 'border-slate-300'
                                  }`}
                                />
                                <span className="text-[10px] text-slate-400">L</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              <span className={isViolatingSpent ? 'text-red-600' : 'text-gov-navy-900'}>
                                ₹{hypothetical}L
                              </span>
                              {isViolatingSpent && (
                                <span className="text-[9px] text-red-500 block">Below spent!</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* SAVED SCENARIOS MODAL */}
      <Modal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        title="Saved What-If Policy Scenarios"
        subtitle="Historical exploratory simulations persisted for planning discussions"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs">
          {savedScenarios.length === 0 ? (
            <div className="text-center py-8 text-slate-500 space-y-1">
              <History className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-bold">No Saved Scenarios Yet</p>
              <p className="text-[11px]">Save evaluated simulation scenarios to review and compare outcomes here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedScenarios.map((sc, i) => (
                <div
                  key={sc.id || i}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 hover:bg-white transition"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-gov-navy-900 text-sm">{sc.title}</h5>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Net: ₹{Math.abs(sc.netReallocatedCr || 0).toFixed(2)} Cr
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs">{sc.description || 'No description recorded.'}</p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    <span>
                      Beneficiaries: <strong className="text-slate-800">+{sc.projectedBeneficiaryImpact?.toLocaleString()}</strong>
                    </span>
                    <span>
                      Timeline Shift: <strong className="text-slate-800">{sc.projectedTimelineDeltaMonths} months</strong>
                    </span>
                    <span>
                      Adjusted Works: <strong className="text-slate-800">{sc.projectsAdjustedCount}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setIsSavedModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
