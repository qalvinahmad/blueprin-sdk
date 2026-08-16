/**
 * Types for OpenRouter API Integration
 */
export interface OpenRouterClientOptions {
    apiKey: string;
    baseUrl?: string;
    timeoutMs?: number;
    maxRetries?: number;
    retryDelayMs?: number;
    siteName?: string;
    siteUrl?: string;
}
export interface CreditsResponse {
    totalCredits: number;
    totalUsage: number;
    balance: number;
}
export interface ActivityItem {
    date: string;
    model: string;
    endpoint_id: string;
    provider_name: string;
    usage: number;
    requests: number;
    prompt_tokens: number;
    completion_tokens: number;
    reasoning_tokens?: number;
}
export interface ModelPricing {
    prompt: number;
    completion: number;
    image: number;
}
export interface ModelTopProvider {
    max_completion_tokens: number;
}
export interface Model {
    id: string;
    name: string;
    description: string;
    pricing: ModelPricing;
    context_length: number;
    top_provider: ModelTopProvider;
}
export interface ImageModelArchitecture {
    input_modalities: string[];
    output_modalities: string[];
}
export interface ImageModel {
    id: string;
    name: string;
    architecture: ImageModelArchitecture;
}
export interface GenerationUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost: number;
}
export interface GenerationStats {
    id: string;
    model: string;
    usage: GenerationUsage;
}
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | ChatMessageContent[];
}
export interface ChatMessageContent {
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
        url: string;
    };
}
export interface ChatCompletionOptions {
    model?: string;
    messages: ChatMessage[];
    stream?: boolean;
    temperature?: number;
    max_tokens?: number;
    plugins?: string[];
    response_format?: {
        type: string;
    };
}
export interface ImageGenerationOptions {
    model?: string;
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    steps?: number;
    guidance?: number;
    seed?: number;
}
export interface EmbeddingOptions {
    model?: string;
    input: string | string[];
}
export interface EmbeddingData {
    embedding: number[];
    index: number;
}
export interface OpenRouterError {
    message: string;
    code?: number;
}
