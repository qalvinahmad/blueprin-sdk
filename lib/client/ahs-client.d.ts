import type { AhsItem, ListAhsParams, ApiResponse } from './types.js';
export declare class AhsClient {
    private requestFn;
    constructor(requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>);
    /**
     * List or search AHS (Analisa Harga Satuan)
     */
    list(params?: ListAhsParams): Promise<ApiResponse<AhsItem[]>>;
    /**
     * Get single AHS item by ID with full components breakdown
     */
    getById(id: string): Promise<ApiResponse<AhsItem>>;
}
