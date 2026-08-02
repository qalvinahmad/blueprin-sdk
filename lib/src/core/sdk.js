/**
 * Blueprin SDK - Main Entry Point
 */

import { PluginManager } from './plugin-manager.js';
import { EventBus } from './event-bus.js';
import { HookRegistry } from './hook-registry.js';
import { StorageAdapter } from './storage-adapter.js';
import { Logger } from './logger.js';
import { ConfigManager } from './config-manager.js';
import { PLUGIN_API_VERSION } from './constants.js';

export class BlueprinSDK {
  constructor(options = {}) {
    const {
      appId = 'blueprin-app',
      supabaseUrl,
      supabaseKey,
      storagePrefix = 'blueprin_sdk',
      debug = false,
      supabaseClient,
    } = options;

    this._logger = new Logger({ prefix: `[BlueprinSDK:${appId}]`, debug });
    this._config = new ConfigManager({ appId, storagePrefix });
    this._storage = new StorageAdapter({
      prefix: storagePrefix,
      supabaseClient,
      supabaseUrl,
      supabaseKey,
    });
    this._eventBus = new EventBus({ logger: this._logger });
    this._hookRegistry = new HookRegistry({ logger: this._logger });
    this._pluginManager = new PluginManager({
      sdk: this,
      eventBus: this._eventBus,
      hookRegistry: this._hookRegistry,
      storage: this._storage,
      logger: this._logger,
      config: this._config,
    });
    this._initialized = false;
  }

  get version() {
    return PLUGIN_API_VERSION;
  }

  get plugins() {
    return this._pluginManager;
  }

  get events() {
    return this._eventBus;
  }

  get hooks() {
    return this._hookRegistry;
  }

  get storage() {
    return this._storage;
  }

  get config() {
    return this._config;
  }

  get logger() {
    return this._logger;
  }

  async init() {
    if (this._initialized) {
      this._logger.warn('SDK already initialized');
      return;
    }

    this._logger.info('Initializing Blueprin SDK v' + PLUGIN_API_VERSION);

    await this._storage.init();
    await this._config.init();
    await this._pluginManager.init();

    this._initialized = true;
    this._logger.info('SDK initialized successfully');
  }

  async destroy() {
    if (!this._initialized) return;

    this._logger.info('Destroying SDK');

    await this._pluginManager.destroyAll();
    this._eventBus.removeAllListeners();
    this._hookRegistry.clear();

    this._initialized = false;
    this._logger.info('SDK destroyed');
  }

  getInfo() {
    return {
      version: PLUGIN_API_VERSION,
      plugins: this._pluginManager.list().length,
      hooks: this._hookRegistry.count(),
      events: this._eventBus.listenerCount(),
      initialized: this._initialized,
    };
  }
}
