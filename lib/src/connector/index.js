/**
 * Connector SDK - Base class and helpers for building connectors
 */

import { CONNECTOR_STATUS } from '../core/constants.js';

export class BaseConnector {
  static protocol = 'rest';

  constructor(options = {}) {
    const { id, name, version } = options;
    this._status = CONNECTOR_STATUS.DISCONNECTED;
    this._config = {};
    this._id = id || this.constructor.name;
    this._name = name || this.constructor.name;
    this._version = version || '1.0.0';
  }

  get id() { return this._id; }
  get name() { return this._name; }
  get version() { return this._version; }
  get status() { return this._status; }
  get config() { return this._config; }

  async connect(config) {
    this._config = config;
    this._status = CONNECTOR_STATUS.CONNECTING;

    try {
      await this.onConnect(config);
      this._status = CONNECTOR_STATUS.CONNECTED;
      return this;
    } catch (error) {
      this._status = CONNECTOR_STATUS.ERROR;
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.onDisconnect();
    } finally {
      this._status = CONNECTOR_STATUS.DISCONNECTED;
      this._config = {};
    }
  }

  async test() {
    if (this._status !== CONNECTOR_STATUS.CONNECTED) {
      return false;
    }
    try {
      return await this.onTest();
    } catch {
      return false;
    }
  }

  getInfo() {
    return {
      id: this._id,
      name: this._name,
      version: this._version,
      protocol: /** @type {any} */ (this.constructor).protocol,
      status: this._status,
    };
  }

  async onConnect(config) {}
  async onDisconnect() {}
  async onTest() { return true; }
}

export class ConnectorRegistry {
  constructor({ storage }) {
    this._connectors = new Map();
    this._storage = storage;
  }

  register(ConnectorClass) {
    const id = ConnectorClass.name || ConnectorClass.id;
    if (this._connectors.has(id)) {
      throw new Error(`Connector "${id}" is already registered`);
    }
    this._connectors.set(id, ConnectorClass);
  }

  get(id) {
    return this._connectors.get(id);
  }

  async create(id, config) {
    const ConnectorClass = this._connectors.get(id);
    if (!ConnectorClass) {
      throw new Error(`Connector "${id}" not found`);
    }
    const connector = new ConnectorClass();
    await connector.connect(config);
    return connector;
  }

  list() {
    return Array.from(this._connectors.entries()).map(([id, Cls]) => ({
      id,
      name: Cls.name,
      protocol: /** @type {any} */ (Cls).protocol,
    }));
  }
}
