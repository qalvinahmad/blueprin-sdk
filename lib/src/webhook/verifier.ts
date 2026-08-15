import { createHash, createHmac, timingSafeEqual } from 'crypto';
import type { WebhookVerificationOptions, WebhookVerificationResult } from './types.js';

function timingSafeEqualText(left: string, right: string): boolean {
  if (typeof left !== 'string' || typeof right !== 'string') {
    return false;
  }

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

/**
 * Creates SHA-256 digest in base64 format.
 */
export function createWebhookDigest(bodyString: string, withPrefix = false): string {
  const digest = createHash('sha256').update(bodyString, 'utf8').digest('base64');
  return withPrefix ? `SHA-256=${digest}` : digest;
}

/**
 * Creates HMAC-SHA256 signature from secret and payload string.
 */
export function createWebhookSignature(secretKey: string, stringToSign: string): string {
  return createHmac('sha256', secretKey).update(stringToSign, 'utf8').digest('base64');
}

/**
 * Verify an incoming webhook signature securely with timing-safe comparison
 * and timestamp expiration checks to prevent replay attacks.
 */
export function verifyWebhookSignature(options: WebhookVerificationOptions): WebhookVerificationResult {
  const {
    rawBody,
    signature: incomingSignature,
    secretKey,
    timestamp,
    clientId,
    requestId,
    requestTarget,
    toleranceSeconds = 300,
  } = options;

  if (!rawBody || !incomingSignature || !secretKey) {
    return {
      isValid: false,
      reason: 'Missing required parameters (rawBody, signature, or secretKey).',
    };
  }

  // 1. Replay attack defense: validate timestamp tolerance
  if (timestamp && toleranceSeconds > 0) {
    const parsedTime = isNaN(Number(timestamp)) ? Date.parse(timestamp) : Number(timestamp) * (String(timestamp).length === 10 ? 1000 : 1);
    if (!isNaN(parsedTime)) {
      const now = Date.now();
      const diffSeconds = Math.abs(now - parsedTime) / 1000;
      if (diffSeconds > toleranceSeconds) {
        return {
          isValid: false,
          reason: `Webhook timestamp expired (${Math.round(diffSeconds)}s skew, max allowed: ${toleranceSeconds}s).`,
        };
      }
    }
  }

  // 2. Structured signature verification (DOKU & Blueprin Standard format)
  if (clientId && requestId && timestamp && requestTarget) {
    const digest = createWebhookDigest(rawBody);
    const prefixedDigest = createWebhookDigest(rawBody, true);

    const stringToSign = [
      `Client-Id:${clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${timestamp}`,
      `Request-Target:${requestTarget}`,
      `Digest:${digest}`,
    ].join('\n');

    const stringToSignPrefixed = [
      `Client-Id:${clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${timestamp}`,
      `Request-Target:${requestTarget}`,
      `Digest:${prefixedDigest}`,
    ].join('\n');

    const computed = `HMACSHA256=${createWebhookSignature(secretKey, stringToSign)}`;
    const computedPrefixed = `HMACSHA256=${createWebhookSignature(secretKey, stringToSignPrefixed)}`;

    const isValid =
      timingSafeEqualText(computed, incomingSignature) ||
      timingSafeEqualText(computedPrefixed, incomingSignature);

    return {
      isValid,
      reason: isValid ? undefined : 'Signature mismatch.',
    };
  }

  // 3. Simple HMAC-SHA256 verification (Direct payload signing)
  const directSignature = createWebhookSignature(secretKey, rawBody);
  const directHexSignature = createHmac('sha256', secretKey).update(rawBody, 'utf8').digest('hex');

  const cleanIncoming = incomingSignature.replace(/^sha256=|^HMACSHA256=/i, '').trim();

  const isValidDirect =
    timingSafeEqualText(directSignature, cleanIncoming) ||
    timingSafeEqualText(directHexSignature, cleanIncoming) ||
    timingSafeEqualText(`HMACSHA256=${directSignature}`, incomingSignature) ||
    timingSafeEqualText(`sha256=${directHexSignature}`, incomingSignature);

  return {
    isValid: isValidDirect,
    reason: isValidDirect ? undefined : 'Signature mismatch.',
  };
}
