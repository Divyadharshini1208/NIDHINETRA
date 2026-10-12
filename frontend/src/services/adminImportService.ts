import { fetchApi } from './api';
import { ApiResponse, DataImportResult, DataImportRecord } from '@/types';

export const adminImportService = {
  validateRawCsv: async (fileName: string, csvContent: string): Promise<DataImportResult> => {
    const res = await fetchApi<ApiResponse<DataImportResult>>('/api/admin/import/validate-raw', {
      method: 'POST',
      body: JSON.stringify({ fileName, csvContent }),
    });
    return res.data;
  },

  confirmImport: async (batchId: string, validRows: any[]): Promise<DataImportResult> => {
    const res = await fetchApi<ApiResponse<DataImportResult>>('/api/admin/import/confirm', {
      method: 'POST',
      body: JSON.stringify({ batchId, validRows }),
    });
    return res.data;
  },

  getHistory: async (): Promise<DataImportRecord[]> => {
    const res = await fetchApi<ApiResponse<DataImportRecord[]>>('/api/admin/import/history');
    return res.data;
  },
};
