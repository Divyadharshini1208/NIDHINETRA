import { fetchApi } from './api';
import { ApiResponse, ReportPreview } from '@/types';

export interface ReportFilterParams {
  reportType?: string;
  stateId?: number;
  districtId?: number;
  fromDate?: string;
  toDate?: string;
}

export const reportService = {
  getPreview: async (params: ReportFilterParams = {}): Promise<ReportPreview> => {
    const query = new URLSearchParams();
    if (params.reportType) query.set('reportType', params.reportType);
    if (params.stateId) query.set('stateId', params.stateId.toString());
    if (params.districtId) query.set('districtId', params.districtId.toString());
    if (params.fromDate) query.set('fromDate', params.fromDate);
    if (params.toDate) query.set('toDate', params.toDate);

    const res = await fetchApi<ApiResponse<ReportPreview>>(`/api/reports/preview?${query.toString()}`);
    return res.data;
  },
};
