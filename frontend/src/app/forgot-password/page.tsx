'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NidhiNetraLogo } from '@/components/common/NidhiNetraLogo';
import { BRAND } from '@/config/branding';
import { useToast } from '@/context/ToastContext';
import { Mail, KeyRound, ArrowLeft, CheckCircle2, Shield } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { success } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      success('OTP Dispatched', 'Password reset instructions sent to official registered email.');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <NidhiNetraLogo size="lg" showText={false} />
            </div>
            <h1 className="text-2xl font-black text-gov-navy-900 tracking-tight">
              Official Password Reset
            </h1>
            <p className="text-xs text-slate-500">
              Recover access to your NIDHINETRA official stakeholder account
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-md p-6 sm:p-8 border-t-4 border-t-gov-navy-800">
            {isSubmitted ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-green-100 text-gov-green flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-gov-navy-900">Instructions Dispatched</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  A secure one-time verification link and OTP have been dispatched to <strong>{email}</strong>. Please follow the instructions to reset your security credentials.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <Button variant="primary" size="md" className="w-full">
                      Return to Stakeholder Login
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 leading-relaxed">
                  Enter your official email address registered with MoSPI or your District Collectorate. A verified reset token will be issued.
                </div>

                <Input
                  label="Registered Official Email"
                  type="email"
                  required
                  placeholder="name@gov.in or @sansad.nic.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full font-bold"
                  isLoading={isLoading}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                >
                  Request Password Reset Token
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-gov-navy-900"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                    Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
