'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Home, LayoutDashboard, LogIn } from 'lucide-react';

export default function AccessDeniedPage() {
  const { user, getRoleDashboardUrl } = useAuth();
  const dashboardUrl = user ? getRoleDashboardUrl(user.role) : '/login';

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-lg border border-red-200 shadow-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border-4 border-red-50">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
              403 - ACCESS RESTRICTED
            </span>
            <h1 className="text-2xl font-black text-gov-navy-900 tracking-tight">
              Access Restricted
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              You do not have permission to access this section. Your assigned role or geographic scope is restricted from viewing or editing this record.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500 text-left space-y-1">
            <p className="font-semibold text-slate-700">Role-Based Data Access Policy:</p>
            <p>• Ministry Admin: Full national scope across all states & projects.</p>
            <p>• State Nodal Authority: Access limited to assigned State only.</p>
            <p>• District Authority: Access limited to assigned District only.</p>
            <p>• Member of Parliament: Access limited to assigned Constituency only.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Link href={dashboardUrl} className="w-full sm:w-auto">
              <Button variant="primary" size="md" className="w-full font-bold" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
                Return to Dashboard
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
                Portal Home
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
