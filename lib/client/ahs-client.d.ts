import type { AhsItem, ListAhsParams, ApiResponse } from './types.js';
export declare class AhsClient {
    private requestFn;
    constructor(requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>);
    /**
     * List or search unit price analysis (AHS - Analisa Harga Satuan) items
     */
    list(params?: ListAhsParams): Promise<ApiResponse<AhsItem[]>>;
    /**
     * Get single unit price analysis item by ID with full components breakdown
     */
    getById(id: string): Promise<ApiResponse<AhsItem>>;
}
