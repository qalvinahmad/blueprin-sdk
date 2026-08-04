import { describe, it, expect, beforeEach } from 'vitest';
import {
  BlueprinSDK,
  definePlugin,
  EventBus,
  HookRegistry,
  StorageAdapter,
  Logger,
  formatIDR,
  formatDate,
  cn,
  generateId,
  PLUGIN_LIFECYCLE,
  EVENT_NAMES,
  HOOK_NAMES,
} from '../lib/src/index.ts';

describe('BlueprinSDK', () => {
  let sdk;

  beforeEach(async () => {
    sdk = new BlueprinSDK({ appId: 'test', debug: false });
    await sdk.init();
  });

  it('should initialize', () => {
    expect(sdk.version).toBe('1.0.0');
    expect(sdk.getInfo().initialized).toBe(true);
  });

  it('should register and activate plugins', async () => {
    let activated = false;

    await sdk.plugins.register(
      definePlugin({
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        activate(ctx) {
          activated = true;
          return { api: { test: () => true } };
        },
      })
    );

    expect(sdk.plugins.has('test-plugin')).toBe(true);

    await sdk.plugins.activate('test-plugin');
    expect(activated).toBe(true);
    expect(sdk.plugins.get('test-plugin').status).toBe(PLUGIN_LIFECYCLE.ACTIVE);
  });

  it('should list registered plugins', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'plugin-a',
        name: 'Plugin A',
        version: '1.0.0',
        activate: () => ({}),
      })
    );

    await sdk.plugins.register(
      definePlugin({
        id: 'plugin-b',
        name: 'Plugin B',
        version: '2.0.0',
        activate: () => ({}),
      })
    );

    const list = sdk.plugins.list();
    expect(list.length).toBe(2);
    expect(list.map((p) => p.id)).toContain('plugin-a');
    expect(list.map((p) => p.id)).toContain('plugin-b');
  });

  it('should enforce plugin dependencies', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'dependent-plugin',
        name: 'Dependent Plugin',
        version: '1.0.0',
        dependencies: ['core-plugin'],
        activate: () => ({}),
      })
    );

    // Activating without dependency should fail
    await expect(sdk.plugins.activate('dependent-plugin')).rejects.toThrow(/requires dependency "core-plugin"/);

    // Register and activate dependency
    await sdk.plugins.register(
      definePlugin({
        id: 'core-plugin',
        name: 'Core Plugin',
        version: '1.0.0',
        activate: () => ({}),
      })
    );
    await sdk.plugins.activate('core-plugin');

    // Now it should succeed
    await expect(sdk.plugins.activate('dependent-plugin')).resolves.toBeDefined();
  });

  it('should retrieve UI components', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'ui-plugin',
        name: 'UI Plugin',
        version: '1.0.0',
        ui: {
          menus: [{ label: 'Settings', path: '/settings' }],
          panels: [{ id: 'dashboard', component: 'DashboardComponent' }],
        },
        activate: () => ({}),
      })
    );

    await sdk.plugins.activate('ui-plugin');

    const menus = sdk.plugins.getUiComponents('menus');
    expect(menus.length).toBe(1);
    expect(menus[0].label).toBe('Settings');
    expect(menus[0].pluginId).toBe('ui-plugin');

    const all = sdk.plugins.getUiComponents('all');
    expect(all.panels.length).toBe(1);
  });

  it('should enforce sandbox permissions', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'sandbox-plugin',
        name: 'Sandbox Plugin',
        version: '1.0.0',
        permissions: ['storage:read'], // No write permission
        activate: async (ctx) => {
          try {
            await ctx.storage.set('key', 'value');
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('sandbox-plugin');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/Permission denied: "storage:write" required/);
  });

  it('should process marketplace submission', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'market-plugin',
        name: 'Market Plugin',
        version: '1.0.0',
        author: 'John Doe',
        description: 'Test plugin',
        activate: () => ({}),
      })
    );

    let submitted = false;
    sdk.events.on('blueprin:marketplace:plugin:submitted', () => {
      submitted = true;
    });

    const payload = await sdk.plugins.submitToMarketplace('market-plugin');
    expect(payload.manifest.author).toBe('John Doe');
    expect(submitted).toBe(true);
  });
});

