/**
 * Custom error classes for Blueprin API Client
 */

export class BlueprinApiError extends Error {
  public statusCode?: number;
  public details?: any;
  public limitType?: string;
  public retryAfterMs?: number;

  constructor(message: string, options?: { statusCode?: number; details?: any; limitType?: string; retryAfterMs?: number }) {
    super(message);
    this.name = 'BlueprinApiError';
    this.statusCode = options?.statusCode;
    this.details = options?.details;
    this.limitType = options?.limitType;
    this.retryAfterMs = options?.retryAfterMs;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends BlueprinApiError {
  constructor(message = 'API key invalid or missing') {
    super(message, { statusCode: 401 });
    this.name = 'AuthenticationError';
  }
}

export class ScopePermissionError extends BlueprinApiError {
  public requiredScope?: string;
  public availableScopes?: string[];

  constructor(message: string, requiredScope?: string, availableScopes?: string[]) {
    super(message, { statusCode: 403 });
    this.name = 'ScopePermissionError';
    this.requiredScope = requiredScope;
    this.availableScopes = availableScopes;
  }
}

export class RateLimitError extends BlueprinApiError {
  constructor(message = 'Rate limit exceeded', options?: { limitType?: string; retryAfterMs?: number }) {
    super(message, { statusCode: 429, limitType: options?.limitType, retryAfterMs: options?.retryAfterMs });
    this.name = 'RateLimitError';
  }
}

export class NotFoundError extends BlueprinApiError {
  constructor(message = 'Resource not found') {
    super(message, { statusCode: 404 });
    this.name = 'NotFoundError';
  }
}
