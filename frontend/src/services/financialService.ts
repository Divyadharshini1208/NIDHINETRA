import { fetchApi } from './api';
import { ApiResponse, FinancialSummary, Sanction, FundRelease, Expenditure, Payment } from '@/types';

export const financialService = {
  getSummary: async (): Promise<FinancialSummary> => {
    const res = await fetchApi<ApiResponse<FinancialSummary>>('/api/financials/summary');
    return res.data;
  },

  createSanction: async (payload: Partial<Sanction>): Promise<Sanction> => {
    const res = await fetchApi<ApiResponse<Sanction>>('/api/financials/sanctions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getSanctions: async (projectId: number | string): Promise<Sanction[]> => {
    const res = await fetchApi<ApiResponse<Sanction[]>>(`/api/financials/sanctions/${projectId}`);
    return res.data;
  },

  createFundRelease: async (payload: Partial<FundRelease>): Promise<FundRelease> => {
    const res = await fetchApi<ApiResponse<FundRelease>>('/api/financials/fund-releases', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getFundReleases: async (projectId: number | string): Promise<FundRelease[]> => {
    const res = await fetchApi<ApiResponse<FundRelease[]>>(`/api/financials/fund-releases/${projectId}`);
    return res.data;
  },

  createExpenditure: async (payload: Partial<Expenditure>): Promise<Expenditure> => {
    const res = await fetchApi<ApiResponse<Expenditure>>('/api/financials/expenditures', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getExpenditures: async (projectId: number | string): Promise<Expenditure[]> => {
    const res = await fetchApi<ApiResponse<Expenditure[]>>(`/api/financials/expenditures/${projectId}`);
    return res.data;
  },

  createPayment: async (payload: Partial<Payment>): Promise<Payment> => {
    const res = await fetchApi<ApiResponse<Payment>>('/api/financials/payments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  getPayments: async (projectId: number | string): Promise<Payment[]> => {
    const res = await fetchApi<ApiResponse<Payment[]>>(`/api/financials/payments/${projectId}`);
    return res.data;
  },
};
