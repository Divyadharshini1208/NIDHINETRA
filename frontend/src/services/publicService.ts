import { fetchApi } from './api';
import { ApiResponse, InsightsSummary, State } from '@/types';

export const publicService = {
  async getInsightsSummary(): Promise<ApiResponse<InsightsSummary>> {
    return fetchApi<ApiResponse<InsightsSummary>>('/api/public/insights/summary');
  },

  async getStateInsights(): Promise<ApiResponse<any[]>> {
    return fetchApi<ApiResponse<any[]>>('/api/public/insights/states');
  },

  async getCategoryInsights(): Promise<ApiResponse<any[]>> {
    return fetchApi<ApiResponse<any[]>>('/api/public/insights/categories');
  },
};
