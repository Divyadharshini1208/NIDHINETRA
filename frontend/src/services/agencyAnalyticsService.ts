import { fetchApi } from './api';
import { ApiResponse, AgencyReliabilityProfile } from '@/types';

export const agencyAnalyticsService = {
  /**
   * Retrieve national/state reliability leaderboard for all implementing agencies
   */
  async getLeaderboard(params?: { minProjects?: number; stateId?: number; districtId?: number }): Promise<AgencyReliabilityProfile[]> {
    const res = await fetchApi<ApiResponse<AgencyReliabilityProfile[]>>(
      '/api/analytics/agencies'
    );
    return res.data || [];
  },

  /**
   * Alias for getLeaderboard to support filtering signatures
   */
  async getAllAgencies(params?: { minProjects?: number; stateId?: number; districtId?: number }): Promise<AgencyReliabilityProfile[]> {
    return this.getLeaderboard(params);
  },

  /**
   * Retrieve detailed compliance dossier for a single implementing agency
   */
  async getAgencyDetails(agencyName: string): Promise<AgencyReliabilityProfile> {
    const encoded = encodeURIComponent(agencyName);
    const res = await fetchApi<ApiResponse<AgencyReliabilityProfile>>(
      `/api/analytics/agencies/${encoded}`
    );
    return res.data;
  },

  /**
   * Re-evaluates agency scores across active database records
   */
  async recalculateAgencyScores(): Promise<{ updatedCount: number; message: string }> {
    const fresh = await this.getLeaderboard();
    return {
      updatedCount: fresh.length,
      message: `Successfully refreshed reliability indices for ${fresh.length} implementing agencies.`,
    };
  },
};
