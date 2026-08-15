/**
 * Connector SDK - Base class and real implementations for domain connectors.
 *
 * Each connector follows the BaseConnector lifecycle:
 *   connect(config) → onConnect(config) → CONNECTED
 *   disconnect() → onDisconnect() → DISCONNECTED
 *   test() → onTest() → boolean
 *
 * Config is stored per-connector and can be persisted via StorageAdapter.
 */

import { CONNECTOR_STATUS } from '../core/constants.js';

// ── Base Connector ───────────────────────────────────────────

export class BaseConnector {
  private _id: any;
  private _name: any;
  private _version: any;
  private _config: any;
  private _status: any;
  private _logger: any;
  static protocol = 'rest';

  constructor(options: any = {}) {
    const { id, name, version, logger } = options;
    this._status = CONNECTOR_STATUS.DISCONNECTED;
    this._config = {};
    this._id = id || this.constructor.name;
    this._name = name || this.constructor.name;
    this._version = version || '1.0.0';
    this._logger = logger;
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
      this._logger?.info?.(`Connector "${this._id}" connected`);
      return this;
    } catch (error) {
      this._status = CONNECTOR_STATUS.ERROR;
      this._logger?.error?.(`Connector "${this._id}" connect failed:`, error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.onDisconnect();
      this._logger?.info?.(`Connector "${this._id}" disconnected`);
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

  async _request(method, path, body, options = {}) {
    const baseUrl = this._config.baseUrl || this._config.apiUrl;
    if (!baseUrl) throw new Error('baseUrl not configured');

    const url = `${baseUrl}${path}`;
    const headers = {
      'Content-Type': 'application/json',
      ...this._buildAuthHeaders(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: options.timeout ? AbortSignal.timeout(options.timeout) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  _buildAuthHeaders() {
    const token = this._config.apiKey || this._config.token || this._config.accessToken;
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
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

// ── Connector Registry ───────────────────────────────────────

export class ConnectorRegistry {
  private _connectors: any;
  private _instances: any;
  private _storage: any;

  constructor({ storage }) {
    this._connectors = new Map();
    this._instances = new Map();
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
      throw new Error(`Connector "${id}" not found. Register it first with registry.register(MyConnector).`);
    }
    const connector = new ConnectorClass({ logger: this._logger });
    await connector.connect(config);
    this._instances.set(id, connector);
    return connector;
  }

  getInstance(id) {
    return this._instances.get(id) || null;
  }

  list() {
    return Array.from(this._connectors.entries()).map(([id, Cls]: any) => ({
      id,
      name: Cls.name,
      protocol: (Cls as any).protocol,
      type: (Cls as any).type,
    }));
  }

  async disconnectAll() {
    for (const [id, instance] of this._instances) {
      try {
        await instance.disconnect();
      } catch {
        // best effort
      }
    }
    this._instances.clear();
  }
}

// ── Accounting Connector ─────────────────────────────────────

export class AccountingConnector extends BaseConnector {
  static type = 'accounting';

  /**
   * Get account balances from the connected accounting system.
   * @returns {Promise<{account: string, name: string, balance: number, currency: string}[]>}
   */
  async getAccountBalances() {
    const data = await this._request('GET', '/api/accounts/balances');
    return data.accounts || data;
  }

  /**
   * Create a journal entry in the accounting system.
   * @param {object} entry - { date, description, lines: [{account, debit, credit}] }
   * @returns {Promise<object>} Created entry
   */
  async createJournalEntry(entry) {
    return this._request('POST', '/api/journal-entries', entry);
  }

  /**
   * Sync invoices between Blueprin and the accounting system.
   * @param {object} options - { startDate, endDate, direction: 'push'|'pull' }
   * @returns {Promise<{synced: number, errors: string[]}>}
   */
  async syncInvoices(options = {}) {
    return this._request('POST', '/api/invoices/sync', options);
  }

  /**
   * Get chart of accounts.
   */
  async getChartOfAccounts() {
    const data = await this._request('GET', '/api/accounts');
    return data.accounts || data;
  }

  /**
   * Create a bill/invoice.
   */
  async createBill(bill) {
    return this._request('POST', '/api/bills', bill);
  }

  /**
   * Get trial balance for a period.
   */
  async getTrialBalance(period) {
    return this._request('GET', `/api/reports/trial-balance?period=${period}`);
  }
}

// ── Messaging Connector ──────────────────────────────────────

export class MessagingConnector extends BaseConnector {
  static type = 'messaging';

  /**
   * Send a text message.
   * @param {string} to - Recipient phone/email
   * @param {string} message - Text content
   * @returns {Promise<{success: boolean, messageId: string}>}
   */
  async sendMessage(to, message) {
    return this._request('POST', '/api/messages', { to, message });
  }

  /**
   * Send a template message (WhatsApp, SMS, Email).
   * @param {string} to - Recipient
   * @param {string} templateId - Template identifier
   * @param {object} data - Template variables
   */
  async sendTemplate(to, templateId, data = {}) {
    return this._request('POST', '/api/messages/template', { to, templateId, data });
  }

  /**
   * Send bulk messages.
   */
  async sendBulk(recipients, message) {
    return this._request('POST', '/api/messages/bulk', { recipients, message });
  }

  /**
   * Get message delivery status.
   */
  async getStatus(messageId) {
    return this._request('GET', `/api/messages/${messageId}/status`);
  }
}

// ── Bank Connector ───────────────────────────────────────────

export class BankConnector extends BaseConnector {
  static type = 'bank';

  /**
   * Get bank mutations/transactions (mutasi rekening).
   * @param {string} accountId - Account identifier
   * @param {string} startDate - ISO date
   * @param {string} endDate - ISO date
   * @returns {Promise<{transactions: object[]}>}
   */
  async getMutasi(accountId, startDate, endDate) {
    return this._request('GET', `/api/accounts/${accountId}/mutations?start=${startDate}&end=${endDate}`);
  }

  /**
   * Create a transfer.
   * @param {object} transferData - { fromAccount, toAccount, amount, notes, reference }
   * @returns {Promise<{transferId: string, status: string}>}
   */
  async createTransfer(transferData) {
    return this._request('POST', '/api/transfers', transferData);
  }

  /**
   * Get account balance.
   */
  async getBalance(accountId) {
    return this._request('GET', `/api/accounts/${accountId}/balance`);
  }

  /**
   * Get list of accounts.
   */
  async getAccounts() {
    return this._request('GET', '/api/accounts');
  }

  /**
   * Verify a virtual account number.
   */
  async verifyVA(vaNumber) {
    return this._request('GET', `/api/virtual-accounts/${vaNumber}/verify`);
  }
}

// ── Supplier Connector ───────────────────────────────────────

export class SupplierConnector extends BaseConnector {
  static type = 'supplier';

  /**
   * Get supplier product catalog.
   * @returns {Promise<{products: object[]}>}
   */
  async getCatalog() {
    return this._request('GET', '/api/catalog');
  }

  /**
   * Submit a purchase order to supplier.
   * @param {object} poData - { items, deliveryAddress, deadline, notes }
   * @returns {Promise<{orderId: string, status: string}>}
   */
  async submitPurchaseOrder(poData) {
    return this._request('POST', '/api/purchase-orders', poData);
  }

  /**
   * Check order status.
   * @param {string} orderId
   * @returns {Promise<object>}
   */
  async checkOrderStatus(orderId) {
    return this._request('GET', `/api/purchase-orders/${orderId}`);
  }

  /**
   * Get delivery tracking.
   */
  async getTracking(orderId) {
    return this._request('GET', `/api/purchase-orders/${orderId}/tracking`);
  }

  /**
   * Submit a RFQ (Request for Quotation).
   */
  async submitRFQ(rfqData) {
    return this._request('POST', '/api/rfqs', rfqData);
  }

  /**
   * Get supplier info/verification.
   */
  async getSupplierInfo() {
    return this._request('GET', '/api/supplier/info');
  }
}

// ── BPJS Connector (Indonesian Social Security) ──────────────

export class BPJSConnector extends BaseConnector {
  static type = 'bpjs';

  /**
   * Get BPJS contribution history for employees.
   * @param {string} period - YYYYMM format
   * @returns {Promise<{employees: object[]}>}
   */
  async getContributions(period) {
    return this._request('GET', `/api/bpjs/contributions?period=${period}`);
  }

  /**
   * Get BPJS claim status.
   */
  async getClaimStatus(claimId) {
    return this._request('GET', `/api/bpjs/claims/${claimId}`);
  }

  /**
   * Register new employee for BPJS.
   */
  async registerEmployee(employee) {
    return this._request('POST', '/api/bpjs/employees', employee);
  }

  /**
   * Get BPJS balance/remaining quota.
   */
  async getBalance() {
    return this._request('GET', '/api/bpjs/balance');
  }

  /**
   * Get available BPJS healthcare facilities (faskes).
   */
  async getFaskes(city) {
    return this._request('GET', `/api/bpjs/faskes?city=${city}`);
  }
}
