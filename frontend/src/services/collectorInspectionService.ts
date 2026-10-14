import { fetchApi } from './api';
import {
  ApiResponse,
  PagedResponse,
  InspectionQueueItem,
  WeeklyInspectionSummary,
  AssignInspectionPayload,
  InspectionOutcomePayload
} from '@/types';

export const collectorInspectionService = {
  /**
   * Fetch prioritized inspection queue for the district
   */
  async getInspectionQueue(params?: {
    districtId?: number;
    page?: number;
    size?: number;
  }): Promise<PagedResponse<InspectionQueueItem>> {
    const query = new URLSearchParams();
    if (params?.districtId) query.set('districtId', params.districtId.toString());
    if (params?.page !== undefined) query.set('page', params.page.toString());
    if (params?.size !== undefined) query.set('size', params.size.toString());

    const res = await fetchApi<ApiResponse<PagedResponse<InspectionQueueItem>>>(
      `/api/collector/inspection-queue?${query.toString()}`
    );
    return res.data;
  },

  /**
   * Assign an on-site physical inspection to an officer
   */
  async assignInspection(payload: AssignInspectionPayload): Promise<InspectionQueueItem> {
    const res = await fetchApi<ApiResponse<InspectionQueueItem>>('/api/collector/assign-inspection', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Record certified findings and outcomes from on-site inspection
   */
  async recordInspectionOutcome(payload: InspectionOutcomePayload): Promise<InspectionQueueItem> {
    const res = await fetchApi<ApiResponse<InspectionQueueItem>>('/api/collector/inspection-outcome', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Retrieve weekly inspection throughput and compliance summary
   */
  async getWeeklySummary(districtId?: number): Promise<WeeklyInspectionSummary> {
    const query = districtId ? `?districtId=${districtId}` : '';
    const res = await fetchApi<ApiResponse<WeeklyInspectionSummary>>(`/api/collector/weekly-summary${query}`);
    return res.data;
  },
};
