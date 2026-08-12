import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../lib/src/core/event-bus.ts';
import { HookRegistry } from '../lib/src/core/hook-registry.ts';
import { Logger } from '../lib/src/core/logger.ts';
import { StorageAdapter } from '../lib/src/core/storage-adapter.ts';
import { definePlugin, defineConnector, defineExtension } from '../lib/src/core/plugin-def.ts';

function createLogger() {
  return new Logger({ prefix: '[Test]', debug: false });
}

describe('EventBus additional coverage', () => {
  let bus;

  beforeEach(() => {
    bus = new EventBus({ logger: createLogger() });
  });

  it('should support once() for single-fire listeners', async () => {
    let count = 0;
    bus.once('test:event', () => { count++; });
    await bus.emit('test:event');
    await bus.emit('test:event');
    expect(count).toBe(1);
  });

  it('should remove listeners by eventName', () => {
    bus.on('test:event', () => {});
    bus.on('other:event', () => {});
    bus.removeAllListeners('test:event');
    expect(bus.listenerCount('test:event')).toBe(0);
    expect(bus.listenerCount('other:event')).toBe(1);
  });

  it('should remove all listeners when no eventName', () => {
    bus.on('test:event', () => {});
    bus.on('other:event', () => {});
    bus.removeAllListeners();
    expect(bus.listenerCount()).toBe(0);
  });

  it('should remove plugin-specific listeners', () => {
    bus.on('test:event', () => {}, { pluginId: 'plugin1' });
    bus.on('test:event', () => {}, { pluginId: 'plugin2' });
    bus.removePluginListeners('plugin1');
    expect(bus.listenerCount('test:event')).toBe(1);
  });

  it('should count all listeners when no eventName', () => {
    bus.on('a', () => {});
    bus.on('b', () => {});
    bus.on('b', () => {});
    expect(bus.listenerCount()).toBe(3);
  });

  it('should count specific event listeners', () => {
    bus.on('a', () => {});
    bus.on('a', () => {});
    expect(bus.listenerCount('a')).toBe(2);
    expect(bus.listenerCount('nonexistent')).toBe(0);
  });

  it('should handle emit with no listeners', async () => {
    await bus.emit('nonexistent', { data: 1 });
    // Should not throw
  });

  it('should handle listener errors gracefully', async () => {
    bus.on('test:event', () => { throw new Error('Listener error'); });
    bus.on('test:event', () => {});
    await bus.emit('test:event');
    // Should not throw, second listener should still be called
  });

  it('should sort listeners by priority', async () => {
    const order = [];
    bus.on('test:event', () => order.push('low'), { priority: 1 });
    bus.on('test:event', () => order.push('high'), { priority: 10 });
    bus.on('test:event', () => order.push('medium'), { priority: 5 });
    await bus.emit('test:event');
    expect(order).toEqual(['high', 'medium', 'low']);
  });

  it('should support scoped event bus', async () => {
    let received = false;
    const scoped = bus.createScoped('plugin1');
    scoped.on('test:event', () => { received = true; });
    await bus.emit('test:event');
    expect(received).toBe(true);
  });

  it('should rate-limit scoped emit', async () => {
    const scoped = bus.createScoped('rate-limited-plugin');
    let count = 0;
    scoped.on('test:event', () => { count++; });

    // First 100 emits should work
    for (let i = 0; i < 100; i++) {
      scoped.emit('test:event');
    }
    expect(count).toBe(100);

    // 101st should be rate-limited
    scoped.emit('test:event');
    expect(count).toBe(100);
  });
});

