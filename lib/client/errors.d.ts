/**
 * Custom error classes for Blueprin API Client
 */
export declare class BlueprinApiError extends Error {
    statusCode?: number;
    details?: any;
    limitType?: string;
    retryAfterMs?: number;
    constructor(message: string, options?: {
        statusCode?: number;
        details?: any;
        limitType?: string;
        retryAfterMs?: number;
    });
}
export declare class AuthenticationError extends BlueprinApiError {
    constructor(message?: string);
}
export declare class ScopePermissionError extends BlueprinApiError {
    requiredScope?: string;
    availableScopes?: string[];
    constructor(message: string, requiredScope?: string, availableScopes?: string[]);
}
export declare class RateLimitError extends BlueprinApiError {
    constructor(message?: string, options?: {
        limitType?: string;
        retryAfterMs?: number;
    });
}
export declare class NotFoundError extends BlueprinApiError {
    constructor(message?: string);
}
