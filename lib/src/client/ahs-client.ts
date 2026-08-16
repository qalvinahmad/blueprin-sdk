import type { AhsItem, ListAhsParams, ApiResponse } from './types.js';

export class AhsClient {
  constructor(private requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>) {}

  /**
   * List or search unit price analysis (AHS - Analisa Harga Satuan) items
   */
  async list(params?: ListAhsParams): Promise<ApiResponse<AhsItem[]>> {
    return this.requestFn<AhsItem[]>('/api/public/ahs', params);
  }

  /**
   * Get single unit price analysis item by ID with full components breakdown
   */
  async getById(id: string): Promise<ApiResponse<AhsItem>> {
    return this.requestFn<AhsItem>('/api/public/ahs', { id });
  }
}
