import type { WebhookVerificationOptions, WebhookVerificationResult } from './types.js';

const encoder = new TextEncoder();

function toBase64(value: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  return toBase64(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

/**
 * Browser-safe asynchronous webhook verification using Web Crypto.
 * Use `verifyWebhookSignature` from the server entry when synchronous Node
 * verification is required.
 */
export async function verifyWebhookSignatureBrowser(
  options: WebhookVerificationOptions
): Promise<WebhookVerificationResult> {
  const { rawBody, signature, secretKey, timestamp, toleranceSeconds = 300 } = options;
  if (!rawBody || !signature || !secretKey) {
    return { isValid: false, reason: 'Missing required webhook parameters.' };
  }

  if (timestamp && toleranceSeconds > 0) {
    const parsed = isNaN(Number(timestamp))
      ? Date.parse(timestamp)
      : Number(timestamp) * (String(timestamp).length === 10 ? 1000 : 1);
    if (!isNaN(parsed) && Math.abs(Date.now() - parsed) / 1000 > toleranceSeconds) {
      return { isValid: false, reason: 'Webhook timestamp expired.' };
    }
  }

  const computed = await hmac(secretKey, rawBody);
  const normalized = signature.replace(/^HMACSHA256=/i, '').trim();
  return {
    isValid: computed === normalized,
    reason: computed === normalized ? undefined : 'Signature mismatch.',
  };
}

