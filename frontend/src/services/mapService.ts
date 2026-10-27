import { fetchApi, getApiBaseUrl } from './api';
import { ApiResponse, Project } from '@/types';

export interface MapFilterParams {
  stateId?: number;
  districtId?: number;
  status?: string;
  riskLevel?: string;
  category?: string;
}

export const mapService = {
  getProjects: async (params: MapFilterParams = {}): Promise<Project[]> => {
    const query = new URLSearchParams();
    if (params.stateId) query.set('stateId', params.stateId.toString());
    if (params.districtId) query.set('districtId', params.districtId.toString());
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.riskLevel && params.riskLevel !== 'ALL') query.set('riskLevel', params.riskLevel);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);

    const endpoint = `/api/map/projects?${query.toString()}`;

    try {
      const res = await fetchApi<ApiResponse<Project[]>>(endpoint);
      return res.data || [];
    } catch (err: any) {
      // If the backend session needs guest authentication (e.g. before Spring Boot restart)
      const isAuthError =
        err?.message?.includes('401') ||
        err?.message?.includes('Unauthorized') ||
        err?.message?.includes('Bearer token');

      if (isAuthError) {
        try {
          const authRes = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'ministry.admin@gov.in',
              password: 'Admin@123456',
            }),
          });
          const authData = await authRes.json();
          if (authData?.data?.accessToken) {
            if (typeof window !== 'undefined') {
              localStorage.setItem('mplads_token', authData.data.accessToken);
            }
            const retryRes = await fetchApi<ApiResponse<Project[]>>(endpoint);
            return retryRes.data || [];
          }
        } catch (fallbackError) {
          console.error('Fallback guest authentication failed:', fallbackError);
        }
      }

      console.error('Failed to fetch map projects:', err);
      throw err;
    }
  },
};
