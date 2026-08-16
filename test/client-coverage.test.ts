import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MaterialsClient } from '../lib/src/client/materials-client.ts';
import { PlansClient } from '../lib/src/client/plans-client.ts';
import { BlueprinClient } from '../lib/src/client/public-api-client.ts';
import {
  AuthenticationError,
  ScopePermissionError,
  NotFoundError,
  RateLimitError,
  BlueprinApiError,
} from '../lib/src/client/errors.ts';

describe('MaterialsClient & PlansClient', () => {
  it('calls MaterialsClient methods (getById, listLabor, listTools)', async () => {
    const mockRequest = vi.fn().mockResolvedValue({ success: true, data: [] });
    const client = new MaterialsClient(mockRequest);

    await client.getById('mat-123');
    expect(mockRequest).toHaveBeenCalledWith('/api/public/materials', { id: 'mat-123' });

    await client.listLabor({ search: 'tukang' });
    expect(mockRequest).toHaveBeenCalledWith('/api/public/materials', { search: 'tukang', kategori: 'UPAH' });

    await client.listTools({ search: 'molen' });
    expect(mockRequest).toHaveBeenCalledWith('/api/public/materials', { search: 'molen', kategori: 'ALAT' });
  });

  it('calls PlansClient methods (list, getUsage)', async () => {
    const mockReq = vi.fn().mockResolvedValue({ success: true, data: {} });
    const mockPublicReq = vi.fn().mockResolvedValue({ success: true, data: [] });
    const plansClient = new PlansClient(mockReq, mockPublicReq);

    await plansClient.list();
    expect(mockPublicReq).toHaveBeenCalledWith('/api/public/plans');

    await plansClient.getUsage({ days: 30, detail: true });
    expect(mockReq).toHaveBeenCalledWith('/api/public/usage', { days: 30, detail: true });
  });
});

describe('BlueprinClient Error and Retry handling', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('throws AuthenticationError on 401', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: 'API key is invalid' }),
    });

    const client = new BlueprinClient({ apiKey: 'invalid-key' });
    await expect(client.materials.list()).rejects.toThrow(AuthenticationError);
  });

  it('throws ScopePermissionError on 403', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers(),
      text: async () =>
        JSON.stringify({
          error: 'Scope required',
          required_scope: 'read:materials',
          available_scopes: ['read:projects'],
        }),
    });

    const client = new BlueprinClient({ apiKey: 'key' });
    await expect(client.materials.list()).rejects.toThrow(ScopePermissionError);
  });

  it('throws NotFoundError on 404', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: 'Not found' }),
    });

    const client = new BlueprinClient({ apiKey: 'key' });
    await expect(client.materials.getById('non-existent')).rejects.toThrow(NotFoundError);
  });

  it('handles 429 rate limit with retry and throws RateLimitError when retries exhausted', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'Retry-After': '0' }),
      text: async () => JSON.stringify({ error: 'Rate limit', limit_type: 'rpm', retry_after_ms: 10 }),
    });

    const client = new BlueprinClient({ apiKey: 'key', maxRetries: 1, retryDelayMs: 5 });
    await expect(client.materials.list()).rejects.toThrow(RateLimitError);
  });

  it('throws generic BlueprinApiError on 500', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      headers: new Headers(),
      text: async () => JSON.stringify({ error: 'Internal Error' }),
    });

    const client = new BlueprinClient({ apiKey: 'key', maxRetries: 0 });
    await expect(client.materials.list()).rejects.toThrow(BlueprinApiError);
  });
});
