/**
 * Plugin Manager - Handles plugin lifecycle, registration, and resolution
 */

import { PLUGIN_LIFECYCLE, STORAGE_KEYS } from './constants.js';

export class PluginManager {
  private _sdk: any;
  private _eventBus: any;
  private _hookRegistry: any;
  private _storage: any;
  private _logger: any;
  private _config: any;
  private _plugins: any;
  private _uiSlots: any;
  private _uiPages: any;
  constructor({ sdk, eventBus, hookRegistry, storage, logger, config }) {
    this._sdk = sdk;
    this._eventBus = eventBus;
    this._hookRegistry = hookRegistry;
    this._storage = storage;
    this._logger = logger;
    this._config = config;
    this._plugins = new Map();
    this._uiSlots = new Map();
    this._uiPages = new Map();
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

    await this._eventBus.emit('blueprin:plugin:registered', { pluginId: id, manifest });

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

    // Check dependencies
    const dependencies = plugin.manifest.dependencies || [];
    for (const dep of dependencies) {
      const depId = typeof dep === 'string' ? dep : dep.id;
      const depPlugin = this._plugins.get(depId);
      if (!depPlugin || depPlugin.status !== PLUGIN_LIFECYCLE.ACTIVE) {
        throw new Error(`Plugin "${pluginId}" requires dependency "${depId}" which is not active`);
      }
    }

    plugin.status = PLUGIN_LIFECYCLE.INITIALIZING;
    await this._eventBus.emit('blueprin:plugin:initializing', { pluginId });

    try {
      const context = this._createPluginContext(pluginId);
      plugin.instance = await plugin.manifest.activate(context);
      plugin.status = PLUGIN_LIFECYCLE.ACTIVE;

      await this._eventBus.emit('blueprin:plugin:activated', { pluginId, instance: plugin.instance });
      this._logger.info(`Plugin "${pluginId}" activated`);

      return plugin.instance;
    } catch (error) {
      plugin.status = PLUGIN_LIFECYCLE.ERROR;
      await this._eventBus.emit('blueprin:plugin:error', { pluginId, error });
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

      // Automatic memory cleanup
      this._eventBus.removePluginListeners(pluginId);
      this._hookRegistry.removePluginHooks(pluginId);

      plugin.status = PLUGIN_LIFECYCLE.SUSPENDED;
      plugin.instance = null;

      await this._eventBus.emit('blueprin:plugin:deactivated', { pluginId });
      this._logger.info(`Plugin "${pluginId}" deactivated (listeners & hooks cleaned up)`);
    } catch (error) {
      this._logger.error(`Plugin "${pluginId}" deactivation failed:`, error);
      throw error;
    }
  }

