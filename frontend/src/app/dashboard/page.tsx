'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui/StateViews';

export default function DashboardIndexPage() {
  const { user, getRoleDashboardUrl, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        const url = getRoleDashboardUrl(user.role);
        router.replace(url);
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, getRoleDashboardUrl, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <LoadingState message="Redirecting to role-scoped dashboard..." />
    </div>
  );
}
