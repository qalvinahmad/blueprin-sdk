import type { BlueprinClientOptions, ApiResponse } from './types.js';
import { AhsClient } from './ahs-client.js';
import { MaterialsClient } from './materials-client.js';
import { RabClient } from './rab-client.js';
import { PlansClient } from './plans-client.js';
export declare class BlueprinClient {
    private apiKey;
    private baseUrl;
    private timeoutMs;
    private maxRetries;
    private retryDelayMs;
    ahs: AhsClient;
    materials: MaterialsClient;
    rab: RabClient;
    plans: PlansClient;
    constructor(options: BlueprinClientOptions);
    /**
     * Authenticated request with retry mechanism & error handling
     */
    request<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    /**
     * Public request (without API key)
     */
    publicRequest<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
    private executeWithRetry;
}
