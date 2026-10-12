'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { NidhiNetraLogo } from '@/components/common/NidhiNetraLogo';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building,
  UserCheck,
  ArrowRight,
  HelpCircle,
  PhoneCall
} from 'lucide-react';

export default function AccountVerificationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <NidhiNetraLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-black text-gov-navy-900 tracking-tight">
              Official Account Verification Status
            </h1>
            <p className="text-xs text-slate-500">
              Multi-Tier Government Stakeholder Verification Workflow
            </p>
          </div>

          <Card className="p-6 sm:p-8 space-y-6 border-t-4 border-t-gov-navy-800">
            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="p-2 bg-amber-100 rounded-full text-amber-700 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="font-bold text-amber-900 text-sm">Account Activation Under Review</h3>
                <p className="text-amber-800 leading-relaxed">
                  Under Government of India cybersecurity protocols, new stakeholder registrations undergo verification by the designated Nodal Authority before portal access is unlocked.
                </p>
              </div>
            </div>

            {/* Verification Stage Tracker */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gov-navy-900 uppercase tracking-wider">
                Verification Protocol Stages:
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-emerald-950">1. Registration Submission</p>
                    <p className="text-slate-600 text-[11px]">Official details recorded and verification ticket created in the central MoSPI registry.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-blue-950">2. Nodal Officer Identity Cross-Check</p>
                    <p className="text-slate-600 text-[11px]">Designation and departmental email domain verification by State / District Nodal Officer.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
                  <UserCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700">3. Portal Activation & Role Provisioning</p>
                    <p className="text-slate-500 text-[11px]">Activation notification dispatched via registered SMS and email with single sign-on clearance.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Assistance Box */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-gov-navy-800" />
                <span>Nodal Helpdesk: <strong>1800-11-MPLADS</strong> (10:00 - 18:00 IST)</span>
              </div>
              <Link href="/login">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                  Return to Login
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
