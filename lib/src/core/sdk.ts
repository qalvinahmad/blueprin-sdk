/**
 * Blueprin SDK - Main Entry Point
 */

import { PluginManager } from './plugin-manager.js';
import { EventBus } from './event-bus.js';
import { HookRegistry } from './hook-registry.js';
import { StorageAdapter } from './storage-adapter.js';
import { Logger } from './logger.js';
import { ConfigManager } from './config-manager.js';
import { ReportClient } from '../report/index.js';
import { PLUGIN_API_VERSION } from './constants.js';
import { ConnectorRegistry } from '../connector/index.js';
import { TelemetryManager } from '../telemetry/telemetry-manager.js';
import { WorkforceClient } from '../workforce/index.js';
import { ProjectClient } from '../project/index.js';
import { MaterialClient } from '../material/index.js';
import { RabClient } from '../rab/index.js';
import { ScheduleClient } from '../schedule/index.js';
import { MarketplaceClient } from '../marketplace/index.js';
import { AuthClient } from '../auth/index.js';

export class BlueprinSDK {
  private _logger: any;
  private _config: any;
  private _storage: any;
  private _eventBus: any;
  private _hookRegistry: any;
  private _pluginManager: any;
  private _report: any;
  private _connectors: any;
  private _workforce: any;
  private _projects: any;
  private _materials: any;
  private _rab: any;
  private _schedule: any;
  private _marketplace: any;
  private _auth: any;
  private _telemetry: any;
  private _initialized: any;

  constructor(options: any = {}) {
    const {
      appId = 'blueprin-app',
      supabaseUrl,
      supabaseKey,
      storagePrefix = 'blueprin_sdk',
      debug = false,
      supabaseClient,
      telemetryEnabled = true,
      // Backward-compatible aliases (used by main app plugin-host-context)
      apiUrl,
      config,
      logger: loggerOption,
    } = options;

    // Resolve backward-compatible config nesting
    const resolvedSupabaseUrl = supabaseUrl || config?.supabaseUrl;
    const resolvedSupabaseKey = supabaseKey || config?.supabaseAnonKey;
    const resolvedDebug = debug || config?.debug || false;

    // Logger prefix: use explicit prefix if provided, otherwise derive from appId
    const loggerPrefix = loggerOption?.prefix || `[BlueprinSDK:${appId}]`;
    this._logger = new Logger({ prefix: loggerPrefix, debug: resolvedDebug });
    this._config = new ConfigManager({ appId, storagePrefix });
    this._storage = new StorageAdapter({
      prefix: storagePrefix,
      supabaseClient,
      supabaseUrl: resolvedSupabaseUrl,
      supabaseKey: resolvedSupabaseKey,
    });
    this._eventBus = new EventBus({ logger: this._logger });
    this._hookRegistry = new HookRegistry({ logger: this._logger });
    this._telemetry = new TelemetryManager({
      logger: this._logger,
      appId,
      enabled: telemetryEnabled,
    });
    this._pluginManager = new PluginManager({
      sdk: this,
      eventBus: this._eventBus,
      hookRegistry: this._hookRegistry,
      storage: this._storage,
      logger: this._logger,
      config: this._config,
      telemetry: this._telemetry,
    });
    this._report = new ReportClient({
      hooks: this._hookRegistry,
      events: this._eventBus,
      logger: this._logger,
    });
    this._connectors = new ConnectorRegistry({
      storage: this._storage,
    });
    this._workforce = new WorkforceClient({
      storage: this._storage,
      hooks: this._hookRegistry,
      events: this._eventBus,
    });
    this._projects = new ProjectClient({
      storage: this._storage,
      hooks: this._hookRegistry,
      events: this._eventBus,
    });
    this._materials = new MaterialClient({
      storage: this._storage,
      hooks: this._hookRegistry,
      events: this._eventBus,
      supabaseClient,
    });
    this._rab = new RabClient({
      storage: this._storage,
      hooks: this._hookRegistry,
      events: this._eventBus,
      logger: this._logger,
    });
    this._schedule = new ScheduleClient({
      storage: this._storage,
      hooks: this._hookRegistry,
      events: this._eventBus,
    });
    this._marketplace = new MarketplaceClient({
      storage: this._storage,
      hooks: this._hookRegistry,
      events: this._eventBus,
      supabaseClient,
    });
    this._auth = new AuthClient({
      storage: this._storage,
      events: this._eventBus,
      supabaseClient,
    });
    this._initialized = false;
    this._setupLifecycleTelemetry();
  }

  _setupLifecycleTelemetry() {
    this._eventBus.on('blueprin:plugin:registered', (data) => {
      this._telemetry.track('plugin_registered', { pluginId: data.pluginId, manifest: data.manifest }, { pluginId: data.pluginId });
    });
    this._eventBus.on('blueprin:plugin:activated', (data) => {
      this._telemetry.track('plugin_activated', { pluginId: data.pluginId }, { pluginId: data.pluginId });
    });
    this._eventBus.on('blueprin:plugin:deactivated', (data) => {
      this._telemetry.track('plugin_deactivated', { pluginId: data.pluginId }, { pluginId: data.pluginId });
    });
    this._eventBus.on('blueprin:plugin:error', (data) => {
      this._telemetry.track('plugin_error', { pluginId: data.pluginId, error: data.error?.message || String(data.error) }, { pluginId: data.pluginId });
    });
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

  get telemetry() {
    return this._telemetry;
  }

  get reports() {
    return this._report;
  }

  get connectors() {
    return this._connectors;
  }

  get workforce() {
    return this._workforce;
  }

  get projects() {
    return this._projects;
  }

  get materials() {
    return this._materials;
  }

  get rab() {
    return this._rab;
  }

  get schedule() {
    return this._schedule;
  }

  get marketplace() {
    return this._marketplace;
  }

  get auth() {
    return this._auth;
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

  /**
   * Alias for init() — backward-compatible with main app calling sdk.initialize()
   */
  async initialize() {
    return this.init();
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
