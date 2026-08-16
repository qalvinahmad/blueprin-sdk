import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageAdapter } from '../lib/src/core/storage-adapter.ts';

describe('StorageAdapter in Browser environment', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};

    const localStorageMock = {
      getItem: vi.fn((key: string) => mockStorage[key] ?? null),
      setItem: vi.fn((key: string, val: string) => {
        mockStorage[key] = val;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
      clear: vi.fn(() => {
        mockStorage = {};
      }),
      key: vi.fn((i: number) => Object.keys(mockStorage)[i] ?? null),
      get length() {
        return Object.keys(mockStorage).length;
      },
    };

    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('gets, sets, removes, checks and clears items with localStorage', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: null }),
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null }),
        }),
      }),
    };

    const storage = new StorageAdapter({
      prefix: 'bp_test',
      supabaseClient: mockSupabase,
    });
    await storage.init();

    // Set with sync
    await storage.set('user_pref', { theme: 'dark' }, { sync: true });
    expect(await storage.has('user_pref')).toBe(true);

    // Get
    const val = await storage.get('user_pref');
    expect(val).toEqual({ theme: 'dark' });

    // Keys
    await storage.set('another_key', 123);
    const keys = await storage.keys();
    expect(keys).toContain('user_pref');
    expect(keys).toContain('another_key');

    // Remove with sync
    await storage.remove('user_pref', { sync: true });
    expect(await storage.has('user_pref')).toBe(false);

    // Clear
    await storage.clear();
    const keysAfterClear = await storage.keys();
    expect(keysAfterClear.length).toBe(0);
  });

  it('handles corrupted localStorage JSON gracefully', async () => {
    mockStorage['bp_test:corrupt'] = 'invalid-json{[';
    const storage = new StorageAdapter({ prefix: 'bp_test' });
    const val = await storage.get('corrupt');
    expect(val).toBeNull();
  });
});
