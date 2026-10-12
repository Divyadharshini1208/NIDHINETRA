import { fetchApi } from './api';
import { ApiResponse, AuditLog, DashboardStats } from '@/types';

export const dashboardService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return fetchApi<ApiResponse<DashboardStats>>('/api/dashboard/stats');
  },

  async getAuditLogs(page = 0, size = 20): Promise<ApiResponse<AuditLog[]>> {
    return fetchApi<ApiResponse<AuditLog[]>>(`/api/dashboard/audit-logs?page=${page}&size=${size}`);
  },
};
