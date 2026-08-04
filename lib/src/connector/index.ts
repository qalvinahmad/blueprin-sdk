/**
 * Connector SDK - Base class and helpers for building connectors
 */

import { CONNECTOR_STATUS } from '../core/constants.js';

export class BaseConnector {
  private _id: any;
  private _name: any;
  private _version: any;
  private _config: any;
  private _status: any;
  static protocol = 'rest';

  constructor(options: any = {}) {
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
      protocol: (this.constructor as any).protocol,
      status: this._status,
    };
  }

  async onConnect(config) {}
  async onDisconnect() {}
  async onTest() { return true; }
}

export class ConnectorRegistry {
  private _connectors: any;
  private _storage: any;
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
    return Array.from(this._connectors.entries()).map(([id, Cls]: any) => ({
      id,
      name: Cls.name,
      protocol: /** @type {any} */ (Cls).protocol,
    }));
  }
}

/**
 * Specialized Base Connectors for specific domains
 */

export class AccountingConnector extends BaseConnector {
  static type = 'accounting';
  
  async getAccountBalances() { throw new Error('Not implemented'); }
  async createJournalEntry(entry) { throw new Error('Not implemented'); }
  async syncInvoices() { throw new Error('Not implemented'); }
}

export class MessagingConnector extends BaseConnector {
  static type = 'messaging';
  
  async sendMessage(to, message) { throw new Error('Not implemented'); }
  async sendTemplate(to, templateId, data) { throw new Error('Not implemented'); }
}

export class BankConnector extends BaseConnector {
  static type = 'bank';
  
  async getMutasi(accountId, startDate, endDate) { throw new Error('Not implemented'); }
  async createTransfer(transferData) { throw new Error('Not implemented'); }
}

export class SupplierConnector extends BaseConnector {
  static type = 'supplier';
  
  async getCatalog() { throw new Error('Not implemented'); }
  async submitPurchaseOrder(poData) { throw new Error('Not implemented'); }
  async checkOrderStatus(orderId) { throw new Error('Not implemented'); }
}
