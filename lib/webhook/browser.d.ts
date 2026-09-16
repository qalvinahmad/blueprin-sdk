import type { WebhookVerificationOptions, WebhookVerificationResult } from './types.js';
/**
 * Browser-safe asynchronous webhook verification using Web Crypto.
 * Use `verifyWebhookSignature` from the server entry when synchronous Node
 * verification is required.
 */
export declare function verifyWebhookSignatureBrowser(options: WebhookVerificationOptions): Promise<WebhookVerificationResult>;
