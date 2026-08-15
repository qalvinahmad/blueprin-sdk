/**
 * Webhook event and verification types
 */

export interface WebhookVerificationOptions {
  /**
   * The raw HTTP request body string (unparsed JSON)
   */
  rawBody: string;
  /**
   * The incoming signature header
   */
  signature: string;
  /**
   * Webhook secret key
   */
  secretKey: string;
  /**
   * Timestamp from request headers (ISO string or unix timestamp)
   */
  timestamp?: string;
  /**
   * Client ID if required
   */
  clientId?: string;
  /**
   * Request ID if required
   */
  requestId?: string;
  /**
   * Request target / path (e.g. /api/webhooks/doku-api-payment)
   */
  requestTarget?: string;
  /**
   * Maximum allowed age of the request in seconds to prevent replay attacks.
   * Default: 300 (5 minutes). Set to 0 to disable.
   */
  toleranceSeconds?: number;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  reason?: string;
}

export type WebhookEventType =
  | 'payment.success'
  | 'payment.failed'
  | 'payment.expired'
  | 'plan.activated'
  | 'plan.expired'
  | 'project.synced'
  | 'rab.exported';

export interface WebhookPayload<T = any> {
  id: string;
  event: WebhookEventType;
  created_at: string;
  data: T;
}
