import type { OpenRouterClientOptions, CreditsResponse, ActivityItem, Model, ImageModel, GenerationStats, ChatCompletionOptions, ImageGenerationOptions, EmbeddingOptions, EmbeddingData } from './types.js';
export declare class OpenRouterClient {
    private apiKey;
    private baseUrl;
    private timeoutMs;
    private maxRetries;
    private retryDelayMs;
    private siteName;
    private siteUrl;
    constructor(options: OpenRouterClientOptions);
    /**
     * Get user's credits/balance
     */
    getCredits(): Promise<CreditsResponse>;
    /**
     * Get user's activity/usage history
     */
    getActivity(options?: {
        date?: string;
        limit?: number;
    }): Promise<ActivityItem[]>;
    /**
     * Get available models
     */
    getModels(options?: {
        offset?: number;
        limit?: number;
    }): Promise<Model[]>;
    /**
     * Get image generation models
     */
    getImageModels(): Promise<ImageModel[]>;
    /**
     * Get generation stats by ID
     */
    getGenerationStats(generationId: string): Promise<GenerationStats>;
    /**
     * Chat completions - unified text/LLM endpoint
     */
    chatCompletion(options: ChatCompletionOptions): Promise<any>;
    /**
     * Generate image
     */
    generateImage(options: ImageGenerationOptions): Promise<any>;
    /**
     * Generate embeddings
     */
    generateEmbeddings(options: EmbeddingOptions): Promise<EmbeddingData[]>;
    /**
     * Test if API key is valid
     */
    testApiKey(): Promise<{
        valid: boolean;
        credits?: number;
        usage?: number;
        error?: string;
    }>;
    /**
     * Format cost for display
     */
    static formatCost(amount: number): string;
    /**
     * Format tokens for display
     */
    static formatTokens(tokens: number): string;
    private request;
    private fetchWithRetry;
}
