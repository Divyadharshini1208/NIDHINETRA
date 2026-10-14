import { fetchApi } from './api';
import { ApiResponse, SimulationEvaluatePayload, SimulationResult } from '@/types';

export const fundSimulationService = {
  /**
   * Evaluate hypothetical fund reallocation without modifying real budgets
   */
  async evaluateScenario(payload: SimulationEvaluatePayload): Promise<SimulationResult> {
    const res = await fetchApi<ApiResponse<SimulationResult>>('/api/simulations/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Save evaluated simulation scenario for administrative records and comparison
   */
  async saveScenario(payload: SimulationEvaluatePayload): Promise<SimulationResult> {
    const res = await fetchApi<ApiResponse<SimulationResult>>('/api/simulations/save', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Retrieve list of saved simulation scenarios
   */
  async getSavedScenarios(): Promise<SimulationResult[]> {
    const res = await fetchApi<ApiResponse<SimulationResult[]>>('/api/simulations');
    return res.data || [];
  },
};
