import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BlueprinSDK,
  definePlugin,
  TelemetryManager,
  EVENT_NAMES,
  HOOK_NAMES,
} from '../lib/index.js';

describe('TelemetryManager', () => {
  let telemetry;

  beforeEach(() => {
    telemetry = new TelemetryManager({ appId: 'test-app', enabled: true });
  });

  it('should register and remove telemetry handlers', async () => {
    const handler = vi.fn();
    const unbind = telemetry.addHandler(handler);

    expect(telemetry.handlerCount()).toBe(1);

    await telemetry.track('button_click', { buttonId: 'save' });

    expect(handler).toHaveBeenCalledTimes(1);
    const eventData = handler.mock.calls[0][0];
    expect(eventData.event).toBe('button_click');
    expect(eventData.payload).toEqual({ buttonId: 'save' });
    expect(eventData.appId).toBe('test-app');
    expect(eventData.sdkVersion).toBe('1.0.0');
    expect(typeof eventData.timestamp).toBe('number');

    unbind();
    expect(telemetry.handlerCount()).toBe(0);
  });

  it('should throw error when registering non-function handler', () => {
    expect(() => telemetry.addHandler('not-a-function')).toThrow(
      'Telemetry handler must be a function'
    );
  });

  it('should respect enable and disable state', async () => {
    const handler = vi.fn();
    telemetry.addHandler(handler);

    telemetry.disable();
    expect(telemetry.isEnabled()).toBe(false);

    const result = await telemetry.track('test_event');
    expect(result).toBeNull();
    expect(handler).not.toHaveBeenCalled();

    telemetry.enable();
    expect(telemetry.isEnabled()).toBe(true);

    await telemetry.track('test_event');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should isolate sync and async handler errors gracefully', async () => {
    const throwingHandler = () => {
      throw new Error('Sync error in telemetry handler');
    };
    const asyncRejectingHandler = async () => {
      throw new Error('Async error in telemetry handler');
    };
    const validHandler = vi.fn();

    telemetry.addHandler(throwingHandler);
    telemetry.addHandler(asyncRejectingHandler);
    telemetry.addHandler(validHandler);

    await expect(telemetry.track('safe_event')).resolves.not.toThrow();
    expect(validHandler).toHaveBeenCalledTimes(1);
  });

  it('should create scoped telemetry for plugins', async () => {
    const handler = vi.fn();
    telemetry.addHandler(handler);

    const pluginTelemetry = telemetry.createScoped('plugin-analytics');
    await pluginTelemetry.track('custom_plugin_action', { count: 42 });

    expect(handler).toHaveBeenCalledTimes(1);
    const eventData = handler.mock.calls[0][0];
    expect(eventData.event).toBe('custom_plugin_action');
    expect(eventData.pluginId).toBe('plugin-analytics');
    expect(eventData.payload).toEqual({ count: 42 });
  });
});

describe('SDK Telemetry Integration', () => {
  let sdk;

  beforeEach(async () => {
    sdk = new BlueprinSDK({ appId: 'sdk-telemetry-test', debug: false });
    await sdk.init();
  });

  it('should expose telemetry manager on SDK', () => {
    expect(sdk.telemetry).toBeInstanceOf(TelemetryManager);
  });

  it('should provide scoped telemetry context to plugins during activation', async () => {
    const trackedEvents = [];
    sdk.telemetry.addHandler((eventData) => {
      trackedEvents.push(eventData);
    });

    await sdk.plugins.register(
      definePlugin({
        id: 'analytics-plugin',
        name: 'Analytics Plugin',
        version: '1.0.0',
        activate(ctx) {
          expect(ctx.telemetry).toBeDefined();
          ctx.telemetry.track('plugin_initialized_custom', { feature: 'reporting' });
          return {};
        },
      })
    );

    await sdk.plugins.activate('analytics-plugin');

    const customEvent = trackedEvents.find(
      (e) => e.event === 'plugin_initialized_custom'
    );
    expect(customEvent).toBeDefined();
    expect(customEvent.pluginId).toBe('analytics-plugin');
    expect(customEvent.payload).toEqual({ feature: 'reporting' });
  });

  it('should automatically track plugin lifecycle events', async () => {
    const trackedEvents = [];
    sdk.telemetry.addHandler((eventData) => {
      trackedEvents.push(eventData);
    });

    await sdk.plugins.register(
      definePlugin({
        id: 'lifecycle-plugin',
        name: 'Lifecycle Plugin',
        version: '1.0.0',
        activate: () => ({}),
        deactivate: () => {},
      })
    );

    await sdk.plugins.activate('lifecycle-plugin');
    await sdk.plugins.deactivate('lifecycle-plugin');

    const registered = trackedEvents.find((e) => e.event === 'plugin_registered');
    const activated = trackedEvents.find((e) => e.event === 'plugin_activated');
    const deactivated = trackedEvents.find((e) => e.event === 'plugin_deactivated');

    expect(registered).toBeDefined();
    expect(registered.pluginId).toBe('lifecycle-plugin');
    expect(activated).toBeDefined();
    expect(activated.pluginId).toBe('lifecycle-plugin');
    expect(deactivated).toBeDefined();
    expect(deactivated.pluginId).toBe('lifecycle-plugin');
  });

  it('should include TELEMETRY_TRACK event and HOOK names in constants', () => {
    expect(EVENT_NAMES.TELEMETRY_TRACK).toBe('blueprin:telemetry:track');
    expect(HOOK_NAMES.BEFORE_TELEMETRY_TRACK).toBe('blueprin:before:telemetry:track');
    expect(HOOK_NAMES.AFTER_TELEMETRY_TRACK).toBe('blueprin:after:telemetry:track');
  });
});
