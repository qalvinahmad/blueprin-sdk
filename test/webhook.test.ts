import { describe, it, expect } from 'vitest';
import {
  verifyWebhookSignature,
  createWebhookDigest,
  createWebhookSignature,
} from '../lib/src/webhook/index.js';

describe('Webhook Verifier & Signatures', () => {
  const secret = 'test-secret-key-12345';
  const rawBody = JSON.stringify({
    transaction: { status: 'SUCCESS', id: 'tx-123' },
    order: { invoice_number: 'INV-20260815-001', amount: 25000 },
  });

  it('generates consistent digest and signature', () => {
    const digest = createWebhookDigest(rawBody);
    expect(digest).toBeTruthy();
    expect(typeof digest).toBe('string');

    const signature = createWebhookSignature(secret, 'test-string-to-sign');
    expect(signature).toBeTruthy();
    expect(typeof signature).toBe('string');
  });

  it('validates direct HMAC-SHA256 signature correctly', () => {
    const signature = createWebhookSignature(secret, rawBody);

    const result = verifyWebhookSignature({
      rawBody,
      signature,
      secretKey: secret,
    });

    expect(result.isValid).toBe(true);
  });

  it('validates structured (DOKU / Blueprin) signature correctly', () => {
    const clientId = 'MALL-12345';
    const requestId = 'REQ-67890';
    const timestamp = new Date().toISOString();
    const requestTarget = '/api/webhooks/doku-api-payment';
    const digest = createWebhookDigest(rawBody);

    const stringToSign = [
      `Client-Id:${clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${timestamp}`,
      `Request-Target:${requestTarget}`,
      `Digest:${digest}`,
    ].join('\n');

    const signature = `HMACSHA256=${createWebhookSignature(secret, stringToSign)}`;

    const result = verifyWebhookSignature({
      rawBody,
      signature,
      secretKey: secret,
      clientId,
      requestId,
      timestamp,
      requestTarget,
      toleranceSeconds: 300,
    });

    expect(result.isValid).toBe(true);
  });

  it('rejects invalid or tampered signature', () => {
    const result = verifyWebhookSignature({
      rawBody,
      signature: 'invalid-signature-hash',
      secretKey: secret,
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toBe('Signature mismatch.');
  });

  it('rejects expired webhook timestamp (replay attack defense)', () => {
    const oldTimestamp = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
    const signature = createWebhookSignature(secret, rawBody);

    const result = verifyWebhookSignature({
      rawBody,
      signature,
      secretKey: secret,
      timestamp: oldTimestamp,
      toleranceSeconds: 300, // 5 min max
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain('Webhook timestamp expired');
  });
});
