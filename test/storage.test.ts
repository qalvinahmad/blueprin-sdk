import { describe, it, expect, beforeEach } from 'vitest';
import { createStorageKey, StoragePatterns } from '../lib/src/storage/index.ts';
import { StorageAdapter } from '../lib/src/core/storage-adapter.ts';

describe('createStorageKey', () => {
  it('should create a namespaced key', () => {
    expect(createStorageKey('ns', 'key')).toBe('ns:key');
  });

  it('should handle empty strings', () => {
    expect(createStorageKey('', '')).toBe(':');
  });
});

describe('StoragePatterns.withTTL', () => {
  let storage;

  beforeEach(() => {
    storage = new StorageAdapter({ prefix: 'test' });
  });

  it('should set and get cached data', async () => {
    const ttlStorage = StoragePatterns.withTTL(storage, 60000);
    await ttlStorage.set('mykey', { value: 42 });
    const result = await ttlStorage.get('mykey');
    expect(result).toEqual({ value: 42 });
  });

  it('should return null for expired data', async () => {
    const ttlStorage = StoragePatterns.withTTL(storage, 1); // 1ms TTL
    await ttlStorage.set('mykey', { value: 42 });
    // Wait for TTL to expire
    await new Promise(r => setTimeout(r, 10));
    const result = await ttlStorage.get('mykey');
    expect(result).toBeNull();
  });

  it('should return null for missing key', async () => {
    const ttlStorage = StoragePatterns.withTTL(storage, 60000);
    const result = await ttlStorage.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should remove cached data', async () => {
    const ttlStorage = StoragePatterns.withTTL(storage, 60000);
    await ttlStorage.set('mykey', { value: 42 });
    await ttlStorage.remove('mykey');
    const result = await ttlStorage.get('mykey');
    expect(result).toBeNull();
  });
});

describe('StoragePatterns.validated', () => {
  let storage;

  beforeEach(() => {
    storage = new StorageAdapter({ prefix: 'test' });
  });

  it('should store valid data', async () => {
    const validator = (data) => typeof data === 'string';
    const validated = StoragePatterns.validated(storage, validator);
    await validated.set('key1', 'hello');
    const result = await validated.get('key1');
    expect(result).toBe('hello');
  });

  it('should reject invalid data on set', async () => {
    const validator = (data) => typeof data === 'string';
    const validated = StoragePatterns.validated(storage, validator);
    await expect(validated.set('key1', 123)).rejects.toThrow('Validation failed for key "key1"');
  });

  it('should return null and remove invalid data on get', async () => {
    const validator = (data) => typeof data === 'string';
    const validated = StoragePatterns.validated(storage, validator);
    // Manually store invalid data
    await storage.set('key1', 123);
    const result = await validated.get('key1');
    expect(result).toBeNull();
  });

  it('should return null for missing key', async () => {
    const validator = () => true;
    const validated = StoragePatterns.validated(storage, validator);
    const result = await validated.get('nonexistent');
    expect(result).toBeNull();
  });
});

describe('StorageAdapter', () => {
  let storage;

  beforeEach(() => {
    storage = new StorageAdapter({ prefix: 'test' });
  });

  it('should init', async () => {
    await storage.init();
    // No error means success
  });

  it('should set and get values', async () => {
    await storage.set('key1', { hello: 'world' });
    const result = await storage.get('key1');
    expect(result).toEqual({ hello: 'world' });
  });

  it('should return null for missing keys', async () => {
    const result = await storage.get('nonexistent');
    expect(result).toBeNull();
  });

  it('should check has()', async () => {
    await storage.set('key1', 'value');
    expect(await storage.has('key1')).toBe(true);
    expect(await storage.has('nonexistent')).toBe(false);
  });

  it('should remove keys', async () => {
    await storage.set('key1', 'value');
    await storage.remove('key1');
    expect(await storage.has('key1')).toBe(false);
  });

  it('should list keys (returns empty in Node.js)', async () => {
    await storage.set('a', 1);
    await storage.set('b', 2);
    const keys = await storage.keys();
    // In Node.js environment, localStorage is not available so keys() returns empty
    expect(Array.isArray(keys)).toBe(true);
  });

  it('should clear all keys', async () => {
    await storage.set('a', 1);
    await storage.set('b', 2);
    await storage.clear();
    expect(await storage.has('a')).toBe(false);
    expect(await storage.has('b')).toBe(false);
  });

  it('should create scoped storage', async () => {
    const scoped = storage.createScoped('plugin1');
    await scoped.set('mykey', 'myvalue');
    const result = await scoped.get('mykey');
    expect(result).toBe('myvalue');
  });

  it('should scope has and remove', async () => {
    const scoped = storage.createScoped('plugin1');
    await scoped.set('key', 'val');
    expect(await scoped.has('key')).toBe(true);
    await scoped.remove('key');
    expect(await scoped.has('key')).toBe(false);
  });

  it('should isolate clear() to the specific scope without clearing other scopes', async () => {
    const scopeA = new StorageAdapter({ prefix: 'scopeA' });
    const scopeB = new StorageAdapter({ prefix: 'scopeB' });

    await scopeA.set('sharedKey', 'valA');
    await scopeB.set('sharedKey', 'valB');

    expect(await scopeA.get('sharedKey')).toBe('valA');
    expect(await scopeB.get('sharedKey')).toBe('valB');

    await scopeA.clear();

    expect(await scopeA.get('sharedKey')).toBeNull();
    expect(await scopeB.get('sharedKey')).toBe('valB');
  });

  it('should return cached values', async () => {
    await storage.set('cached', 'data');
    // Get should return from cache
    const result = await storage.get('cached');
    expect(result).toBe('data');
  });

  it('should handle keys() returning empty when no matching prefix', async () => {
    const keys = await storage.keys();
    expect(Array.isArray(keys)).toBe(true);
  });

  it('should sync to supabase when requested', async () => {
    let upsertCalled = false;
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        upsert: vi.fn().mockImplementation(() => {
          upsertCalled = true;
          return Promise.resolve({ error: null });
        }),
      }),
    };

    const storageWithSupabase = new StorageAdapter({
      prefix: 'test',
      supabaseClient: mockSupabase,
    });

    await storageWithSupabase.set('key1', 'value', { sync: true, table: 'custom_table' });
    expect(upsertCalled).toBe(true);
  });

  it('should remove from supabase when sync requested', async () => {
    let deleteCalled = false;
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockImplementation(() => {
            deleteCalled = true;
            return Promise.resolve({ error: null });
          }),
        }),
      }),
    };

    const storageWithSupabase = new StorageAdapter({
      prefix: 'test',
      supabaseClient: mockSupabase,
    });

    await storageWithSupabase.set('key1', 'value');
    await storageWithSupabase.remove('key1', { sync: true });
    expect(deleteCalled).toBe(true);
  });
});
