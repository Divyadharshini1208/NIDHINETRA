'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NidhiNetraLogo } from '@/components/common/NidhiNetraLogo';
import { useAuth } from '@/context/AuthContext';
import { BRAND } from '@/config/branding';
import { locationService } from '@/services/locationService';
import { State, District } from '@/types';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Lock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn
} from 'lucide-react';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [designation, setDesignation] = useState('');
  const [role, setRole] = useState('ROLE_STATE_NODAL_AUTHORITY');
  const [stateId, setStateId] = useState<number | undefined>(undefined);
  const [districtId, setDistrictId] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => {
    locationService.getStates().then(res => {
      if (res.success && res.data) {
        setStates(res.data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (stateId) {
      locationService.getDistrictsByState(stateId).then(res => {
        if (res.success && res.data) {
          setDistricts(res.data);
        }
      }).catch(() => {});
    } else {
      setDistricts([]);
      setDistrictId(undefined);
    }
  }, [stateId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Password and Confirm Password do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName,
        email,
        mobileNumber,
        organization,
        designation,
        role,
        stateId,
        districtId,
        password,
        confirmPassword,
      });
      setSuccessMsg('Registration submitted successfully! Your account will be activated after verification by the appropriate authority.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please verify the information entered.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="flex justify-center">
              <NidhiNetraLogo size="md" showText={false} />
            </div>
            <h1 className="text-2xl font-black text-gov-navy-900 tracking-tight">
              {BRAND.name} Stakeholder Registration
            </h1>
            <p className="text-xs text-slate-500 max-w-xl mx-auto">
              Create an authorized account for Ministry, State Nodal Departments, District Collectorates, or Members of Parliament.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-6 sm:p-8 border-t-4 border-t-gov-navy-800">
            {errorMsg && (
              <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-md text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-medium space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span>Registration Submitted</span>
                </div>
                <p>{successMsg}</p>
                <div className="pt-2">
                  <Link href="/login" className="inline-flex items-center gap-1 font-bold text-gov-navy-900 hover:text-gov-saffron underline">
                    <LogIn className="w-3.5 h-3.5" /> Return to Login
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name & Title"
                  required
                  placeholder="e.g. Dr. Rajesh Verma, IAS"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  leftIcon={<User className="w-4 h-4" />}
                />

                <Input
                  label="Official Email Address"
                  type="email"
                  required
                  placeholder="name@gov.in or name@sansad.nic.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Official Mobile Number"
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gov-navy-900">
                    Official Stakeholder Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-navy-600"
                  >
                    <option value="ROLE_MINISTRY_ADMIN">Ministry / Administrator</option>
                    <option value="ROLE_STATE_NODAL_AUTHORITY">State Nodal Authority</option>
                    <option value="ROLE_DISTRICT_AUTHORITY">District Authority / DM / DC</option>
                    <option value="ROLE_MP">Member of Parliament (MP)</option>
                  </select>
                </div>

                <Input
                  label="Organization / Department"
                  required
                  placeholder="e.g. Planning Department, Govt of Maharashtra"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  leftIcon={<Building className="w-4 h-4" />}
                />

                <Input
                  label="Official Designation"
                  required
                  placeholder="e.g. Joint Secretary / District Magistrate"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  leftIcon={<Briefcase className="w-4 h-4" />}
                />

                {/* State dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gov-navy-900">
                    Assigned State / UT {role !== 'ROLE_MINISTRY_ADMIN' && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={stateId || ''}
                    onChange={(e) => setStateId(e.target.value ? Number(e.target.value) : undefined)}
                    required={role !== 'ROLE_MINISTRY_ADMIN'}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-navy-600"
                  >
                    <option value="">Select State / UT</option>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* District dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gov-navy-900">
                    Assigned District {(role === 'ROLE_DISTRICT_AUTHORITY' || role === 'ROLE_MP') && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={districtId || ''}
                    onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : undefined)}
                    disabled={!stateId || districts.length === 0}
                    required={role === 'ROLE_DISTRICT_AUTHORITY'}
                    className="w-full text-xs font-medium px-3 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-navy-600 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">{stateId ? 'Select District' : 'Select State first'}</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              {/* Approval notice banner */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Official Verification Policy</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Your account will be activated after verification by the appropriate authority (Ministry Nodal Officer for State authorities; State Nodal Officer for District authorities).
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full font-bold shadow-sm py-2.5"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Submit Official Registration
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
              <span>Already registered as an official stakeholder? </span>
              <Link href="/login" className="font-bold text-gov-navy-900 hover:text-gov-saffron hover:underline">
                Sign In to NIDHINETRA
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
