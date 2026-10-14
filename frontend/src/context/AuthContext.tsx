'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, RoleType } from '@/types';
import { authService, LoginPayload, RegisterPayload } from '@/services/authService';
import { locationService } from '@/services/locationService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<string>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  getRoleDashboardUrl: (role?: RoleType | string) => string;
  demoLogin: (roleType: 'MINISTRY' | 'STATE' | 'DISTRICT' | 'MP') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { success, error: toastError, info } = useToast();

  const getRoleDashboardUrl = (role?: RoleType | string): string => {
    switch (role) {
      case 'ROLE_MINISTRY_ADMIN':
        return '/ministry/dashboard';
      case 'ROLE_STATE_NODAL_AUTHORITY':
        return '/state/dashboard';
      case 'ROLE_DISTRICT_AUTHORITY':
        return '/district/dashboard';
      case 'ROLE_MP':
        return '/mp/dashboard';
      default:
        return '/ministry/dashboard';
    }
  };

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('mplads_token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('mplads_user') : null;

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        if (typeof document !== 'undefined') {
          document.cookie = `mplads_token=${storedToken}; path=/; max-age=86400; SameSite=Lax`;
        }
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('mplads_token');
        localStorage.removeItem('mplads_user');
        if (typeof document !== 'undefined') {
          document.cookie = 'mplads_token=; path=/; max-age=0; SameSite=Lax';
        }
      }
    } else {
      if (typeof document !== 'undefined') {
        document.cookie = 'mplads_token=; path=/; max-age=0; SameSite=Lax';
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (payload: LoginPayload): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await authService.login(payload);
      if (response.success && response.data) {
        const { accessToken, user: authenticatedUser } = response.data;
        setToken(accessToken);
        setUser(authenticatedUser);
        localStorage.setItem('mplads_token', accessToken);
        localStorage.setItem('mplads_user', JSON.stringify(authenticatedUser));
        if (typeof document !== 'undefined') {
          document.cookie = `mplads_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        }
        sessionStorage.removeItem('mplads_signed_out');

        const targetUrl = getRoleDashboardUrl(authenticatedUser.role);
        success('Authentication Successful', `Welcome, ${authenticatedUser.fullName}`);
        return targetUrl;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      toastError('Authentication Failed', err.message || 'Invalid credentials provided');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.register(payload);
      if (response.success) {
        success('Registration Submitted', 'Official registration submitted. Your account is pending Ministry Administrator approval.');
        router.push('/login');
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err: any) {
      toastError('Registration Failed', err.message || 'Could not register user');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('mplads_token');
    localStorage.removeItem('mplads_user');
    if (typeof document !== 'undefined') {
      document.cookie = 'mplads_token=; path=/; max-age=0; SameSite=Lax';
    }
    sessionStorage.setItem('mplads_signed_out', 'true');
    locationService.clearCache();
    info('Logged Out', 'You have been safely signed out from the portal');
    router.push('/login');
  };

  const demoLogin = async (roleType: 'MINISTRY' | 'STATE' | 'DISTRICT' | 'MP') => {
    let email = '';
    let password = '';

    switch (roleType) {
      case 'MINISTRY':
        email = 'ministry.admin@gov.in';
        password = 'Admin@123456';
        break;
      case 'STATE':
        email = 'state.mh@gov.in';
        password = 'State@123456';
        break;
      case 'DISTRICT':
        email = 'district.pune@gov.in';
        password = 'District@123456';
        break;
      case 'MP':
        email = 'mp.pune@sansad.nic.in';
        password = 'Mp@123456';
        break;
    }

    try {
      const targetUrl = await login({ email, password });
      router.push(targetUrl);
    } catch (e) {
      // Handled in login
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        getRoleDashboardUrl,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
