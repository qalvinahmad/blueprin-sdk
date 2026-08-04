# Testing

## Setup

```bash
npm install
npm test
```

## Writing Tests

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { BlueprinSDK, definePlugin } from '@alvinahmad/blueprin-sdk';

describe('My Plugin', () => {
  let sdk;

  beforeEach(async () => {
    sdk = new BlueprinSDK({ appId: 'test', debug: false });
    await sdk.init();
  });

  it('should register and activate plugin', async () => {
    const plugin = definePlugin({
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      activate(ctx) {
        return { api: { hello: () => 'world' } };
      },
    });

    await sdk.plugins.register(plugin);
    await sdk.plugins.activate('test-plugin');

    const instance = sdk.plugins.get('test-plugin');
    expect(instance.status).toBe('active');
  });

  it('should emit events', async () => {
    let received = false;

    sdk.events.on('blueprin:project:created', () => {
      received = true;
    });

    await sdk.events.emit('blueprin:project:created', {
      project: { name: 'Test' },
    });

    expect(received).toBe(true);
  });

  it('should execute hooks', async () => {
    let hookCalled = false;

    sdk.hooks.register('blueprin:after:rab:calculate', (data) => {
      hookCalled = true;
      return data;
    });

    await sdk.hooks.execute('blueprin:after:rab:calculate', {
      result: { total: 1000 },
    });

    expect(hookCalled).toBe(true);
  });

  it('should store and retrieve data', async () => {
    await sdk.storage.set('test-key', { hello: 'world' });
    const data = await sdk.storage.get('test-key');
    expect(data).toEqual({ hello: 'world' });
  });
});
```

## Integration Tests

Test plugins with Supabase:

```javascript
import { createClient } from '@supabase/supabase-js';

describe('Plugin with Supabase', () => {
  let sdk;
  let supabase;

  beforeEach(async () => {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    sdk = new BlueprinSDK({
      appId: 'integration-test',
      supabaseClient: supabase,
    });

    await sdk.init();
  });

  it('should sync data to Supabase', async () => {
    await sdk.storage.syncToSupabase('plugins', 'test-id', {
      name: 'Test Plugin',
    });

    const { data } = await supabase
      .from('plugins')
      .select('*')
      .eq('id', 'test-id')
      .single();

    expect(data.name).toBe('Test Plugin');
  });
});
```
