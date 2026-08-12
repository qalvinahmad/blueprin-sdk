import { describe, it, expect, vi } from 'vitest';
import {
  BlueprinSDK,
  PluginManager,
  EventBus,
  HookRegistry,
  StorageAdapter,
  Logger,
  ConfigManager,
  definePlugin,
  defineConnector,
  defineExtension,
  PLUGIN_LIFECYCLE,
  PLUGIN_STATUS,
  CONNECTOR_STATUS,
  EVENT_NAMES,
  HOOK_NAMES,
} from '../lib/src/core/index.ts';

describe('Core module re-exports', () => {
  it('should export BlueprinSDK', () => {
    expect(BlueprinSDK).toBeDefined();
  });

  it('should export PluginManager', () => {
    expect(PluginManager).toBeDefined();
  });

  it('should export EventBus', () => {
    expect(EventBus).toBeDefined();
  });

  it('should export HookRegistry', () => {
    expect(HookRegistry).toBeDefined();
  });

  it('should export StorageAdapter', () => {
    expect(StorageAdapter).toBeDefined();
  });

  it('should export Logger', () => {
    expect(Logger).toBeDefined();
  });

  it('should export ConfigManager', () => {
    expect(ConfigManager).toBeDefined();
  });

  it('should export definePlugin', () => {
    expect(definePlugin).toBeDefined();
  });

  it('should export defineConnector', () => {
    expect(defineConnector).toBeDefined();
  });

  it('should export defineExtension', () => {
    expect(defineExtension).toBeDefined();
  });

  it('should export PLUGIN_LIFECYCLE', () => {
    expect(PLUGIN_LIFECYCLE).toBeDefined();
    expect(PLUGIN_LIFECYCLE.ACTIVE).toBe('active');
  });

  it('should export PLUGIN_STATUS', () => {
    expect(PLUGIN_STATUS).toBeDefined();
  });

  it('should export CONNECTOR_STATUS', () => {
    expect(CONNECTOR_STATUS).toBeDefined();
  });

  it('should export EVENT_NAMES', () => {
    expect(EVENT_NAMES).toBeDefined();
  });

  it('should export HOOK_NAMES', () => {
    expect(HOOK_NAMES).toBeDefined();
  });
});
