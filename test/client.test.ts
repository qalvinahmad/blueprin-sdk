import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BlueprinClient,
  AuthenticationError,
  ScopePermissionError,
  RateLimitError,
  NotFoundError,
  BlueprinApiError,
} from '../lib/src/client/index.js';

describe('BlueprinClient & Public API Subclients', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('throws AuthenticationError when initialized without apiKey', () => {
    expect(() => new BlueprinClient({ apiKey: '' })).toThrow(AuthenticationError);
  });

  it('correctly executes ahs.list and sends X-API-Key header', async () => {
    const mockData = {
      success: true,
      data: [{ id: 'ahs-1', kode: 'AHS-01', nama: 'Pasangan Bata', total_harga: 450000 }],
      pagination: { total: 1, limit: 10, offset: 0, has_more: false },
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockData),
    });

    const client = new BlueprinClient({ apiKey: 'bpak_test123456789' });
    const result = await client.ahs.list({ kelompok: 'pasangan', limit: 10 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (globalThis.fetch as any).mock.calls[0][0];
    const calledOpts = (globalThis.fetch as any).mock.calls[0][1];

    expect(calledUrl).toContain('/api/public/ahs?kelompok=pasangan&limit=10');
    expect(calledOpts.headers['X-API-Key']).toBe('bpak_test123456789');
    expect(result.data[0].kode).toBe('AHS-01');
  });

  it('handles 401 Unauthorized by throwing AuthenticationError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: false, error: 'API key tidak valid' }),
    });

    const client = new BlueprinClient({ apiKey: 'bpak_invalid' });
    await expect(client.materials.list()).rejects.toThrow(AuthenticationError);
  });

  it('handles 403 Forbidden by throwing ScopePermissionError', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: new Headers(),
      text: async () => JSON.stringify({ success: false, error: 'Scope ahs required' }),
    });

    const client = new BlueprinClient({ apiKey: 'bpak_test' });
    await expect(client.ahs.getById('ahs-1')).rejects.toThrow(ScopePermissionError);
  });

  it('handles 429 Rate Limit and respects Retry-After', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      headers: new Headers({ 'Retry-After': '1' }),
      text: async () => JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
    });

    const client = new BlueprinClient({ apiKey: 'bpak_test', maxRetries: 0 });
    await expect(client.rab.getByProjectId('proj-1')).rejects.toThrow(RateLimitError);
  });

  it('fetches public plans without requiring authentication', async () => {
    const mockPlans = {
      success: true,
      data: [{ code: 'api_free', name: 'Free', price_amount: 0 }],
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers(),
      text: async () => JSON.stringify(mockPlans),
    });

    const client = new BlueprinClient({ apiKey: 'bpak_test' });
    const result = await client.plans.list();

    const calledOpts = (globalThis.fetch as any).mock.calls[0][1];
    expect(calledOpts.headers['X-API-Key']).toBeUndefined();
    expect(result.data[0].code).toBe('api_free');
  });
});
