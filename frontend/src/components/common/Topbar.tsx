'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { LogOut, Bell, ChevronRight, LayoutDashboard, Globe, Menu } from 'lucide-react';
import { NotificationBell } from './NotificationBell';

interface TopbarProps {
  title: string;
  scopeBadge?: string;
}

export function Topbar({ title, scopeBadge }: TopbarProps) {
  const { user, logout } = useAuth();
  const { toggleMobileSidebar } = useSidebar();

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'ROLE_MINISTRY_ADMIN':
        return 'Ministry Admin (MoSPI)';
      case 'ROLE_STATE_NODAL_AUTHORITY':
        return 'State Nodal Officer';
      case 'ROLE_DISTRICT_AUTHORITY':
        return 'District Magistrate';
      case 'ROLE_MP':
        return 'Member of Parliament';
      default:
        return 'Authorized Stakeholder';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 h-12 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Toggle, Title & Scope Badge */}
      <div className="flex items-center space-x-2 min-w-0 flex-1">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-1.5 -ml-1 mr-0.5 text-slate-700 hover:text-gov-navy-900 hover:bg-slate-100 rounded-md transition shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <Link href="/" className="text-slate-400 hover:text-gov-navy-800 transition shrink-0 hidden md:flex items-center gap-1 text-[11px] font-bold">
          <Globe className="w-3 h-3 text-amber-500" />
          <span>NIDHINETRA</span>
          <ChevronRight className="w-2.5 h-2.5 text-slate-300" />
        </Link>

        <h1 className="text-xs sm:text-sm font-bold text-gov-navy-900 tracking-tight truncate max-w-[200px] sm:max-w-md lg:max-w-none">
          {title}
        </h1>

        {scopeBadge && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-gov-navy-100 text-gov-navy-800 shrink-0 hidden sm:inline-block truncate max-w-[130px]">
            {scopeBadge}
          </span>
        )}
      </div>

      {/* Right: User Profile & Actions */}
      <div className="flex items-center space-x-2 shrink-0">
        <NotificationBell />

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
          <div className="w-6.5 h-6.5 rounded-full bg-gov-navy-800 text-white flex items-center justify-center font-bold text-[10px]">
            {user?.fullName?.charAt(0) || 'U'}
          </div>

          <div className="hidden md:flex flex-col text-right leading-none">
            <span className="text-xs font-semibold text-gov-navy-900 truncate max-w-[140px]">
              {user?.fullName || 'Official'}
            </span>
            <span className="text-[9px] text-slate-500 font-medium uppercase mt-0.5">
              {getRoleTitle(user?.role)}
            </span>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition ml-1"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
