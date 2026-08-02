/**
 * Plugin Manager - Handles plugin lifecycle, registration, and resolution
 */

import { PLUGIN_LIFECYCLE, STORAGE_KEYS } from './constants.js';

export class PluginManager {
  constructor({ sdk, eventBus, hookRegistry, storage, logger }) {
    this._sdk = sdk;
    this._eventBus = eventBus;
    this._hookRegistry = hookRegistry;
    this._storage = storage;
    this._logger = logger;
    this._plugins = new Map();
  }

  async init() {
    const stored = await this._storage.get(STORAGE_KEYS.PLUGINS);
    if (stored) {
      for (const [id, manifest] of Object.entries(stored)) {
        this._plugins.set(id, {
          manifest,
          status: PLUGIN_LIFECYCLE.REGISTERED,
          instance: null,
        });
      }
      this._logger.info(`Loaded ${this._plugins.size} plugins from storage`);
    }
  }

  async register(manifest) {
    const { id, name, version, activate } = manifest;

    if (!id || !name || !version || !activate) {
      throw new Error('Plugin must have id, name, version, and activate function');
    }

    if (this._plugins.has(id)) {
      throw new Error(`Plugin "${id}" is already registered`);
    }

    this._logger.info(`Registering plugin: ${name} v${version}`);

    const plugin = {
      manifest,
      status: PLUGIN_LIFECYCLE.REGISTERED,
      instance: null,
    };

    this._plugins.set(id, plugin);
    await this._persistPlugins();

    this._eventBus.emit('blueprin:plugin:registered', { pluginId: id, manifest });

    return plugin;
  }

  async activate(pluginId) {
    const plugin = this._plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    if (plugin.status === PLUGIN_LIFECYCLE.ACTIVE) {
      this._logger.warn(`Plugin "${pluginId}" is already active`);
      return plugin.instance;
    }

    plugin.status = PLUGIN_LIFECYCLE.INITIALIZING;
    this._eventBus.emit('blueprin:plugin:initializing', { pluginId });

    try {
      const context = this._createPluginContext(pluginId);
      plugin.instance = await plugin.manifest.activate(context);
      plugin.status = PLUGIN_LIFECYCLE.ACTIVE;

      this._eventBus.emit('blueprin:plugin:activated', { pluginId, instance: plugin.instance });
      this._logger.info(`Plugin "${pluginId}" activated`);

      return plugin.instance;
    } catch (error) {
      plugin.status = PLUGIN_LIFECYCLE.ERROR;
      this._eventBus.emit('blueprin:plugin:error', { pluginId, error });
      this._logger.error(`Plugin "${pluginId}" activation failed:`, error);
      throw error;
    }
  }

  async deactivate(pluginId) {
    const plugin = this._plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    if (plugin.status !== PLUGIN_LIFECYCLE.ACTIVE) {
      return;
    }

    try {
      if (plugin.manifest.deactivate) {
        await plugin.manifest.deactivate(plugin.instance);
      }

      plugin.status = PLUGIN_LIFECYCLE.SUSPENDED;
      plugin.instance = null;

      this._eventBus.emit('blueprin:plugin:deactivated', { pluginId });
      this._logger.info(`Plugin "${pluginId}" deactivated`);
    } catch (error) {
      this._logger.error(`Plugin "${pluginId}" deactivation failed:`, error);
      throw error;
    }
  }

  async remove(pluginId) {
    await this.deactivate(pluginId);
    this._plugins.delete(pluginId);
    await this._persistPlugins();

    this._eventBus.emit('blueprin:plugin:removed', { pluginId });
    this._logger.info(`Plugin "${pluginId}" removed`);
  }

  async activateAll() {
    for (const [id, plugin] of this._plugins) {
      if (plugin.status === PLUGIN_LIFECYCLE.REGISTERED) {
        try {
          await this.activate(id);
        } catch (error) {
          this._logger.error(`Failed to activate plugin "${id}":`, error);
        }
      }
    }
  }

  async destroyAll() {
    for (const [id, plugin] of this._plugins) {
      if (plugin.status === PLUGIN_LIFECYCLE.ACTIVE) {
        try {
          await this.deactivate(id);
        } catch (error) {
          this._logger.error(`Failed to deactivate plugin "${id}":`, error);
        }
      }
    }
  }

  get(pluginId) {
    return this._plugins.get(pluginId);
  }

  list() {
    return Array.from(this._plugins.entries()).map(([id, plugin]) => ({
      id,
      ...plugin.manifest,
      status: plugin.status,
    }));
  }

  has(pluginId) {
    return this._plugins.has(pluginId);
  }

  getActiveInstances() {
    const active = new Map();
    for (const [id, plugin] of this._plugins) {
      if (plugin.status === PLUGIN_LIFECYCLE.ACTIVE && plugin.instance) {
        active.set(id, plugin.instance);
      }
    }
    return active;
  }

  _createPluginContext(pluginId) {
    return {
      sdk: this._sdk,
      pluginId,
      hooks: this._hookRegistry.createScoped(pluginId),
      events: this._eventBus.createScoped(pluginId),
      storage: this._storage.createScoped(pluginId),
      logger: this._logger,
      config: this._config?.get(pluginId) ?? {},
    };
  }

  async _persistPlugins() {
    const data = {};
    for (const [id, plugin] of this._plugins) {
      data[id] = plugin.manifest;
    }
    await this._storage.set(STORAGE_KEYS.PLUGINS, data);
  }
}
