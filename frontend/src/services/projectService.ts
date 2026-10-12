import { fetchApi } from './api';
import {
  ApiResponse,
  PagedResponse,
  Project,
  ProjectFinancials,
  ProjectProgressLog,
  Document,
  RiskAlert,
  AiAnalysisPreview,
  ProjectCategory,
  ProjectReviewRequest
} from '@/types';

export interface ProjectFilterParams {
  stateId?: number;
  districtId?: number;
  constituencyId?: number;
  mpName?: string;
  status?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  riskLevel?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
  signal?: AbortSignal;
}

export const projectService = {
  getProjects: async (params: ProjectFilterParams = {}): Promise<PagedResponse<Project>> => {
    const query = new URLSearchParams();
    if (params.stateId) query.set('stateId', params.stateId.toString());
    if (params.districtId) query.set('districtId', params.districtId.toString());
    if (params.constituencyId) query.set('constituencyId', params.constituencyId.toString());
    if (params.mpName) query.set('mpName', params.mpName);
    if (params.status && params.status !== 'ALL') query.set('status', params.status);
    if (params.category && params.category !== 'ALL') query.set('category', params.category);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);
    if (params.riskLevel && params.riskLevel !== 'ALL') query.set('riskLevel', params.riskLevel);
    if (params.search) query.set('search', params.search);
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sort) query.set('sort', params.sort);

    const res = await fetchApi<ApiResponse<PagedResponse<Project>>>(
      `/api/projects?${query.toString()}`,
      { signal: params.signal }
    );
    return res.data;
  },

  getProjectById: async (id: number | string): Promise<Project> => {
    const res = await fetchApi<ApiResponse<Project>>(`/api/projects/${id}`);
    return res.data;
  },

  getCategories: async (): Promise<ProjectCategory[]> => {
    const res = await fetchApi<ApiResponse<ProjectCategory[]>>('/api/projects/categories');
    return res.data;
  },

  createProject: async (payload: Partial<Project>): Promise<Project> => {
    const res = await fetchApi<ApiResponse<Project>>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  updateProject: async (id: number | string, payload: Partial<Project>): Promise<Project> => {
    const res = await fetchApi<ApiResponse<Project>>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  reviewProject: async (id: number | string, payload: ProjectReviewRequest): Promise<Project> => {
    const res = await fetchApi<ApiResponse<Project>>(`/api/projects/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  deleteProject: async (id: number | string): Promise<void> => {
    await fetchApi<ApiResponse<void>>(`/api/projects/${id}`, {
      method: 'DELETE',
    });
  },

  getProjectFinancials: async (id: number | string): Promise<ProjectFinancials> => {
    const res = await fetchApi<ApiResponse<ProjectFinancials>>(`/api/projects/${id}/financials`);
    return res.data;
  },

  getProjectProgress: async (id: number | string): Promise<ProjectProgressLog[]> => {
    const res = await fetchApi<ApiResponse<ProjectProgressLog[]>>(`/api/projects/${id}/progress`);
    return res.data;
  },

  recordProjectProgress: async (id: number | string, payload: any): Promise<ProjectProgressLog> => {
    const res = await fetchApi<ApiResponse<ProjectProgressLog>>(`/api/projects/${id}/progress`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getProjectDocuments: async (id: number | string): Promise<Document[]> => {
    const res = await fetchApi<ApiResponse<Document[]>>(`/api/projects/${id}/documents`);
    return res.data;
  },

  getProjectAlerts: async (id: number | string): Promise<RiskAlert[]> => {
    const res = await fetchApi<ApiResponse<RiskAlert[]>>(`/api/projects/${id}/alerts`);
    return res.data;
  },

  getAiAnalysis: async (id: number | string): Promise<AiAnalysisPreview> => {
    const res = await fetchApi<ApiResponse<AiAnalysisPreview>>(`/api/projects/${id}/ai-analysis`);
    return res.data;
  },
};
