'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  BookOpen,
  Building,
  Target,
  Layers,
  Sparkles,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  Landmark,
  UserCheck,
  Scale,
  Activity
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      {/* Page Header Banner */}
      <section className="bg-gov-navy-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b-4 border-gov-saffron">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-gov-saffron-light text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" />
            <span>Scheme Documentation & Institutional Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            About NIDHINETRA — AI-Powered Public Fund Intelligence Platform
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
            A comprehensive overview of NIDHINETRA, its mission in monitoring the Member of Parliament Local Area Development Scheme (MPLADS), operational framework, and AI-assisted decision support architecture.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* 1. ABOUT MPLADS SCHEME */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-gov-saffron uppercase tracking-wider">Historical Context</span>
            <h2 className="text-2xl font-black text-gov-navy-900 gov-section-header">
              The MPLAD Scheme Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4 text-sm text-slate-700 leading-relaxed bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
              <p>
                The <strong>Member of Parliament Local Area Development Scheme (MPLADS)</strong> was formulated in December 1993 to enable Members of Parliament (MPs) to recommend works of developmental nature with emphasis on the creation of durable community assets based on locally felt needs.
              </p>
              <p>
                Under the revised guidelines issued by the <strong>Ministry of Statistics and Programme Implementation (MoSPI)</strong>, each Hon'ble Member of Parliament has the entitlement to recommend developmental works to the tune of <strong>₹5 Crore per annum</strong> in their designated parliamentary constituency (for Lok Sabha MPs) or in one or more districts of the State from which they are elected (for Rajya Sabha MPs).
              </p>
              <p>
                Priority focus sectors include <em>drinking water facilities, education infrastructure, public health diagnostics, sanitation, community centers, roads, bridges, and renewable solar installations</em>.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gov-navy-900 border-b border-slate-200 pb-2">
                Key Scheme Parameters
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Annual Allocation:</span>
                  <span className="font-bold text-gov-navy-900">₹5.00 Crore / MP</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Nodal Ministry:</span>
                  <span className="font-bold text-gov-navy-900">MoSPI, GoI</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Sanctioning Authority:</span>
                  <span className="font-bold text-gov-navy-900">District Magistrate (DM/DC)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">SC/ST Population Quota:</span>
                  <span className="font-bold text-gov-navy-900">15% SC / 7.5% ST</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-600">Nature of Assets:</span>
                  <span className="font-bold text-gov-navy-900">Durable Community Assets</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. OBJECTIVES OF THE MONITORING PLATFORM */}
        <section className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-gov-saffron uppercase tracking-wider">Mission Mandate</span>
            <h2 className="text-2xl font-black text-gov-navy-900 gov-section-header">
              NIDHINETRA Platform Objectives
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                num: '01',
                title: 'Monitor Project Implementation',
                desc: 'End-to-end digital tracking from MP recommendation receipt through technical feasibility, tender award, and asset commissioning.',
                icon: <Building2 className="w-5 h-5 text-gov-navy-800" />,
              },
              {
                num: '02',
                title: 'Track Financial Utilization',
                desc: 'Real-time telemetry on installment releases, unspent balances, interest accruals, and milestone bill payments linked with PFMS.',
                icon: <Activity className="w-5 h-5 text-gov-green" />,
              },
              {
                num: '03',
                title: 'Identify Milestone Delays',
                desc: 'Proactive detection of administrative bottlenecks, technical clearance hold-ups, and contractor delay trajectories.',
                icon: <AlertTriangle className="w-5 h-5 text-gov-saffron" />,
              },
              {
                num: '04',
                title: 'Identify Unusual Patterns',
                desc: 'Automated algorithms cross-checking physical progress metrics against financial disbursements to spot deviations.',
                icon: <Sparkles className="w-5 h-5 text-blue-600" />,
              },
              {
                num: '05',
                title: 'Support Risk-Based Monitoring',
                desc: 'Prioritizing District Officer physical field inspections towards flagged high-variance or delayed works.',
                icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
              },
              {
                num: '06',
                title: 'Improve Public Transparency',
                desc: 'Providing open-access aggregate insights and dashboards for citizens, civil society, and researchers.',
                icon: <Users className="w-5 h-5 text-emerald-600" />,
              },
              {
                num: '07',
                title: 'Enable Evidence-Based Decisions',
                desc: 'Equipping central and state leadership with quantitative data to refine policy guidelines and fund allocation rules.',
                icon: <Scale className="w-5 h-5 text-indigo-600" />,
              },
            ].map((obj) => (
              <div
                key={obj.num}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex items-start space-x-3.5"
              >
                <div className="p-2 rounded bg-slate-50 border border-slate-200 flex-shrink-0">
                  {obj.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-gov-saffron">{obj.num}</span>
                    <h3 className="text-sm font-bold text-gov-navy-900">{obj.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{obj.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. STAKEHOLDER HIERARCHY & FLOWCHART */}
        <section id="stakeholders" className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-gov-saffron uppercase tracking-wider">Governance Structure</span>
            <h2 className="text-2xl font-black text-gov-navy-900 gov-section-header">
              Stakeholder Hierarchy & Decision Flow
            </h2>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs">
            {/* Horizontal / Grid Visual Hierarchy Diagram */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Level 1: Central Ministry */}
                <div className="p-4 rounded-lg bg-gov-navy-900 text-white border-2 border-gov-navy-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-gov-saffron-light text-xs font-bold">
                      <Landmark className="w-4 h-4" />
                      <span>LEVEL 1: CENTRAL</span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">Central Ministry (MoSPI)</h4>
                    <p className="text-xs text-slate-300 mt-2 leading-snug">
                      Policy formulation, overall fund releases, national guideline enforcement, and cross-state analytics.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-slate-300 inline-block w-fit">
                    Full National Scope
                  </span>
                </div>

                {/* Level 2: State Nodal Authority */}
                <div className="p-4 rounded-lg bg-slate-50 text-slate-900 border-2 border-slate-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-gov-navy-800 text-xs font-bold">
                      <Building className="w-4 h-4" />
                      <span>LEVEL 2: STATE</span>
                    </div>
                    <h4 className="text-base font-bold text-gov-navy-900 mt-1">State Nodal Authority</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-snug">
                      State planning departments supervising district physical progress, state fund pooling, and inter-district coordination.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700 inline-block w-fit">
                    State Level Scope
                  </span>
                </div>

                {/* Level 3: District Authority */}
                <div className="p-4 rounded-lg bg-slate-50 text-slate-900 border-2 border-slate-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-gov-green text-xs font-bold">
                      <Landmark className="w-4 h-4" />
                      <span>LEVEL 3: DISTRICT</span>
                    </div>
                    <h4 className="text-base font-bold text-gov-navy-900 mt-1">District Authority (DM/DC)</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-snug">
                      Scrutiny of MP recommendations, administrative sanctions, tender awards, milestone bill approvals, and on-site inspections.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700 inline-block w-fit">
                    District Level Scope
                  </span>
                </div>

                {/* Level 4: Implementing Agencies */}
                <div className="p-4 rounded-lg bg-slate-50 text-slate-900 border-2 border-slate-300 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2 text-blue-600 text-xs font-bold">
                      <Building2 className="w-4 h-4" />
                      <span>LEVEL 4: EXECUTION</span>
                    </div>
                    <h4 className="text-base font-bold text-gov-navy-900 mt-1">Implementing Agencies</h4>
                    <p className="text-xs text-slate-600 mt-2 leading-snug">
                      PWD, Zilla Parishad, Municipal Councils, and Jal Nigam executing ground construction and submitting progress bills.
                    </p>
                  </div>
                  <span className="mt-3 text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-700 inline-block w-fit">
                    Work Site Level
                  </span>
                </div>
              </div>

              {/* Members of Parliament Stakeholder Connection Banner */}
              <div className="p-5 rounded-lg bg-gradient-to-r from-gov-navy-50 via-white to-blue-50 border border-gov-navy-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gov-navy-800 text-white rounded-lg flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-gov-saffron-light" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gov-navy-900">
                      Hon'ble Members of Parliament (MPs)
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 max-w-2xl">
                      Elected representatives who recommend developmental works based on citizen needs, monitor execution milestones in their constituency, and review citizen utility satisfaction.
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-gov-navy-800 px-3 py-1.5 rounded-full bg-white border border-slate-300 shadow-xs flex-shrink-0">
                  Direct Constituency Linkage
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. AI-ASSISTED MONITORING ETHICS & GUARDRAILS */}
        <section id="ai-guardrails" className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-gov-saffron uppercase tracking-wider">Algorithmic Integrity</span>
            <h2 className="text-2xl font-black text-gov-navy-900 gov-section-header">
              AI-Assisted Monitoring & Ethical Guardrails
            </h2>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-gov-navy-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gov-green" /> Human-in-the-Loop
                </h4>
                <p>
                  Artificial Intelligence algorithms never execute punitive or automated sanction freezes. All alerts generate prioritized inspection requests for human administrative review.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-gov-navy-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gov-green" /> Objective Statistical Basis
                </h4>
                <p>
                  Risk indicators are computed exclusively on empirical telemetry: disbursement dates, milestone certificates, contractor billings, and geo-coordinates.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-gov-navy-900 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-gov-green" /> Transparent Audit Trail
                </h4>
                <p>
                  Every analytical flag includes an explanation of the underlying variance metric and references specific project milestones.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
