import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlueprinSDK, definePlugin } from '../lib/src/index.ts';

function createTestSDK() {
  return new BlueprinSDK({ appId: 'test-permissions', debug: false });
}

describe('PluginManager permission denied paths', () => {
  let sdk;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
  });

  it('should deny events:listen when permission missing', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-events-listen',
        name: 'No Events Listen',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            ctx.events.on('test:event', () => {});
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-events-listen');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/events:listen/);
  });

  it('should deny events:emit when permission missing', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-events-emit',
        name: 'No Events Emit',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            ctx.events.emit('test:event', {});
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-events-emit');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/events:emit/);
  });

  it('should deny hooks:register when permission missing', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-hooks-register',
        name: 'No Hooks Register',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            ctx.hooks.register('test:hook', () => {});
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-hooks-register');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/hooks:register/);
  });

  it('should deny storage:read when permission missing', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-storage-read',
        name: 'No Storage Read',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            await ctx.storage.get('key');
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-storage-read');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/storage:read/);
  });

  it('should deny storage:has when permission missing', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-storage-has',
        name: 'No Storage Has',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            await ctx.storage.has('key');
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-storage-has');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/storage:read/);
  });

  it('should deny storage:write when permission missing', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-storage-write',
        name: 'No Storage Write',
        version: '1.0.0',
        permissions: [],
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

    await sdk.plugins.activate('no-storage-write');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/storage:write/);
  });

  it('should deny storage:remove when permission missing', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-storage-remove',
        name: 'No Storage Remove',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            await ctx.storage.remove('key');
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-storage-remove');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/storage:write/);
  });

  it('should deny ui:inject when permission missing for registerSlot', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-ui-slot',
        name: 'No UI Slot',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            ctx.ui.registerSlot('sidebar', { render: () => 'test' });
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-ui-slot');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/ui:inject/);
  });

  it('should deny ui:inject when permission missing for addPage', async () => {
    let capturedError = null;

    await sdk.plugins.register(
      definePlugin({
        id: 'no-ui-page',
        name: 'No UI Page',
        version: '1.0.0',
        permissions: [],
        activate: async (ctx) => {
          try {
            ctx.ui.addPage('/test', { render: () => 'test' });
          } catch (e) {
            capturedError = e;
          }
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('no-ui-page');
    expect(capturedError).toBeDefined();
    expect(capturedError.message).toMatch(/ui:inject/);
  });

  it('should handle plugin activation error', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'failing-plugin',
        name: 'Failing Plugin',
        version: '1.0.0',
        activate: async () => {
          throw new Error('Activation failed');
        },
      })
    );

    await expect(sdk.plugins.activate('failing-plugin')).rejects.toThrow('Activation failed');
  });

  it('should handle deactivation error', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'bad-deactivate',
        name: 'Bad Deactivate',
        version: '1.0.0',
        activate: () => ({ api: {} }),
        deactivate: async () => {
          throw new Error('Deactivate failed');
        },
      })
    );

    await sdk.plugins.activate('bad-deactivate');
    await expect(sdk.plugins.deactivate('bad-deactivate')).rejects.toThrow('Deactivate failed');
  });

  it('should activate all registered plugins', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'plugin-a',
        name: 'Plugin A',
        version: '1.0.0',
        activate: () => ({ api: { a: true } }),
      })
    );

    await sdk.plugins.register(
      definePlugin({
        id: 'plugin-b',
        name: 'Plugin B',
        version: '1.0.0',
        activate: () => ({ api: { b: true } }),
      })
    );

    await sdk.plugins.activateAll();
    expect(sdk.plugins.get('plugin-a').status).toBe('active');
    expect(sdk.plugins.get('plugin-b').status).toBe('active');
  });

  it('should destroy all active plugins', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'destroy-a',
        name: 'Destroy A',
        version: '1.0.0',
        activate: () => ({ api: {} }),
      })
    );

    await sdk.plugins.activate('destroy-a');
    await sdk.plugins.destroyAll();
    expect(sdk.plugins.get('destroy-a').status).toBe('suspended');
  });

  it('should remove a plugin', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'remove-me',
        name: 'Remove Me',
        version: '1.0.0',
        activate: () => ({ api: {} }),
      })
    );

    await sdk.plugins.activate('remove-me');
    await sdk.plugins.remove('remove-me');
    expect(sdk.plugins.has('remove-me')).toBe(false);
  });

  it('should get active instances', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'active-inst',
        name: 'Active Instance',
        version: '1.0.0',
        activate: () => ({ api: { test: true } }),
      })
    );

    await sdk.plugins.activate('active-inst');
    const instances = sdk.plugins.getActiveInstances();
    expect(instances.has('active-inst')).toBe(true);
    expect(instances.get('active-inst').api.test).toBe(true);
  });

  it('should not re-activate an already active plugin', async () => {
    let activateCount = 0;

    await sdk.plugins.register(
      definePlugin({
        id: 'already-active',
        name: 'Already Active',
        version: '1.0.0',
        activate: () => { activateCount++; return { api: {} }; },
      })
    );

    await sdk.plugins.activate('already-active');
    await sdk.plugins.activate('already-active'); // Should not re-activate
    expect(activateCount).toBe(1);
  });

  it('should not deactivate a non-active plugin', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'not-active',
        name: 'Not Active',
        version: '1.0.0',
        activate: () => ({ api: {} }),
      })
    );

    // Plugin is REGISTERED, not ACTIVE
    await sdk.plugins.deactivate('not-active');
    expect(sdk.plugins.get('not-active').status).toBe('registered');
  });

  it('should throw on marketplace submission without author', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'no-author',
        name: 'No Author',
        version: '1.0.0',
        activate: () => ({ api: {} }),
      })
    );

    await expect(sdk.plugins.submitToMarketplace('no-author')).rejects.toThrow('author');
  });

  it('should throw on marketplace submission without description', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'no-desc',
        name: 'No Desc',
        version: '1.0.0',
        author: 'Test',
        activate: () => ({ api: {} }),
      })
    );

    await expect(sdk.plugins.submitToMarketplace('no-desc')).rejects.toThrow('description');
  });

  it('should get plugin ui components by type', async () => {
    await sdk.plugins.register(
      definePlugin({
        id: 'ui-types',
        name: 'UI Types',
        version: '1.0.0',
        ui: {
          menus: [{ label: 'Menu' }],
          panels: [{ id: 'panel' }],
          widgets: [{ id: 'widget' }],
        },
        activate: () => ({ api: {} }),
      })
    );

    await sdk.plugins.activate('ui-types');

    const menus = sdk.plugins.getUiComponents('menus');
    expect(menus.length).toBe(1);

    const panels = sdk.plugins.getUiComponents('panels');
    expect(panels.length).toBe(1);

    const widgets = sdk.plugins.getUiComponents('widgets');
    expect(widgets.length).toBe(1);
  });

  it('allows operations when permissions are granted and checks active dependency', async () => {
    let hookExecuted = false;
    let eventReceived = false;

    // Register and activate base plugin
    await sdk.plugins.register(
      definePlugin({
        id: 'base-dep',
        name: 'Base Dep',
        version: '1.0.0',
        activate: () => ({ api: {} }),
      })
    );
    await sdk.plugins.activate('base-dep');

    // Register plugin that depends on base-dep with full permissions
    await sdk.plugins.register(
      definePlugin({
        id: 'full-perms',
        name: 'Full Perms',
        version: '1.0.0',
        dependencies: ['base-dep'],
        permissions: ['events:listen', 'events:emit', 'hooks:register', 'storage:write'],
        activate: async (ctx) => {
          ctx.events.on('full:event', () => {
            eventReceived = true;
          });
          ctx.events.emit('full:event', {});
          ctx.hooks.register('full:hook', () => {
            hookExecuted = true;
          });
          await ctx.storage.set('p_key', 'val');
          await ctx.storage.remove('p_key');
          return { api: {} };
        },
      })
    );

    await sdk.plugins.activate('full-perms');
    expect(eventReceived).toBe(true);
  });
});

