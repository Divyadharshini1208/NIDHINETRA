import { fetchApi } from './api';
import { ApiResponse, AuthResponse, User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  role: string;
  stateId?: number;
  districtId?: number;
  constituencyId?: number;
  organization: string;
  designation: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<AuthResponse>> {
    return fetchApi<ApiResponse<AuthResponse>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async register(payload: RegisterPayload): Promise<ApiResponse<User>> {
    return fetchApi<ApiResponse<User>>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return fetchApi<ApiResponse<User>>('/api/auth/me');
  },

  async checkHealth(): Promise<ApiResponse<any>> {
    return fetchApi<ApiResponse<any>>('/api/health');
  },
};
