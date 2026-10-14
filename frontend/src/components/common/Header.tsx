'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NidhiNetraLogo } from './NidhiNetraLogo';
import { useAuth } from '@/context/AuthContext';
import { BRAND } from '@/config/branding';
import {
  Menu,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  BarChart3,
  BookOpen,
  Home,
  FileText,
  Globe,
  Sparkles,
  AlertTriangle,
  User
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, getRoleDashboardUrl } = useAuth();

  const roleDashboardUrl = user ? getRoleDashboardUrl(user.role) : '/dashboard';
  const roleDashboardName = user ? (
    user.role === 'ROLE_MINISTRY_ADMIN' ? 'Ministry Dashboard' :
    user.role === 'ROLE_STATE_NODAL_AUTHORITY' ? 'State Dashboard' :
    user.role === 'ROLE_DISTRICT_AUTHORITY' ? 'District Dashboard' :
    user.role === 'ROLE_MP' ? 'MP Dashboard' : 'Dashboard'
  ) : 'Dashboard';

  // 1. Before Login — Public Visitors
  const publicNavLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'About', href: '/about', icon: BookOpen },
  ];

  // 2. After Login — Authenticated Officials
  const authenticatedNavLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'About', href: '/about', icon: BookOpen },
    { name: 'GIS Map', href: '/map', icon: Globe },
    { name: 'AI Monitoring', href: '/ai-monitoring', icon: Sparkles },
    { name: 'Risk Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Reports', href: '/reports', icon: BookOpen },
    { name: roleDashboardName, href: roleDashboardUrl, icon: LayoutDashboard },
  ];

  const navLinks = isAuthenticated ? authenticatedNavLinks : publicNavLinks;

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const getRoleShortBadge = (role?: string) => {
    switch (role) {
      case 'ROLE_MINISTRY_ADMIN':
        return 'Ministry (MoSPI)';
      case 'ROLE_STATE_NODAL_AUTHORITY':
        return 'State Nodal';
      case 'ROLE_DISTRICT_AUTHORITY':
        return 'District Auth';
      case 'ROLE_MP':
        return 'Hon. MP';
      default:
        return 'Official';
    }
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      {/* Main Streamlined Header Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-13">
          {/* Left: NIDHINETRA Logo & Platform Brand */}
          <Link href="/" className="flex items-center space-x-2 group shrink-0">
            <NidhiNetraLogo
              size="sm"
              showText={true}
              showSubtitle={true}
              subtitleText="MPLADS Fund Intelligence"
            />
          </Link>

          {/* Center: Desktop Navigation (Public or Operational based on auth) */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center space-x-1 ${
                    active
                      ? 'bg-gov-navy-50 text-gov-navy-900 font-bold border-b-2 border-gov-navy-800'
                      : 'text-slate-600 hover:text-gov-navy-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-gov-navy-800' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Authenticated User Pill OR Sign In */}
          <div className="hidden sm:flex items-center space-x-2 shrink-0">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-1 pl-2.5">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-bold text-gov-navy-900 leading-none truncate max-w-[130px]">
                    {user.fullName}
                  </span>
                  <span className="text-[9px] font-bold text-gov-saffron uppercase mt-0.5 leading-none">
                    {getRoleShortBadge(user.role)}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign Out"
                  className="inline-flex items-center px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/register"
                  className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-gov-navy-900 transition"
                >
                  Register
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-gov-navy-800 hover:bg-gov-navy-900 rounded shadow-xs transition"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1 text-gov-saffron" />
                  Portal Access
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-700 hover:text-gov-navy-800 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1.5 shadow-lg max-h-[80vh] overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs font-semibold ${
                  active
                    ? 'bg-gov-navy-50 text-gov-navy-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-gov-navy-700" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <div className="border-t border-slate-200 pt-2.5 mt-2 flex flex-col space-y-2">
            {isAuthenticated && user ? (
              <>
                <div className="px-3 py-1 bg-slate-50 rounded border border-slate-200">
                  <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                  <p className="text-[10px] text-gov-saffron font-semibold">{getRoleShortBadge(user.role)}</p>
                </div>
                <Link
                  href={getRoleDashboardUrl(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center px-3 py-2 text-xs font-bold text-white bg-gov-navy-800 rounded"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />
                  Access Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 rounded hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-bold text-gov-navy-800 border border-slate-300 rounded hover:bg-slate-50"
                >
                  <LogIn className="w-3.5 h-3.5 mr-1" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-bold text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
