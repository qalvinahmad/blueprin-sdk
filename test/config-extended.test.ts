import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConfigManager } from '../lib/src/core/config-manager.ts';

describe('ConfigManager extended paths', () => {
  let manager;

  beforeEach(() => {
    manager = new ConfigManager({ appId: 'test-app', storagePrefix: 'test' });
  });

  it('should set and get config values', () => {
    manager.set('theme', 'dark');
    expect(manager.get('theme')).toBe('dark');
  });

  it('should get default value for missing key', () => {
    expect(manager.get('missing', 'default')).toBe('default');
  });

  it('should get undefined for missing key without default', () => {
    expect(manager.get('missing')).toBeUndefined();
  });

  it('should get all config values', () => {
    manager.set('a', 1);
    manager.set('b', 2);
    const all = manager.getAll();
    expect(all).toEqual({ a: 1, b: 2 });
  });

  it('should remove a config value', () => {
    manager.set('key', 'value');
    manager.remove('key');
    expect(manager.get('key')).toBeUndefined();
  });

  it('should return empty object for getAll with no values', () => {
    expect(manager.getAll()).toEqual({});
  });

  it('should handle init in non-browser environment', async () => {
    // In Node.js, init() should return early
    await manager.init();
    expect(manager.getAll()).toEqual({});
  });

  it('should handle _persist in non-browser environment', () => {
    // Should not throw
    manager.set('key', 'value');
    expect(manager.get('key')).toBe('value');
  });

  it('should init and persist with browser localStorage', async () => {
    let storageMap: Record<string, string> = {
      'test:blueprin_sdk_config': JSON.stringify({ preloaded: 'yes' }),
    };

    vi.stubGlobal('window', {});
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => storageMap[k] ?? null,
      setItem: (k: string, v: string) => {
        storageMap[k] = v;
      },
    });

    const browserManager = new ConfigManager({ appId: 'test-app', storagePrefix: 'test' });
    await browserManager.init();
    expect(browserManager.get('preloaded')).toBe('yes');

    browserManager.set('new_key', 'saved');
    expect(JSON.parse(storageMap['test:blueprin_sdk_config']).new_key).toBe('saved');

    browserManager.remove('new_key');
    expect(JSON.parse(storageMap['test:blueprin_sdk_config']).new_key).toBeUndefined();

    vi.unstubAllGlobals();
  });
});

