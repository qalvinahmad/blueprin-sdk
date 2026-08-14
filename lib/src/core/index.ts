/**
 * Blueprin SDK - Core Plugin System
 *
 * This module provides the foundation for building plugins,
 * connectors, extensions and integrations for Blueprin.
 */

export { BlueprinSDK } from './sdk.js';
export { PluginManager } from './plugin-manager.js';
export { EventBus } from './event-bus.js';
export { HookRegistry } from './hook-registry.js';
export { StorageAdapter } from './storage-adapter.js';
export { Logger } from './logger.js';
export { ConfigManager } from './config-manager.js';
export { TelemetryManager } from '../telemetry/index.js';

export {
  definePlugin,
  defineConnector,
  defineExtension,
} from './plugin-def.js';

export {
  PLUGIN_LIFECYCLE,
  PLUGIN_STATUS,
  CONNECTOR_STATUS,
  EVENT_NAMES,
  HOOK_NAMES,
} from './constants.js';
