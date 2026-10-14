import { fetchApi } from './api';
import { ApiResponse, PhotoVerificationRecord } from '@/types';

export const photoVerificationService = {
  /**
   * Upload an on-site photo and perform automated geofence & duplicate verification
   */
  async verifyProjectPhoto(
    projectId: number,
    file?: File,
    latitude?: number,
    longitude?: number
  ): Promise<PhotoVerificationRecord> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    if (latitude !== undefined && latitude !== null) {
      formData.append('latitude', latitude.toString());
    }
    if (longitude !== undefined && longitude !== null) {
      formData.append('longitude', longitude.toString());
    }

    const res = await fetchApi<ApiResponse<PhotoVerificationRecord>>(
      `/api/projects/${projectId}/verify-photo`,
      {
        method: 'POST',
        body: formData,
      }
    );
    return res.data;
  },

  /**
   * Retrieve historical photo verification records for a specific project
   */
  async getProjectPhotoVerifications(projectId: number): Promise<PhotoVerificationRecord[]> {
    const res = await fetchApi<ApiResponse<PhotoVerificationRecord[]>>(
      `/api/projects/${projectId}/photo-verifications`
    );
    return res.data || [];
  },
};