  async remove(pluginId) {
    await this.deactivate(pluginId);
    this._plugins.delete(pluginId);
    await this._persistPlugins();

    await this._eventBus.emit('blueprin:plugin:removed', { pluginId });
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

  async submitToMarketplace(pluginId) {
    const plugin = this._plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin "${pluginId}" not found`);
    }

    const { manifest } = plugin;
    
    // Strict validation for marketplace
    if (!manifest.author || !manifest.description) {
      throw new Error(`Marketplace submission rejected: "author" and "description" are required in manifest`);
    }

    const payload = {
      manifest,
      submittedAt: new Date().toISOString(),
    };

    // Allow hooks to append data or sign the payload
    const finalPayload = await this._hookRegistry.executeBefore('blueprin:before:plugin:submit', payload);

    this._logger.info(`Submitting plugin ${pluginId} to marketplace`);
    this._eventBus.emit('blueprin:marketplace:plugin:submitted', finalPayload);

    return finalPayload;
  }

  get(pluginId) {
    return this._plugins.get(pluginId);
  }

  list() {
    return Array.from(this._plugins.entries()).map(([id, plugin]: any) => ({
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

  getUiComponents(type = 'all') {
    const sortedSlots: any[] = [];
    const sortedPages: any[] = [];
    const connectors: any[] = [];
    const components: any = {
      menus: [],
      panels: [],
      widgets: [],
    };

    for (const [id, plugin] of this._plugins) {
      if (plugin.status === PLUGIN_LIFECYCLE.ACTIVE && plugin.manifest.ui) {
        const { menus = [], panels = [], widgets = [] } = plugin.manifest.ui;
        
        menus.forEach(m => components.menus.push({ ...m, pluginId: id }));
        panels.forEach(p => components.panels.push({ ...p, pluginId: id }));
        widgets.forEach(w => components.widgets.push({ ...w, pluginId: id }));
      }
    }

    if (type === 'all') return components;
    return components[type] || [];
  }

  getUiSlot(slotName) {
    return this._uiSlots.get(slotName) || [];
  }

  getUiPages() {
    return Array.from(this._uiPages.entries()).map(([route, config]: any) => ({
      route,
      ...config
    }));
  }

  _createPluginContext(pluginId) {
    const plugin = this._plugins.get(pluginId);
    const permissions = plugin?.manifest?.permissions || [];

    const hooksScoped = this._hookRegistry.createScoped(pluginId);
    const eventsScoped = this._eventBus.createScoped(pluginId);
    const storageScoped = this._storage.createScoped(pluginId);

    const secureStorage = {
      get: async (key) => {
        if (!permissions.includes('storage:read')) throw new Error('Permission denied: "storage:read" required');
        return storageScoped.get(key);
      },
      has: async (key) => {
        if (!permissions.includes('storage:read')) throw new Error('Permission denied: "storage:read" required');
        return storageScoped.has(key);
      },
      set: async (key, value, options) => {
        if (!permissions.includes('storage:write')) throw new Error('Permission denied: "storage:write" required');
        return storageScoped.set(key, value, options);
      },
      remove: async (key, options) => {
        if (!permissions.includes('storage:write')) throw new Error('Permission denied: "storage:write" required');
        return storageScoped.remove(key, options);
      },
    };

    const secureEvents = {
      on: (event, callback) => {
        if (!permissions.includes('events:listen')) throw new Error('Permission denied: "events:listen" required');
        return eventsScoped.on(event, callback);
      },
      emit: (event, data) => {
        if (!permissions.includes('events:emit')) throw new Error('Permission denied: "events:emit" required');
        return eventsScoped.emit(event, data);
      },
    };

    const secureHooks = {
      register: (hookName, callback, options) => {
        if (!permissions.includes('hooks:register')) throw new Error('Permission denied: "hooks:register" required');
        return hooksScoped.register(hookName, callback, options);
      },
      unregister: (hookName, callback) => hooksScoped.unregister(hookName, callback),
      execute: (hookName, context) => hooksScoped.execute(hookName, context),
      executeBefore: (hookName, context) => hooksScoped.executeBefore(hookName, context),
      executeAfter: (hookName, context) => hooksScoped.executeAfter(hookName, context),
    };

    const secureUi = {
      registerSlot: (slotName, component) => {
        if (!permissions.includes('ui:inject')) throw new Error('Permission denied: "ui:inject" required');
        
        if (!this._uiSlots.has(slotName)) {
          this._uiSlots.set(slotName, []);
        }
        this._uiSlots.get(slotName).push({ pluginId, component });
        this._logger.info(`Plugin "${pluginId}" registered component to slot "${slotName}"`);
      },
      addPage: (route, component, options: any = {}) => {
        if (!permissions.includes('ui:inject')) throw new Error('Permission denied: "ui:inject" required');
        
        this._uiPages.set(route, { pluginId, component, ...options });
        this._logger.info(`Plugin "${pluginId}" added page route "${route}"`);
      }
    };

    return {
      sdk: this._sdk,
      pluginId,
      hooks: secureHooks,
      events: secureEvents,
      storage: secureStorage,
      ui: secureUi,
      logger: this._logger,
      config: this._config?.getAll() ?? {},
    };
  }

  async _persistPlugins() {
    const data: Record<string, any> = {};
    for (const [id, plugin] of this._plugins) {
      const serializable: Record<string, any> = {};
      for (const [key, value] of Object.entries(plugin.manifest)) {
        if (typeof value !== 'function') {
          serializable[key] = value;
        }
      }
      data[id] = serializable;
    }
    await this._storage.set(STORAGE_KEYS.PLUGINS, data);
  }
}
