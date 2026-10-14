import { fetchApi } from './api';
import { ApiResponse, AiAnalysisPreview, AiMonitoringSummary } from '@/types';

export const aiMonitoringService = {
  getMonitoringSummary: async (): Promise<AiMonitoringSummary> => {
    const res = await fetchApi<ApiResponse<AiMonitoringSummary>>('/api/ai/monitoring-summary');
    return res.data;
  },

  analyzeProject: async (projectId: number | string): Promise<AiAnalysisPreview> => {
    const res = await fetchApi<ApiResponse<AiAnalysisPreview>>(`/api/ai/analyze-project/${projectId}`, {
      method: 'POST',
    });
    return res.data;
  },

  detectDuplicates: async (projectId: number | string): Promise<any> => {
    const res = await fetchApi<ApiResponse<any>>(`/api/ai/detect-duplicates/${projectId}`, {
      method: 'POST',
    });
    return res.data;
  },

  getAiHealth: async (): Promise<{ aiServiceConnected: boolean; engine: string; mode: string }> => {
    const res = await fetchApi<ApiResponse<{ aiServiceConnected: boolean; engine: string; mode: string }>>('/api/ai/health');
    return res.data;
  },

  querySchemeAnalytics: async (query: string): Promise<any> => {
    const res = await fetchApi<ApiResponse<any>>('/api/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return res.data;
  },

  getModelsStatus: async (): Promise<any> => {
    const res = await fetchApi<ApiResponse<any>>('/api/ai/models/status');
    return res.data;
  },

  compareModels: async (): Promise<any> => {
    const res = await fetchApi<ApiResponse<any>>('/api/ai/models/compare');
    return res.data;
  },

  analyzePyTorch: async (projectId: number | string): Promise<any> => {
    const res = await fetchApi<ApiResponse<any>>(`/api/ai/analyze-pytorch/${projectId}`, {
      method: 'POST',
    });
    return res.data;
  },
};
