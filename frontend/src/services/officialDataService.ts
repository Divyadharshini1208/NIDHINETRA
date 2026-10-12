import { fetchApi } from './api';
import { ApiResponse, OfficialMpladsData } from '@/types';

export const officialDataService = {
  /**
   * Fetch live official MPLADS macro telemetry directly from MoSPI eSAKSHI integration
   */
  async getOfficialSummary(): Promise<OfficialMpladsData> {
    try {
      const res = await fetchApi<ApiResponse<OfficialMpladsData>>('/api/public/official-data/summary');
      if (res && res.data) {
        return res.data;
      }
      return this.getFallbackOfficialData();
    } catch (e) {
      console.warn('Official MoSPI API live fetch fallback triggered:', e);
      return this.getFallbackOfficialData();
    }
  },

  /**
   * Force refresh telemetry from official MoSPI portal
   */
  async syncOfficialData(): Promise<OfficialMpladsData> {
    const res = await fetchApi<ApiResponse<OfficialMpladsData>>('/api/public/official-data/sync', {
      method: 'POST',
    });
    return res.data || this.getFallbackOfficialData();
  },

  /**
   * Verified static fallback snapshot from mplads.mospi.gov.in
   */
  getFallbackOfficialData(): OfficialMpladsData {
    return {
      isLiveFetched: false,
      sourcePortalUrl: 'https://mplads.mospi.gov.in/digigov/dashboard.html',
      sourceName: 'Ministry of Statistics & Programme Implementation (MoSPI)',
      currentTenure: '18th Lok Sabha',
      statutoryNotice: 'Official Government Scheme Data verified against eSAKSHI Central Server (mplads.mospi.gov.in).',
      allocatedLimitCr: '₹ 8,355.68 Crore',
      allocatedLimitRaw: '₹ 83,55,67,64,690.30',
      worksRecommendedCount: 111967,
      worksRecommendedCr: '₹ 5,967.42 Crore',
      worksRecommendedRaw: '₹ 59,67,42,28,359.08',
      worksSanctionedCount: 83148,
      worksSanctionedCr: '₹ 4,392.05 Crore',
      worksSanctionedRaw: '₹ 43,92,05,02,351.91',
      worksCompletedCount: 36435,
      worksCompletedCr: '₹ 1,796.33 Crore',
      worksCompletedRaw: '₹ 17,96,33,03,283.73',
      expenditureOngoingCompletedCr: '₹ 2,918.90 Crore',
      expenditureOngoingCompletedRaw: '₹ 29,18,90,27,082.45',
      calamityWorksCount: 12,
      calamityAmountCr: '₹ 4.06 Crore',
    };
  },
};