describe('HookRegistry additional coverage', () => {
  let hooks;

  beforeEach(() => {
    hooks = new HookRegistry({ logger: createLogger() });
  });

  it('should unregister hooks', () => {
    const callback = () => {};
    hooks.register('test:hook', callback);
    expect(hooks.count('test:hook')).toBe(1);
    hooks.unregister('test:hook', callback);
    expect(hooks.count('test:hook')).toBe(0);
  });

  it('should not throw when unregistering non-existent hook', () => {
    hooks.unregister('nonexistent', () => {});
    // Should not throw
  });

  it('should count all hooks when no hookName', () => {
    hooks.register('a', () => {});
    hooks.register('b', () => {});
    hooks.register('b', () => {});
    expect(hooks.count()).toBe(3);
  });

  it('should count specific hook callbacks', () => {
    hooks.register('a', () => {});
    hooks.register('a', () => {});
    expect(hooks.count('a')).toBe(2);
  });

  it('should clear all hooks', () => {
    hooks.register('a', () => {});
    hooks.register('b', () => {});
    hooks.clear();
    expect(hooks.count()).toBe(0);
  });

  it('should remove plugin-specific hooks', () => {
    hooks.register('test:hook', () => {}, { pluginId: 'plugin1' });
    hooks.register('test:hook', () => {}, { pluginId: 'plugin2' });
    hooks.removePluginHooks('plugin1');
    expect(hooks.count('test:hook')).toBe(1);
  });

  it('should executeBefore and executeAfter', async () => {
    let beforeExecuted = false;
    let afterExecuted = false;
    hooks.register('blueprin:before:test', () => { beforeExecuted = true; return { modified: true }; });
    hooks.register('blueprin:after:test', () => { afterExecuted = true; });

    await hooks.executeBefore('blueprin:before:test', {});
    await hooks.executeAfter('blueprin:after:test', {});
    expect(beforeExecuted).toBe(true);
    expect(afterExecuted).toBe(true);
  });

  it('should return original context when no hooks registered', async () => {
    const ctx = { value: 1 };
    const result = await hooks.execute('nonexistent', ctx);
    expect(result).toEqual(ctx);
  });

  it('should handle hook returning undefined', async () => {
    hooks.register('test:hook', () => { /* returns undefined */ });
    const result = await hooks.execute('test:hook', { value: 1 });
    expect(result.value).toBe(1);
  });

  it('should create scoped hooks', async () => {
    const scoped = hooks.createScoped('plugin1');
    let called = false;
    scoped.register('test:hook', () => { called = true; });
    await scoped.execute('test:hook', {});
    expect(called).toBe(true);
  });

  it('should support scoped unregister', () => {
    const scoped = hooks.createScoped('plugin1');
    const callback = () => {};
    scoped.register('test:hook', callback);
    expect(hooks.count('test:hook')).toBe(1);
    scoped.unregister('test:hook', callback);
    expect(hooks.count('test:hook')).toBe(0);
  });
});

describe('StorageAdapter additional coverage', () => {
  let storage;

  beforeEach(() => {
    storage = new StorageAdapter({ prefix: 'test' });
  });

  it('should handle set with sync option (no supabase)', async () => {
    await storage.set('key', 'value', { sync: true });
    expect(await storage.get('key')).toBe('value');
  });

  it('should handle remove with sync option (no supabase)', async () => {
    await storage.set('key', 'value');
    await storage.remove('key', { sync: true });
    expect(await storage.has('key')).toBe(false);
  });

  it('should call syncToSupabase with no supabase', async () => {
    await storage.syncToSupabase('table', 'id', { value: 'test' });
    // Should not throw
  });
});

describe('plugin-def additional coverage', () => {
  it('definePlugin should set default values', () => {
    const plugin = definePlugin({
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      activate: () => ({}),
    });
    expect(plugin.type).toBe('plugin');
    expect(plugin.dependencies).toEqual([]);
    expect(plugin.permissions).toEqual([]);
    expect(plugin.ui.menus).toEqual([]);
    expect(plugin.ui.panels).toEqual([]);
    expect(plugin.ui.widgets).toEqual([]);
  });

  it('definePlugin should pass through ui config', () => {
    const plugin = definePlugin({
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      ui: {
        menus: [{ label: 'Menu1' }],
        panels: [{ id: 'panel1' }],
        widgets: [{ id: 'widget1' }],
        custom: 'extra',
      },
      activate: () => ({}),
    });
    expect(plugin.ui.menus.length).toBe(1);
    expect(plugin.ui.panels.length).toBe(1);
    expect(plugin.ui.widgets.length).toBe(1);
    expect(plugin.ui.custom).toBe('extra');
  });

  it('defineConnector should set default protocol', () => {
    const connector = defineConnector({
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      connect: async () => ({}),
    });
    expect(connector.type).toBe('connector');
    expect(connector.protocol).toBe('rest');
  });

  it('defineConnector should use specified protocol', () => {
    const connector = defineConnector({
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      protocol: 'grpc',
      connect: async () => ({}),
    });
    expect(connector.protocol).toBe('grpc');
  });

  it('defineExtension should set default values', () => {
    const ext = defineExtension({
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      activate: () => ({}),
    });
    expect(ext.type).toBe('extension');
    expect(ext.routes).toEqual([]);
    expect(ext.sidebar).toBeNull();
  });

  it('defineExtension should pass through config', () => {
    const ext = defineExtension({
      id: 'test',
      name: 'Test',
      version: '1.0.0',
      routes: [{ path: '/test' }],
      sidebar: { label: 'Test', icon: 'icon' },
      activate: () => ({}),
    });
    expect(ext.routes.length).toBe(1);
    expect(ext.sidebar.label).toBe('Test');
  });
});