describe('EventBus', () => {
  let bus;

  beforeEach(() => {
    bus = new EventBus({ logger: new Logger({ prefix: '[Test]' }) });
  });

  it('should subscribe and emit events', async () => {
    let received = null;

    bus.on('test:event', (data) => {
      received = data;
    });

    await bus.emit('test:event', { value: 42 });
    expect(received).toEqual({ value: 42 });
  });

  it('should unsubscribe', async () => {
    let count = 0;

    const unsub = bus.on('test:event', () => {
      count++;
    });

    await bus.emit('test:event');
    expect(count).toBe(1);

    unsub();
    await bus.emit('test:event');
    expect(count).toBe(1);
  });

  it('should support scoped event bus', async () => {
    let received = false;

    const scoped = bus.createScoped('my-plugin');
    scoped.on('test:event', () => {
      received = true;
    });

    await bus.emit('test:event');
    expect(received).toBe(true);
  });
});

describe('HookRegistry', () => {
  let hooks;

  beforeEach(() => {
    hooks = new HookRegistry({ logger: new Logger({ prefix: '[Test]' }) });
  });

  it('should register and execute hooks', async () => {
    let called = false;

    hooks.register('test:hook', (data) => {
      called = true;
      return data;
    });

    await hooks.execute('test:hook', { value: 1 });
    expect(called).toBe(true);
  });

  it('should modify data through hooks', async () => {
    hooks.register('test:hook', (data) => {
      return { ...data, modified: true };
    });

    const result = await hooks.execute('test:hook', { value: 1 });
    expect(result.modified).toBe(true);
  });

  it('should execute hooks in priority order', async () => {
    const order = [];

    hooks.register('test:hook', () => order.push('low'), { priority: 1 });
    hooks.register('test:hook', () => order.push('high'), { priority: 10 });
    hooks.register('test:hook', () => order.push('medium'), { priority: 5 });

    await hooks.execute('test:hook', {});
    expect(order).toEqual(['high', 'medium', 'low']);
  });

  it('should support scoped hooks', async () => {
    let called = false;

    const scoped = hooks.createScoped('my-plugin');
    scoped.register('test:hook', () => {
      called = true;
    });

    await hooks.execute('test:hook', {});
    expect(called).toBe(true);
  });

  it('should enforce a 200ms timeout on hook execution', async () => {
    let finished = false;

    hooks.register('test:timeout', async (data) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      finished = true; // Should not reach here during the hook execute wait
      return { modified: true };
    });

    const result = await hooks.execute('test:timeout', { value: 1 });
    // result should not have 'modified: true' because it timed out
    expect(result.modified).toBeUndefined();
    expect(result.value).toBe(1);
    expect(finished).toBe(false); // At the time of execute returning, it hasn't finished
  });

  it('should gracefully handle hooks that throw an error', async () => {
    let secondHookCalled = false;

    hooks.register('test:error', (data) => {
      throw new Error('Intentional crash');
    }, { priority: 10 });

    hooks.register('test:error', (data) => {
      secondHookCalled = true;
      return { modified: true };
    }, { priority: 5 });

    // Execute should not throw, it should catch the error from the first hook and proceed
    const result = await hooks.execute('test:error', { value: 1 });
    
    expect(secondHookCalled).toBe(true);
    expect(result.modified).toBe(true);
    expect(result.value).toBe(1);
  });
});

describe('Utilities', () => {
  it('formatIDR should format currency', () => {
    const result = formatIDR(50000);
    expect(result).toContain('50.000');
    const result2 = formatIDR(1500000);
    expect(result2).toContain('1.500.000');
  });

  it('cn should merge class names', () => {
    expect(cn('a', 'b')).toBe('a b');
    expect(cn('a', null, 'b')).toBe('a b');
    expect(cn('a', { b: true, c: false })).toBe('a b');
  });

  it('generateId should return a UUID', () => {
    const id = generateId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});

describe('Constants', () => {
  it('should export all event names', () => {
    expect(EVENT_NAMES.PROJECT_CREATED).toBe('blueprin:project:created');
    expect(EVENT_NAMES.RAB_CALCULATED).toBe('blueprin:rab:calculated');
    expect(EVENT_NAMES.ORDER_CREATED).toBe('blueprin:marketplace:order:created');
  });

  it('should export all hook names', () => {
    expect(HOOK_NAMES.BEFORE_RAB_CALCULATE).toBe('blueprin:before:rab:calculate');
    expect(HOOK_NAMES.AFTER_RAB_CALCULATE).toBe('blueprin:after:rab:calculate');
  });

  it('should export plugin lifecycle states', () => {
    expect(PLUGIN_LIFECYCLE.ACTIVE).toBe('active');
    expect(PLUGIN_LIFECYCLE.ERROR).toBe('error');
  });
});
