import type { ApiPlan, ApiUsageStats, ApiResponse } from './types.js';

export class PlansClient {
  constructor(
    private requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>,
    private publicRequestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>
  ) {}

  /**
   * Get list of all available public API plans
   */
  async list(): Promise<ApiResponse<ApiPlan[]>> {
    return this.publicRequestFn<ApiPlan[]>('/api/public/plans');
  }

  /**
   * Get API usage statistics for current API key / user
   */
  async getUsage(params?: { days?: number; detail?: boolean }): Promise<ApiResponse<ApiUsageStats>> {
    return this.requestFn<ApiUsageStats>('/api/public/usage', params);
  }
}
