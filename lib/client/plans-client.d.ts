import type { ApiPlan, ApiUsageStats, ApiResponse } from './types.js';
export declare class PlansClient {
    private requestFn;
    private publicRequestFn;
    constructor(requestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>, publicRequestFn: <T>(endpoint: string, params?: Record<string, any>) => Promise<ApiResponse<T>>);
    /**
     * Get list of all available public API plans
     */
    list(): Promise<ApiResponse<ApiPlan[]>>;
    /**
     * Get API usage statistics for current API key / user
     */
    getUsage(params?: {
        days?: number;
        detail?: boolean;
    }): Promise<ApiResponse<ApiUsageStats>>;
}
