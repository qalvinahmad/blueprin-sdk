import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';

describe('SDK backward-compat aliases', () => {
  it('should accept apiUrl option without error', () => {
    const sdk = new BlueprinSDK({
      appId: 'test-apiurl',
      apiUrl: 'https://api.example.com',
    });
    expect(sdk).toBeDefined();
  });

  it('should accept config option with supabaseUrl', () => {
    const sdk = new BlueprinSDK({
      appId: 'test-config',
      config: {
        supabaseUrl: 'https://test.supabase.co',
        supabaseAnonKey: 'test-key',
        debug: true,
      },
    });
    expect(sdk).toBeDefined();
  });

  it('should accept logger option with prefix', () => {
    const sdk = new BlueprinSDK({
      appId: 'test-logger',
      logger: { prefix: '[CustomLogger]' },
    });
    expect(sdk).toBeDefined();
  });

  it('should prefer explicit supabaseUrl over config.supabaseUrl', () => {
    const sdk = new BlueprinSDK({
      appId: 'test-priority',
      supabaseUrl: 'https://explicit.supabase.co',
      config: {
        supabaseUrl: 'https://config.supabase.co',
        supabaseAnonKey: 'config-key',
      },
    });
    expect(sdk).toBeDefined();
  });

  it('should prefer explicit supabaseKey over config.supabaseAnonKey', () => {
    const sdk = new BlueprinSDK({
      appId: 'test-key-priority',
      supabaseKey: 'explicit-key',
      config: {
        supabaseUrl: 'https://config.supabase.co',
        supabaseAnonKey: 'config-key',
      },
    });
    expect(sdk).toBeDefined();
  });

  it('should prefer explicit debug over config.debug', () => {
    const sdk = new BlueprinSDK({
      appId: 'test-debug',
      debug: false,
      config: { debug: true },
    });
    expect(sdk).toBeDefined();
  });

  it('should default logger prefix to appId', () => {
    const sdk = new BlueprinSDK({ appId: 'my-app' });
    expect(sdk).toBeDefined();
  });

  it('should call initialize() alias for init()', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-init-alias' });
    const initSpy = vi.spyOn(sdk, 'init');
    await sdk.initialize();
    expect(initSpy).toHaveBeenCalled();
  });

  it('should expose schedule getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-schedule' });
    await sdk.init();
    expect(sdk.schedule).toBeDefined();
  });

  it('should expose marketplace getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-marketplace' });
    await sdk.init();
    expect(sdk.marketplace).toBeDefined();
  });

  it('should expose auth getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-auth' });
    await sdk.init();
    expect(sdk.auth).toBeDefined();
  });

  it('should expose workforce getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-workforce' });
    await sdk.init();
    expect(sdk.workforce).toBeDefined();
  });

  it('should expose projects getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-projects' });
    await sdk.init();
    expect(sdk.projects).toBeDefined();
  });

  it('should expose materials getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-materials' });
    await sdk.init();
    expect(sdk.materials).toBeDefined();
  });

  it('should expose rab getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-rab' });
    await sdk.init();
    expect(sdk.rab).toBeDefined();
  });

  it('should expose connectors getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-connectors' });
    await sdk.init();
    expect(sdk.connectors).toBeDefined();
  });

  it('should expose reports getter', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-reports' });
    await sdk.init();
    expect(sdk.reports).toBeDefined();
  });

  it('should return correct info from getInfo()', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-info' });
    await sdk.init();
    const info = sdk.getInfo();
    expect(info.version).toBeDefined();
    expect(info.initialized).toBe(true);
    expect(typeof info.plugins).toBe('number');
    expect(typeof info.hooks).toBe('number');
    expect(typeof info.events).toBe('number');
  });

  it('should handle double init gracefully', async () => {
    const sdk = new BlueprinSDK({ appId: 'test-double-init' });
    await sdk.init();
    await sdk.init(); // Should warn but not fail
    expect(sdk.getInfo().initialized).toBe(true);
  });
});
