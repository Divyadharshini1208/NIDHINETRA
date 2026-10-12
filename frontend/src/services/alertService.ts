import { fetchApi } from './api';
import { ApiResponse, PagedResponse, RiskAlert } from '@/types';

export interface AlertFilterParams {
  severity?: string;
  alertType?: string;
  status?: string;
  stateId?: number;
  districtId?: number;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AlertActionPayload {
  status?: string;
  assigneeName?: string;
  noteText?: string;
  escalationReason?: string;
  priority?: string;
}

export const alertService = {
  getAlerts: async (params?: AlertFilterParams): Promise<PagedResponse<RiskAlert>> => {
    const query = new URLSearchParams();
    if (params?.severity) query.set('severity', params.severity);
    if (params?.alertType) query.set('alertType', params.alertType);
    if (params?.status) query.set('status', params.status);
    if (params?.stateId) query.set('stateId', String(params.stateId));
    if (params?.districtId) query.set('districtId', String(params.districtId));
    if (params?.search) query.set('search', params.search);
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    if (params?.sort) query.set('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await fetchApi<ApiResponse<PagedResponse<RiskAlert>>>(`/api/alerts${qs}`);
    return res.data;
  },

  getAlertById: async (id: number | string): Promise<RiskAlert> => {
    const res = await fetchApi<ApiResponse<RiskAlert>>(`/api/alerts/${id}`);
    return res.data;
  },

  updateStatus: async (id: number | string, payload: AlertActionPayload): Promise<RiskAlert> => {
    const res = await fetchApi<ApiResponse<RiskAlert>>(`/api/alerts/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  assignAlert: async (id: number | string, assigneeName: string): Promise<RiskAlert> => {
    const res = await fetchApi<ApiResponse<RiskAlert>>(`/api/alerts/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assigneeName }),
    });
    return res.data;
  },

  addNote: async (id: number | string, noteText: string): Promise<RiskAlert> => {
    const res = await fetchApi<ApiResponse<RiskAlert>>(`/api/alerts/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ noteText }),
    });
    return res.data;
  },

  escalate: async (id: number | string, escalationReason: string): Promise<RiskAlert> => {
    const res = await fetchApi<ApiResponse<RiskAlert>>(`/api/alerts/${id}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ escalationReason }),
    });
    return res.data;
  },
};
