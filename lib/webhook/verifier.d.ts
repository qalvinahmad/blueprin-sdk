import type { WebhookVerificationOptions, WebhookVerificationResult } from './types.js';
/**
 * Creates SHA-256 digest in base64 format.
 */
export declare function createWebhookDigest(bodyString: string, withPrefix?: boolean): string;
/**
 * Creates HMAC-SHA256 signature from secret and payload string.
 */
export declare function createWebhookSignature(secretKey: string, stringToSign: string): string;
/**
 * Verify an incoming webhook signature securely with timing-safe comparison
 * and timestamp expiration checks to prevent replay attacks.
 */
export declare function verifyWebhookSignature(options: WebhookVerificationOptions): WebhookVerificationResult;
