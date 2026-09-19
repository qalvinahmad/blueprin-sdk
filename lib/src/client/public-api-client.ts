import {
  BlueprinApiError,
  AuthenticationError,
  ScopePermissionError,
  RateLimitError,
  NotFoundError,
} from './errors.js';
import type { BlueprinClientOptions, ApiResponse } from './types.js';
import { AhsClient } from './ahs-client.js';
import { MaterialsClient } from './materials-client.js';
import { RabClient } from './rab-client.js';
import { PlansClient } from './plans-client.js';

export class BlueprinClient {
  private apiKey?: string;
  private authToken?: string;
  private tokenProvider?: BlueprinClientOptions['tokenProvider'];
  private baseUrl: string;
  private timeoutMs: number;
  private maxRetries: number;
  private retryDelayMs: number;

  public ahs: AhsClient;
  public materials: MaterialsClient;
  public rab: RabClient;
  public plans: PlansClient;

  constructor(options: BlueprinClientOptions) {
    if (!options?.apiKey && !options?.authToken && !options?.tokenProvider) {
      throw new AuthenticationError('An authToken, tokenProvider, or API key must be provided to instantiate BlueprinClient.');
    }

    const isBrowserOrReactNative =
      typeof window !== 'undefined' ||
      typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
    if (isBrowserOrReactNative && options.apiKey && !options.allowBrowserApiKey) {
      throw new AuthenticationError(
        'Browser API keys are disabled. Use authToken/tokenProvider, or explicitly set allowBrowserApiKey for a public scoped key.'
      );
    }
    this.apiKey = options.apiKey?.trim();
    this.authToken = options.authToken?.trim();
    this.tokenProvider = options.tokenProvider;
    this.baseUrl = (options.baseUrl || 'https://blueprin-app.vercel.app').replace(/\/+$/, '');
    if (isBrowserOrReactNative && !/^https:\/\/|^http:\/\/localhost(?::\d+)?\//.test(`${this.baseUrl}/`)) {
      throw new Error('Browser API baseUrl must use HTTPS, except for localhost development.');
    }
    this.timeoutMs = options.timeoutMs || 15000;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 1000;

    const boundRequest = this.request.bind(this);
    const boundPublicRequest = this.publicRequest.bind(this);

    this.ahs = new AhsClient(boundRequest);
    this.materials = new MaterialsClient(boundRequest);
    this.rab = new RabClient(boundRequest);
    this.plans = new PlansClient(boundRequest, boundPublicRequest);
  }

  /**
   * Authenticated request with retry mechanism & error handling
   */
  public async request<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>(endpoint, params, true);
  }

  /**
   * Public request (without API key)
   */
  public async publicRequest<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>(endpoint, params, false);
  }

  private async executeWithRetry<T>(
    endpoint: string,
    params: Record<string, any> | undefined,
    authenticated: boolean
  ): Promise<ApiResponse<T>> {
    let attempt = 0;
    let lastError: any = null;

    while (attempt <= this.maxRetries) {
      try {
        const url = new URL(`${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              url.searchParams.append(key, String(value));
            }
          });
        }

        const headers: Record<string, string> = {
          Accept: 'application/json',
        };

        const token = this.tokenProvider ? await this.tokenProvider() : this.authToken;
        if (authenticated && token) {
          headers.Authorization = `Bearer ${token}`;
        } else if (authenticated && this.apiKey) {
          headers['X-API-Key'] = this.apiKey;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Parse JSON response
        let body: any;
        const text = await response.text();
        try {
          body = text ? JSON.parse(text) : {};
        } catch {
          body = { error: text || 'Unknown response' };
        }

        if (response.ok && body.success !== false) {
          return body as ApiResponse<T>;
        }

        // Handle specific error codes
        if (response.status === 401) {
          throw new AuthenticationError(body.error || 'Unauthorized: API Key invalid');
        }

        if (response.status === 403) {
          throw new ScopePermissionError(
            body.error || 'Forbidden: Insufficient scope',
            body.required_scope,
            body.available_scopes
          );
        }

        if (response.status === 404) {
          throw new NotFoundError(body.error || 'Resource not found');
        }

        if (response.status === 429) {
          const retryAfterSec = response.headers.get('Retry-After');
          const retryAfterMs = retryAfterSec ? parseInt(retryAfterSec, 10) * 1000 : body.retry_after_ms || 1000;
          
          if (attempt < this.maxRetries) {
            await new Promise((r) => setTimeout(r, retryAfterMs));
            attempt++;
            continue;
          }

          throw new RateLimitError(body.error || 'Rate limit exceeded', {
            limitType: body.limit_type,
            retryAfterMs,
          });
        }

        throw new BlueprinApiError(body.error || `HTTP error ${response.status}`, {
          statusCode: response.status,
          details: body,
        });
      } catch (err: any) {
        lastError = err;
        
        // Don't retry auth or scope errors
        if (err instanceof AuthenticationError || err instanceof ScopePermissionError || err instanceof NotFoundError) {
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

    throw lastError || new BlueprinApiError('Request failed after retries');
  }
}
