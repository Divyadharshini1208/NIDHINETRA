import { fetchApi } from './api';
import { ApiResponse } from '@/types';

export interface UserStatistics {
  totalPersonnel: number;
  activeAccounts: number;
  approvedClearance: number;
  pendingApproval: number;
}

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  mobileNumber?: string;
  role: string;
  organization: string;
  designation?: string;
  stateName?: string;
  districtName?: string;
  isActive: boolean;
  isApproved: boolean;
  accountStatus: string;
  clearanceStatus: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLogItem {
  id: number;
  action: string;
  performedBy: string;
  userRole: string;
  details: string;
  ipAddress: string;
  status: string;
  createdAt: string;
}

export const adminService = {
  async getUsers(page = 0, size = 100): Promise<{
    users: AdminUser[];
    statistics: UserStatistics;
    totalElements: number;
    totalPages: number;
  }> {
    const res = await fetchApi<ApiResponse<{
      users: AdminUser[];
      statistics: UserStatistics;
      totalElements: number;
      totalPages: number;
    }>>(`/api/admin/users?page=${page}&size=${size}`);
    return res.data;
  },

  async getUserStats(): Promise<UserStatistics> {
    const res = await fetchApi<ApiResponse<UserStatistics>>(`/api/admin/users/stats`);
    return res.data;
  },

  async approveUser(id: number, approved = true): Promise<any> {
    const res = await fetchApi<ApiResponse<any>>(`/api/admin/users/${id}/approve?approved=${approved}`, {
      method: 'PUT',
    });
    return res.data;
  },

  async rejectUser(id: number, reason?: string): Promise<any> {
    const res = await fetchApi<ApiResponse<any>>(`/api/admin/users/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason: reason || '' }),
    });
    return res.data;
  },

  async toggleStatus(id: number): Promise<any> {
    const res = await fetchApi<ApiResponse<any>>(`/api/admin/users/${id}/toggle-status`, {
      method: 'PUT',
    });
    return res.data;
  },

  async getAuditLogs(page = 0, size = 50): Promise<AuditLogItem[]> {
    const res = await fetchApi<ApiResponse<AuditLogItem[]>>(`/api/dashboard/audit-logs?page=${page}&size=${size}`);
    return res.data;
  }
};
