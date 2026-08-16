import type {
  OpenRouterClientOptions,
  CreditsResponse,
  ActivityItem,
  Model,
  ImageModel,
  GenerationStats,
  ChatCompletionOptions,
  ImageGenerationOptions,
  EmbeddingOptions,
  EmbeddingData,
} from './types.js';

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;
  private maxRetries: number;
  private retryDelayMs: number;
  private siteName: string;
  private siteUrl: string;

  constructor(options: OpenRouterClientOptions) {
    if (!options?.apiKey) {
      throw new Error('OpenRouter API key must be provided');
    }

    this.apiKey = options.apiKey.trim();
    this.baseUrl = (options.baseUrl || OPENROUTER_API_BASE).replace(/\/+$/, '');
    this.timeoutMs = options.timeoutMs || 30000;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 1000;
    this.siteName = options.siteName || 'Blueprin';
    this.siteUrl = options.siteUrl || 'https://blueprin.app';
  }

  /**
   * Get user's credits/balance
   */
  async getCredits(): Promise<CreditsResponse> {
    const data = await this.request<{ data: { total_credits: number; total_usage: number } }>('/credits');
    return {
      totalCredits: data.data?.total_credits || 0,
      totalUsage: data.data?.total_usage || 0,
      balance: (data.data?.total_credits || 0) - (data.data?.total_usage || 0),
    };
  }

  /**
   * Get user's activity/usage history
   */
  async getActivity(options: { date?: string; limit?: number } = {}): Promise<ActivityItem[]> {
    const { date } = options;
    const params = new URLSearchParams();
    if (date) params.append('date', date);

    const data = await this.request<{ data: ActivityItem[] }>(`/activity?${params}`);
    return data.data || [];
  }

  /**
   * Get available models
   */
  async getModels(options: { offset?: number; limit?: number } = {}): Promise<Model[]> {
    const { offset = 0, limit = 500 } = options;
    const params = new URLSearchParams({
      offset: offset.toString(),
      limit: limit.toString(),
    });

    const data = await this.request<{ data: Model[] }>(`/models?${params}`);
    return data.data || [];
  }

  /**
   * Get image generation models
   */
  async getImageModels(): Promise<ImageModel[]> {
    const data = await this.request<{ data: ImageModel[] }>('/images/models');
    return data.data || [];
  }

  /**
   * Get generation stats by ID
   */
  async getGenerationStats(generationId: string): Promise<GenerationStats> {
    const data = await this.request<{ data: GenerationStats }>(`/generation?id=${generationId}`);
    return data.data;
  }

  /**
   * Chat completions - unified text/LLM endpoint
   */
  async chatCompletion(options: ChatCompletionOptions): Promise<any> {
    const {
      model = 'openai/gpt-4.1-mini',
      messages,
      stream = false,
      temperature = 0.7,
      max_tokens = 4096,
      plugins = [],
      response_format,
    } = options;

    const body: Record<string, any> = {
      model,
      messages,
      stream,
      temperature,
      max_tokens,
      plugins,
    };

    if (response_format) {
      body.response_format = response_format;
    }

    const response = await this.fetchWithRetry('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    return response;
  }

  /**
   * Generate image
   */
  async generateImage(options: ImageGenerationOptions): Promise<any> {
    const {
      model = 'black-forest-labs/flux-schnell',
      prompt,
      negative_prompt,
      width = 1024,
      height = 768,
      steps,
      guidance,
      seed,
    } = options;

    const body: Record<string, any> = {
      model,
      prompt,
      width,
      height,
    };

    if (negative_prompt) body.negative_prompt = negative_prompt;
    if (steps) body.steps = steps;
    if (guidance) body.guidance = guidance;
    if (seed) body.seed = seed;

    const data = await this.request<{ data: Array<{ url?: string; b64_json?: string }> }>(
      '/images/generations',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );

    return data.data?.[0];
  }

  /**
   * Generate embeddings
   */
  async generateEmbeddings(options: EmbeddingOptions): Promise<EmbeddingData[]> {
    const {
      model = 'openai/text-embedding-3-small',
      input,
    } = options;

    const inputs = Array.isArray(input) ? input : [input];

    const data = await this.request<{ data: EmbeddingData[] }>('/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model,
        input: inputs,
      }),
    });

    return data.data || [];
  }

  /**
   * Test if API key is valid
   */
  async testApiKey(): Promise<{ valid: boolean; credits?: number; usage?: number; error?: string }> {
    try {
      const result = await this.getCredits();
      return {
        valid: true,
        credits: result.totalCredits,
        usage: result.totalUsage,
      };
    } catch (error: any) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Format cost for display
   */
  static formatCost(amount: number): string {
    if (amount < 0.01) {
      return `$${(amount * 1000).toFixed(2)}K`;
    }
    return `$${amount.toFixed(2)}`;
  }

  /**
   * Format tokens for display
   */
  static formatTokens(tokens: number): string {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  }

  private async request<T>(
    endpoint: string,
    options: { method?: string; body?: string } = {}
  ): Promise<T> {
    const { method = 'GET', body } = options;
    const response = await this.fetchWithRetry(endpoint, { method, body });
    return response as T;
  }

  private async fetchWithRetry(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= this.maxRetries) {
      try {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

        const headers: Record<string, string> = {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url, {
          ...options,
          headers: { ...headers, ...options.headers },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        let body: any;
        const text = await response.text();
        try {
          body = text ? JSON.parse(text) : {};
        } catch {
          body = { error: text || 'Unknown response' };
        }

        if (response.ok) {
          return body;
        }

        if (response.status === 401) {
          throw new Error('Invalid API key');
        }

        if (response.status === 429) {
          const retryAfterSec = response.headers.get('Retry-After');
          const retryAfterMs = retryAfterSec ? parseInt(retryAfterSec, 10) * 1000 : 1000;

          if (attempt < this.maxRetries) {
            await new Promise((r) => setTimeout(r, retryAfterMs));
            attempt++;
            continue;
          }

          throw new Error('Rate limit exceeded');
        }

        throw new Error(body.error?.message || `HTTP error ${response.status}`);
      } catch (err: any) {
        lastError = err;

        if (err.message === 'Invalid API key') {
          throw err;
        }

        if (attempt < this.maxRetries) {
          const backoff = this.retryDelayMs * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, backoff));
          attempt++;
        } else {
          break;
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }
}
