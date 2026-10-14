'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NidhiNetraLogo } from './NidhiNetraLogo';
import { useAuth } from '@/context/AuthContext';
import { BRAND } from '@/config/branding';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  IndianRupee,
  FileCheck2,
  FileText,
  Shield,
  Activity,
  History,
  BarChart3,
  Globe,
  Settings,
  HelpCircle,
  LogOut,
  Landmark,
  UserCheck,
  Users,
  Sparkles,
  MapPin,
  TrendingUp,
  Sliders
} from 'lucide-react';

import { useSidebar } from '@/context/SidebarContext';
import { X } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  const role = user?.role;

  const isActive = (path: string) => pathname === path;

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const getNavLinks = (): NavItem[] => {
    if (role === 'ROLE_MINISTRY_ADMIN') {
      return [
        { name: 'National Overview', href: '/ministry/dashboard', icon: LayoutDashboard },
        { name: 'Projects Registry', href: '/projects', icon: FileText },
        { name: 'AI Risk Monitoring', href: '/ai-monitoring', icon: Sparkles },
        { name: 'Risk Alerts & Dossier', href: '/alerts', icon: AlertTriangle },
        { name: 'Agency Reliability', href: '/agencies', icon: UserCheck },
        { name: 'Fund Simulator', href: '/simulation', icon: Sliders },
        { name: 'Geographic GIS Map', href: '/map', icon: Globe },
        { name: 'Statutory Reports', href: '/reports', icon: BarChart3 },
        { name: 'Bulk Data Import', href: '/admin/data-import', icon: Landmark },
        { name: 'User Management', href: '/admin/users', icon: Users },
        { name: 'System Audit Logs', href: '/admin/audit-logs', icon: History },
      ];
    } else if (role === 'ROLE_STATE_NODAL_AUTHORITY') {
      return [
        { name: 'State Overview', href: '/state/dashboard', icon: LayoutDashboard },
        { name: 'State Projects', href: '/projects', icon: FileText },
        { name: 'AI Monitoring', href: '/ai-monitoring', icon: Sparkles },
        { name: 'Risk Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'Agency Reliability', href: '/agencies', icon: UserCheck },
        { name: 'Fund Simulator', href: '/simulation', icon: Sliders },
        { name: 'District GIS Map', href: '/map', icon: Globe },
        { name: 'Statutory Reports', href: '/reports', icon: BarChart3 },
      ];
    } else if (role === 'ROLE_DISTRICT_AUTHORITY') {
      return [
        { name: 'District Dashboard', href: '/district/dashboard', icon: LayoutDashboard },
        { name: 'District Projects', href: '/projects', icon: FileText },
        { name: 'AI Risk Queue', href: '/ai-monitoring', icon: Sparkles },
        { name: 'Risk Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'Agency Reliability', href: '/agencies', icon: UserCheck },
        { name: 'Fund Simulator', href: '/simulation', icon: Sliders },
        { name: 'District GIS Map', href: '/map', icon: Globe },
        { name: 'Statutory Reports', href: '/reports', icon: BarChart3 },
      ];
    } else if (role === 'ROLE_MP') {
      return [
        { name: 'Constituency Tracker', href: '/mp/dashboard', icon: LayoutDashboard },
        { name: 'Recommended Works', href: '/projects', icon: FileText },
        { name: 'Risk Indicators', href: '/alerts', icon: AlertTriangle },
        { name: 'Agency Reliability', href: '/agencies', icon: UserCheck },
        { name: 'Fund Simulator', href: '/simulation', icon: Sliders },
        { name: 'Constituency Map', href: '/map', icon: Globe },
        { name: 'Statutory Reports', href: '/reports', icon: BarChart3 },
      ];
    } else {
      return [
        { name: 'Dashboard', href: '/ministry/dashboard', icon: LayoutDashboard },
        { name: 'Projects', href: '/projects', icon: FileText },
        { name: 'AI Monitoring', href: '/ai-monitoring', icon: Sparkles },
        { name: 'Risk Alerts', href: '/alerts', icon: AlertTriangle },
        { name: 'Agency Reliability', href: '/agencies', icon: UserCheck },
        { name: 'Fund Simulator', href: '/simulation', icon: Sliders },
        { name: 'GIS Map', href: '/map', icon: Globe },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
      ];
    }
  };

  const navLinks = getNavLinks();

  const renderSidebarContent = (isMobile: boolean = false) => (
    <>
      {/* Top Brand Section */}
      <div>
        <div className="p-3.5 border-b border-slate-800 bg-[#071A2E] flex items-center justify-between">
          <Link href="/" className="flex items-center" onClick={() => isMobile && closeMobileSidebar()}>
            <NidhiNetraLogo
              size="sm"
              variant="dark"
              showText={true}
              showSubtitle={true}
              subtitleText="MPLADS Fund Intelligence"
            />
          </Link>
          {isMobile && (
            <button
              onClick={closeMobileSidebar}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* User Scope Banner */}
        <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 text-xs">
          <p className="text-[10px] uppercase font-bold text-slate-400">Active Jurisdiction</p>
          <p className="font-bold text-white truncate mt-0.5">
            {role === 'ROLE_MINISTRY_ADMIN'
              ? 'National (Central MoSPI)'
              : role === 'ROLE_STATE_NODAL_AUTHORITY'
              ? user?.stateName || 'Maharashtra'
              : role === 'ROLE_DISTRICT_AUTHORITY'
              ? user?.districtName || 'Pune Collectorate'
              : user?.constituencyName || 'Pune PC (Lok Sabha)'}
          </p>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Administrative Menu
          </p>

          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => isMobile && closeMobileSidebar()}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-gov-navy-600 text-white font-bold border-l-3 border-gov-saffron'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-gov-saffron-light' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-red-500/20 text-red-300 rounded border border-red-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <p className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Public Transparency
            </p>

            <Link
              href="/"
              onClick={() => isMobile && closeMobileSidebar()}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white"
            >
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Public Home</span>
            </Link>

            <Link
              href="/insights"
              onClick={() => isMobile && closeMobileSidebar()}
              className="flex items-center space-x-2.5 px-3 py-2 rounded-md text-xs font-semibold text-slate-300 hover:bg-slate-800/80 hover:text-white"
            >
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <span>Public Insights</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-slate-800 bg-[#071A2E]/50">
        <button
          onClick={() => {
            if (isMobile) closeMobileSidebar();
            logout();
          }}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded bg-slate-800/80 hover:bg-red-950/40 text-xs font-semibold text-slate-300 hover:text-red-300 border border-slate-700/80 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (>= 1024px) */}
      <aside className="hidden lg:flex w-64 bg-[#0A2540] text-slate-300 flex-col justify-between h-screen sticky top-0 border-r border-slate-800 z-30 shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile & Tablet Drawer Modal (< 1024px) */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs transition-opacity"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <aside
            className="relative w-72 max-w-[85vw] bg-[#0A2540] text-slate-300 flex flex-col justify-between h-full z-50 shadow-2xl border-r border-slate-800 overflow-y-auto animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
          >
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
