import { fetchApi } from './api';
import { ApiResponse, State, District, Constituency } from '@/types';

export const locationService = {
  async getStates(): Promise<ApiResponse<State[]>> {
    return fetchApi<ApiResponse<State[]>>('/api/locations/states');
  },

  async getDistrictsByState(stateId: number): Promise<ApiResponse<District[]>> {
    return fetchApi<ApiResponse<District[]>>(`/api/locations/states/${stateId}/districts`);
  },

  async getConstituenciesByDistrict(districtId: number): Promise<ApiResponse<Constituency[]>> {
    return fetchApi<ApiResponse<Constituency[]>>(`/api/locations/districts/${districtId}/constituencies`);
  },
};
