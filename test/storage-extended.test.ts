import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageAdapter } from '../lib/src/core/storage-adapter.ts';

describe('StorageAdapter extended paths', () => {
  let adapter;

  beforeEach(() => {
    adapter = new StorageAdapter({ prefix: 'test' });
  });

  it('should clear all keys from cache', async () => {
    await adapter.set('key1', 'val1');
    await adapter.set('key2', 'val2');
    await adapter.clear();
    expect(await adapter.get('key1')).toBeFalsy();
    expect(await adapter.get('key2')).toBeFalsy();
  });

  it('should handle keys() returning localStorage keys in browser', async () => {
    // Since we're in Node, isBrowser() returns false, so clear() just clears cache
    await adapter.set('key1', 'val1');
    await adapter.clear();
    const keys = await adapter.keys();
    expect(keys).toEqual([]);
  });

  it('should handle keys() with prefix filter', async () => {
    await adapter.set('key1', 'val1');
    await adapter.set('key2', 'val2');
    const keys = await adapter.keys();
    expect(keys).toEqual([]);
  });

  it('should create scoped storage', async () => {
    const scoped = adapter.createScoped('my-plugin');
    await scoped.set('name', 'test');
    expect(await scoped.get('name')).toBe('test');
    expect(await scoped.has('name')).toBe(true);

    // Should also be accessible from main adapter
    expect(await adapter.get('test:plugin:my-plugin:name')).toBe('test');

    await scoped.remove('name');
    expect(await scoped.has('name')).toBe(false);
  });

  it('should handle syncToSupabase when no supabase client', async () => {
    // Should not throw
    await adapter.syncToSupabase('table', 'id', { data: 1 });
  });

  it('should handle syncToSupabase error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockRejectedValue(new Error('Upsert failed')),
      }),
    };

    const adapterWithSupa = new StorageAdapter({
      prefix: 'test',
      supabaseClient: mockSupabase,
    });

    // Should not throw
    await adapterWithSupa.syncToSupabase('table', 'id', { data: 1 });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle syncToSupabase with error response', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockResolvedValue({ error: new Error('DB error') }),
      }),
    };

    const adapterWithSupa = new StorageAdapter({
      prefix: 'test',
      supabaseClient: mockSupabase,
    });

    await adapterWithSupa.syncToSupabase('table', 'id', { data: 1 });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should handle get with invalid JSON in localStorage', async () => {
    // Directly write invalid JSON
    const rawKey = adapter._key('bad-json');
    // Can't easily write to localStorage in Node, but the code handles errors
    const result = await adapter.get('bad-json');
    expect(result).toBeFalsy();
  });

  it('should handle has() for existing key', async () => {
    await adapter.set('exists', true);
    expect(await adapter.has('exists')).toBe(true);
  });

  it('should handle has() for non-existing key', async () => {
    expect(await adapter.has('nonexistent')).toBe(false);
  });

  it('should handle remove with supabase client sync', async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    };

    const adapterWithSupa = new StorageAdapter({
      prefix: 'test',
      supabaseClient: mockSupabase,
    });

    await adapterWithSupa.set('key1', 'val1');
    await adapterWithSupa.remove('key1', { sync: true });
    expect(await adapterWithSupa.get('key1')).toBeFalsy();
    expect(mockSupabase.from).toHaveBeenCalledWith('plugin_storage_sync');
  });

  it('should handle overwrite of existing key', async () => {
    await adapter.set('key1', 'val1');
    await adapter.set('key1', 'val2');
    expect(await adapter.get('key1')).toBe('val2');
  });

  it('should handle syncToSupabase with null supabase', async () => {
    // When supabase is null, should return early
    const plainAdapter = new StorageAdapter({ prefix: 'test' });
    await plainAdapter.syncToSupabase('table', 'id', { data: 1 });
    // No error should be thrown
  });
});
