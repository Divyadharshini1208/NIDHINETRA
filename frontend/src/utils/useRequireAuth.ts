'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to enforce authentication and optional role-based access control.
 * Automatically redirects unauthenticated users to the Portal Access (login) page.
 */
export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        router.replace('/access-denied');
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, allowedRoles]);

  return { user, isAuthenticated, isLoading };
}
