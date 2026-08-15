import type { AhsItem, ListAhsParams, ApiResponse } from './types.js';

export class AhsClient {
  constructor(private requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>) {}

  /**
   * List or search AHS (Analisa Harga Satuan)
   */
  async list(params?: ListAhsParams): Promise<ApiResponse<AhsItem[]>> {
    return this.requestFn<AhsItem[]>('/api/public/ahs', params);
  }

  /**
   * Get single AHS item by ID with full components breakdown
   */
  async getById(id: string): Promise<ApiResponse<AhsItem>> {
    return this.requestFn<AhsItem>('/api/public/ahs', { id });
  }
}
