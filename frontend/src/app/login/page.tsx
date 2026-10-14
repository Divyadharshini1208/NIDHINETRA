'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NidhiNetraLogo } from '@/components/common/NidhiNetraLogo';
import { useAuth } from '@/context/AuthContext';
import { BRAND } from '@/config/branding';
import {
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Building,
  Landmark,
  UserPlus,
  ShieldAlert,
  Server,
  Activity,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_MINISTRY_ADMIN');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, demoLogin } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both official email/ID and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const defaultUrl = await login({ email, password });
      let targetUrl = defaultUrl;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get('redirect');
        if (redirectParam && redirectParam.startsWith('/')) {
          targetUrl = redirectParam;
        }
      }
      router.push(targetUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRolePreset = (presetRole: 'MINISTRY' | 'STATE' | 'DISTRICT' | 'MP') => {
    switch (presetRole) {
      case 'MINISTRY':
        setEmail('ministry.admin@gov.in');
        setPassword('Admin@123456');
        setRole('ROLE_MINISTRY_ADMIN');
        break;
      case 'STATE':
        setEmail('state.mh@gov.in');
        setPassword('State@123456');
        setRole('ROLE_STATE_NODAL_AUTHORITY');
        break;
      case 'DISTRICT':
        setEmail('district.pune@gov.in');
        setPassword('District@123456');
        setRole('ROLE_DISTRICT_AUTHORITY');
        break;
      case 'MP':
        setEmail('mp.pune@sansad.nic.in');
        setPassword('Mp@123456');
        setRole('ROLE_MP');
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT SIDE: Government-style Branding & Analytics Visual */}
          <div className="lg:col-span-5 bg-gradient-to-br from-gov-navy-900 via-gov-navy-800 to-gov-navy-950 rounded-xl text-white p-8 flex flex-col justify-between shadow-xl border border-gov-navy-700 relative overflow-hidden">
            {/* Subtle watermark ashoka pattern */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-1 gov-tricolor-bar" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-center space-x-3">
                <NidhiNetraLogo size="md" variant="dark" showText={false} />
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">{BRAND.name}</p>
                  <p className="text-xs text-slate-300">Public Fund Intelligence Platform</p>
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                  {BRAND.name}
                </h1>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mt-1">
                  {BRAND.subtitle}
                </p>
                <p className="text-xs font-medium text-slate-200 italic mt-1.5">
                  &ldquo;{BRAND.tagline}&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {BRAND.purpose}
                </p>
              </div>

              {/* Subtle Monitoring & Analytics Visual Card */}
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">System Live Stream</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    PFMS API: CONNECTED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/20 p-2.5 rounded border border-white/5">
                    <p className="text-[10px] text-slate-400 font-medium">Active Projects</p>
                    <p className="text-base font-bold text-white font-mono">9,344</p>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded border border-white/5">
                    <p className="text-[10px] text-slate-400 font-medium">Fund Sanctioned</p>
                    <p className="text-base font-bold text-amber-400 font-mono">₹4,860 Cr</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    NIC Tier-4 Secured
                  </span>
                  <span className="text-slate-400">TLS 1.3 / 256-bit</span>
                </div>
              </div>
            </div>

            {/* Bottom visual features */}
            <div className="pt-6 mt-6 border-t border-white/10 text-[11px] text-slate-400 space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Role-Based Multi-Tier Authorization (Ministry, State, District, MP)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span>Automated GIS Geotagging & Milestone Validation</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Login Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-gov-navy-900 tracking-tight">Official Stakeholder Login</h2>
                  <p className="text-xs text-slate-500">Enter your authorized credentials to access your designated role portal.</p>
                </div>
                <div className="p-2 bg-gov-navy-50 rounded-lg border border-gov-navy-100">
                  <Landmark className="w-6 h-6 text-gov-navy-800" />
                </div>
              </div>

              {errorMsg && (
                <div className="my-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-medium flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 mt-5">
                <Input
                  label="Official Email / ID"
                  type="email"
                  required
                  placeholder="name@gov.in or name@sansad.nic.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  autoComplete="current-password"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gov-navy-900">
                    Designated Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-navy-600"
                  >
                    <option value="ROLE_MINISTRY_ADMIN">Ministry / Administrator (National Scope)</option>
                    <option value="ROLE_STATE_NODAL_AUTHORITY">State Nodal Authority (State Scope)</option>
                    <option value="ROLE_DISTRICT_AUTHORITY">District Authority / DM (District Scope)</option>
                    <option value="ROLE_MP">Member of Parliament / MP (Constituency Scope)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 text-gov-navy-800 focus:ring-gov-navy-600"
                    />
                    <span>Remember session</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="font-bold text-gov-navy-800 hover:text-gov-saffron hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full font-bold shadow-md text-sm py-2.5 bg-gov-navy-900 hover:bg-gov-navy-800"
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Authenticate & Enter Portal
                </Button>
              </form>

              {/* 1-Click Evaluation Logins */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    1-Click Evaluation Presets
                  </span>
                  <span className="text-[10px] text-slate-400">Click to autofill role</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => { handleRolePreset('MINISTRY'); demoLogin('MINISTRY'); }}
                    className="p-2 bg-slate-50 hover:bg-gov-navy-50 border border-slate-200 hover:border-gov-navy-400 rounded text-left transition flex items-center space-x-2 group"
                  >
                    <Landmark className="w-3.5 h-3.5 text-gov-navy-800 group-hover:text-gov-saffron flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-gov-navy-900 truncate">1. Ministry Admin</p>
                      <p className="text-[10px] text-slate-500 truncate">National Dashboard</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { handleRolePreset('STATE'); demoLogin('STATE'); }}
                    className="p-2 bg-slate-50 hover:bg-gov-navy-50 border border-slate-200 hover:border-gov-navy-400 rounded text-left transition flex items-center space-x-2 group"
                  >
                    <Building className="w-3.5 h-3.5 text-gov-navy-800 group-hover:text-gov-saffron flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-gov-navy-900 truncate">2. State Nodal</p>
                      <p className="text-[10px] text-slate-500 truncate">State Dashboard (MH)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { handleRolePreset('DISTRICT'); demoLogin('DISTRICT'); }}
                    className="p-2 bg-slate-50 hover:bg-gov-navy-50 border border-slate-200 hover:border-gov-navy-400 rounded text-left transition flex items-center space-x-2 group"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-gov-navy-800 group-hover:text-gov-saffron flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-gov-navy-900 truncate">3. District Auth</p>
                      <p className="text-[10px] text-slate-500 truncate">District Dashboard (Pune)</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => { handleRolePreset('MP'); demoLogin('MP'); }}
                    className="p-2 bg-slate-50 hover:bg-gov-navy-50 border border-slate-200 hover:border-gov-navy-400 rounded text-left transition flex items-center space-x-2 group"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-gov-navy-800 group-hover:text-gov-saffron flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="font-bold text-gov-navy-900 truncate">4. Member of Parliament</p>
                      <p className="text-[10px] text-slate-500 truncate">MP Dashboard (Pune PC)</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Security / Privacy notices */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Secure 256-bit TLS Encrypted Session
                </span>
                <Link
                  href="/register"
                  className="font-bold text-gov-navy-900 hover:text-gov-saffron hover:underline inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  Register Account
                </Link>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                <strong>Legal Notice:</strong> Access is restricted to authorized Government and Parliamentary personnel only.
                All login actions and IP addresses are recorded under the IT Act 2000 for audit compliance.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
