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
  static type = 'base';

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

  async connect(config: any = {}) {
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

  async _request(method: string, path: string, body?: any, options: any = {}) {
    const baseUrl = this._config.baseUrl || this._config.apiUrl;
    if (!baseUrl) throw new Error('baseUrl not configured');

    const url = `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
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

  _buildAuthHeaders(): Record<string, string> {
    const token = this._config.apiKey || this._config.token || this._config.accessToken || this._config.apiToken;
    if (token) return { Authorization: `Bearer ${token}` };
    return {};
  }

  getInfo() {
    return {
      id: this._id,
      name: this._name,
      version: this._version,
      protocol: (this.constructor as any).protocol,
      type: (this.constructor as any).type,
      status: this._status,
    };
  }

  async onConnect(_config: any) {}
  async onDisconnect() {}
  async onTest() { return true; }
}

// ── 1. Google Calendar Connector ─────────────────────────────

export class GoogleCalendarConnector extends BaseConnector {
  static type = 'google';

  async createEvent(eventData: { summary: string; description?: string; start: string; end: string; attendees?: string[]; location?: string }) {
    return this._request('POST', '/api/calendar/google/events', eventData);
  }

  async listEvents(params: { timeMin?: string; timeMax?: string; maxResults?: number } = {}) {
    const query = new URLSearchParams(params as any).toString();
    return this._request('GET', `/api/calendar/google/events${query ? `?${query}` : ''}`);
  }

  async deleteEvent(eventId: string) {
    return this._request('DELETE', `/api/calendar/google/events/${eventId}`);
  }

  async syncSchedule(scheduleTasks: any[]) {
    return this._request('POST', '/api/calendar/google/sync', { tasks: scheduleTasks });
  }
}

// ── 2. Notion Connector ──────────────────────────────────────

export class NotionConnector extends BaseConnector {
  static type = 'notion';

  async queryDatabase(databaseId: string, filter?: any, sorts?: any[]) {
    return this._request('POST', `/api/notion/databases/${databaseId}/query`, { filter, sorts });
  }

  async createPage(pageData: { parentDatabaseId: string; properties: Record<string, any>; children?: any[] }) {
    return this._request('POST', '/api/notion/pages', pageData);
  }

  async updatePage(pageId: string, properties: Record<string, any>) {
    return this._request('PATCH', `/api/notion/pages/${pageId}`, { properties });
  }

  async syncRAB(databaseId: string, rabItems: any[]) {
    return this._request('POST', '/api/notion/sync-rab', { databaseId, items: rabItems });
  }
}

// ── 3. WhatsApp / Messaging Connector ─────────────────────────

export class WhatsAppConnector extends BaseConnector {
  static type = 'whatsapp';

  async sendMessage(to: string, message: string) {
    return this._request('POST', '/api/messages/whatsapp/send', { to, message });
  }

  async sendTemplate(to: string, templateId: string, data: Record<string, any> = {}) {
    return this._request('POST', '/api/messages/whatsapp/template', { to, templateId, data });
  }

  async sendMedia(to: string, mediaUrl: string, mediaType: string = 'document', caption?: string) {
    return this._request('POST', '/api/messages/whatsapp/media', { to, mediaUrl, mediaType, caption });
  }

  async sendBulk(recipients: string[], message: string) {
    return this._request('POST', '/api/messages/whatsapp/bulk', { recipients, message });
  }

  async getStatus(messageId: string) {
    return this._request('GET', `/api/messages/whatsapp/status/${messageId}`);
  }
}

// Legacy Alias for WhatsAppConnector
export class MessagingConnector extends WhatsAppConnector {
  static type = 'messaging';
}

// ── 4. Telegram Connector ────────────────────────────────────

export class TelegramConnector extends BaseConnector {
  static type = 'telegram';

  async sendMessage(chatId: string, text: string, options: any = {}) {
    return this._request('POST', '/api/integrations/telegram/send', { chatId, text, ...options });
  }

  async sendPhoto(chatId: string, photoUrl: string, caption?: string) {
    return this._request('POST', '/api/integrations/telegram/photo', { chatId, photoUrl, caption });
  }

  async sendDocument(chatId: string, documentUrl: string, caption?: string) {
    return this._request('POST', '/api/integrations/telegram/document', { chatId, documentUrl, caption });
  }

  async broadcast(channelId: string, message: string) {
    return this._request('POST', '/api/integrations/telegram/broadcast', { channelId, message });
  }
}

// ── 5. Discord Connector ─────────────────────────────────────

export class DiscordConnector extends BaseConnector {
  static type = 'discord';

  async sendWebhook(webhookUrl: string, payload: { content?: string; username?: string; embeds?: any[] }) {
    return this._request('POST', '/api/integrations/discord/webhook', { webhookUrl, ...payload });
  }

  async notifyProjectMilestone(webhookUrl: string, projectData: { projectName: string; milestone: string; progress: number }) {
    return this._request('POST', '/api/integrations/discord/milestone', { webhookUrl, ...projectData });
  }
}

// ── 6. Microsoft Teams Connector ─────────────────────────────

export class TeamsConnector extends BaseConnector {
  static type = 'teams';

  async sendCard(webhookUrl: string, cardData: { title: string; text: string; sections?: any[]; potentialAction?: any[] }) {
    return this._request('POST', '/api/integrations/teams/card', { webhookUrl, ...cardData });
  }

  async notifyMeeting(webhookUrl: string, meetingData: { title: string; joinUrl: string; startTime: string }) {
    return this._request('POST', '/api/integrations/teams/meeting-notify', { webhookUrl, ...meetingData });
  }
}

// ── 7. Slack Connector ───────────────────────────────────────

export class SlackConnector extends BaseConnector {
  static type = 'slack';

  async sendMessage(channelOrWebhook: string, payload: { text: string; blocks?: any[]; attachments?: any[] }) {
    return this._request('POST', '/api/integrations/slack/send', { channel: channelOrWebhook, ...payload });
  }

  async notifyOrderApproval(channelOrWebhook: string, orderData: { orderId: string; supplierName: string; totalAmount: number }) {
    return this._request('POST', '/api/integrations/slack/order-approval', { channel: channelOrWebhook, ...orderData });
  }
}

// ── 8. Zoom Connector ────────────────────────────────────────

export class ZoomConnector extends BaseConnector {
  static type = 'zoom';

  async createMeeting(meetingData: { topic: string; duration?: number; startTime?: string; agenda?: string }) {
    return this._request('POST', '/api/integrations/zoom/create-meeting', meetingData);
  }

  async getMeeting(meetingId: string) {
    return this._request('GET', `/api/integrations/zoom/meetings/${meetingId}`);
  }

  async listMeetings(userId: string = 'me') {
    return this._request('GET', `/api/integrations/zoom/users/${userId}/meetings`);
  }

  async deleteMeeting(meetingId: string) {
    return this._request('DELETE', `/api/integrations/zoom/meetings/${meetingId}`);
  }
}

// ── 9. Jira Connector ────────────────────────────────────────

export class JiraConnector extends BaseConnector {
  static type = 'jira';

  async createIssue(issueData: { projectKey: string; summary: string; description?: string; issueType?: string; priority?: string }) {
    return this._request('POST', '/api/integrations/jira/create-ticket', issueData);
  }

  async getIssue(issueKey: string) {
    return this._request('GET', `/api/integrations/jira/issues/${issueKey}`);
  }

  async updateIssue(issueKey: string, fields: Record<string, any>) {
    return this._request('PUT', `/api/integrations/jira/issues/${issueKey}`, { fields });
  }

  async syncTasks(projectKey: string, tasks: any[]) {
    return this._request('POST', '/api/integrations/jira/sync-tasks', { projectKey, tasks });
  }
}

// ── 10. Linear Connector ─────────────────────────────────────

export class LinearConnector extends BaseConnector {
  static type = 'linear';

  async createIssue(issueData: { teamId: string; title: string; description?: string; priority?: number; estimate?: number }) {
    return this._request('POST', '/api/integrations/linear/create-issue', issueData);
  }

  async getIssue(issueId: string) {
    return this._request('GET', `/api/integrations/linear/issues/${issueId}`);
  }

  async updateIssue(issueId: string, input: Record<string, any>) {
    return this._request('PATCH', `/api/integrations/linear/issues/${issueId}`, input);
  }

  async syncMilestones(teamId: string, milestones: any[]) {
    return this._request('POST', '/api/integrations/linear/sync-milestones', { teamId, milestones });
  }
}

// ── 11. Microsoft OneDrive Connector ─────────────────────────

export class OneDriveConnector extends BaseConnector {
  static type = 'onedrive';

  async uploadFile(folderPath: string, fileName: string, fileContent: string) {
    return this._request('POST', '/api/integrations/onedrive/upload', { folderPath, fileName, fileContent });
  }

  async downloadFile(fileId: string) {
    return this._request('GET', `/api/integrations/onedrive/files/${fileId}`);
  }

  async createFolder(parentPath: string, folderName: string) {
    return this._request('POST', '/api/integrations/onedrive/create-folder', { parentPath, folderName });
  }

  async listFiles(folderPath: string = 'Blueprin Projects') {
    return this._request('GET', `/api/integrations/onedrive/list?path=${encodeURIComponent(folderPath)}`);
  }

  async backupRAB(fileName: string, rabData: any) {
    return this._request('POST', '/api/integrations/onedrive/backup-rab', { fileName, rabData });
  }
}

// ── 12. Confluence Connector ─────────────────────────────────

export class ConfluenceConnector extends BaseConnector {
  static type = 'confluence';

  async createPage(pageData: { spaceKey: string; title: string; content: string; parentId?: string }) {
    return this._request('POST', '/api/integrations/confluence/create-page', pageData);
  }

  async updatePage(pageId: string, pageData: { title: string; content: string; version: number }) {
    return this._request('PUT', `/api/integrations/confluence/pages/${pageId}`, pageData);
  }

  async getPage(pageId: string) {
    return this._request('GET', `/api/integrations/confluence/pages/${pageId}`);
  }

  async exportRABDocumentation(spaceKey: string, rabReport: any) {
    return this._request('POST', '/api/integrations/confluence/export-rab', { spaceKey, rabReport });
  }
}

// ── 13. Miro Connector ───────────────────────────────────────

export class MiroConnector extends BaseConnector {
  static type = 'miro';

  async createBoard(boardData: { name: string; description?: string }) {
    return this._request('POST', '/api/integrations/miro/create-board', { boardName: boardData.name, description: boardData.description });
  }

  async createCard(boardId: string, cardData: { title: string; description?: string; x?: number; y?: number }) {
    return this._request('POST', `/api/integrations/miro/boards/${boardId}/cards`, cardData);
  }

  async createStickyNote(boardId: string, noteData: { content: string; color?: string; x?: number; y?: number }) {
    return this._request('POST', `/api/integrations/miro/boards/${boardId}/sticky-notes`, noteData);
  }

  async syncWBS(boardId: string, wbsNodes: any[]) {
    return this._request('POST', `/api/integrations/miro/boards/${boardId}/sync-wbs`, { nodes: wbsNodes });
  }
}

// ── 14. Accounting Connector ─────────────────────────────────

export class AccountingConnector extends BaseConnector {
  static type = 'accounting';

  async getAccountBalances() {
    const data = await this._request('GET', '/api/accounts/balances');
    return data.accounts || data;
  }

  async createJournalEntry(entry: any) {
    return this._request('POST', '/api/journal-entries', entry);
  }

  async syncInvoices(options = {}) {
    return this._request('POST', '/api/invoices/sync', options);
  }

  async getChartOfAccounts() {
    const data = await this._request('GET', '/api/accounts');
    return data.accounts || data;
  }

  async createBill(bill: any) {
    return this._request('POST', '/api/bills', bill);
  }

  async getTrialBalance(period: string) {
    return this._request('GET', `/api/reports/trial-balance?period=${period}`);
  }
}

// ── 15. Bank Connector ───────────────────────────────────────

export class BankConnector extends BaseConnector {
  static type = 'bank';

  async getMutasi(accountId: string, startDate: string, endDate: string) {
    return this._request('GET', `/api/accounts/${accountId}/mutations?start=${startDate}&end=${endDate}`);
  }

  async createTransfer(transferData: any) {
    return this._request('POST', '/api/transfers', transferData);
  }

  async getBalance(accountId: string) {
    return this._request('GET', `/api/accounts/${accountId}/balance`);
  }

  async getAccounts() {
    return this._request('GET', '/api/accounts');
  }

  async verifyVA(vaNumber: string) {
    return this._request('GET', `/api/virtual-accounts/${vaNumber}/verify`);
  }
}

// ── 16. Supplier Connector ───────────────────────────────────

export class SupplierConnector extends BaseConnector {
  static type = 'supplier';

  async getCatalog() {
    return this._request('GET', '/api/catalog');
  }

  async submitPurchaseOrder(poData: any) {
    return this._request('POST', '/api/purchase-orders', poData);
  }

  async checkOrderStatus(orderId: string) {
    return this._request('GET', `/api/purchase-orders/${orderId}`);
  }

  async getTracking(orderId: string) {
    return this._request('GET', `/api/purchase-orders/${orderId}/tracking`);
  }

  async submitRFQ(rfqData: any) {
    return this._request('POST', '/api/rfqs', rfqData);
  }

  async getSupplierInfo() {
    return this._request('GET', '/api/supplier/info');
  }
}

// ── 17. BPJS Connector (Insurance Health & Social Security Indonesia) ────
// BPJS = Badan Penyelenggara Jaminan Sosial
// Integrates with BPJS Kesehatan (Health) and BPJS Ketenagakerjaan (Employment)
// Use case: construction companies managing worker health insurance & claims
// Note: Indonesia-specific; for international insurance use generic connector

export class BPJSConnector extends BaseConnector {
  static type = 'bpjs';

  async getContributions(period: string) {
    return this._request('GET', `/api/bpjs/contributions?period=${period}`);
  }

  async getClaimStatus(claimId: string) {
    return this._request('GET', `/api/bpjs/claims/${claimId}`);
  }

  async registerEmployee(employee: any) {
    return this._request('POST', '/api/bpjs/employees', employee);
  }

  async getBalance() {
    return this._request('GET', '/api/bpjs/balance');
  }

  async getFaskes(city: string) {
    return this._request('GET', `/api/bpjs/faskes?city=${city}`);
  }
}

// ── Connector Registry ───────────────────────────────────────

export class ConnectorRegistry {
  private _connectors: Map<string, any>;
  private _instances: Map<string, any>;
  private _storage: any;
  private _logger: any;

  static STANDARD_CONNECTORS = [
    GoogleCalendarConnector,
    NotionConnector,
    WhatsAppConnector,
    MessagingConnector,
    TelegramConnector,
    DiscordConnector,
    TeamsConnector,
    SlackConnector,
    ZoomConnector,
    JiraConnector,
    LinearConnector,
    OneDriveConnector,
    ConfluenceConnector,
    MiroConnector,
    AccountingConnector,
    BankConnector,
    SupplierConnector,
    BPJSConnector,
  ];

  constructor({ storage, logger, autoRegisterDefaults = false }: any = {}) {
    this._connectors = new Map();
    this._instances = new Map();
    this._storage = storage;
    this._logger = logger;

    if (autoRegisterDefaults) {
      this.registerDefaults();
    }
  }

  registerDefaults() {
    for (const Cls of ConnectorRegistry.STANDARD_CONNECTORS) {
      if (!this._connectors.has(Cls.name)) {
        this._registerClass(Cls);
      }
    }
    return this;
  }

  private _registerClass(ConnectorClass: any) {
    const id = ConnectorClass.name;
    const type = ConnectorClass.type;

    this._connectors.set(id, ConnectorClass);
    if (type && type !== id) {
      this._connectors.set(type, ConnectorClass);
      this._connectors.set(type.toLowerCase(), ConnectorClass);
    }
  }

  register(ConnectorClass: any) {
    const id = ConnectorClass.name || ConnectorClass.id;
    if (this._connectors.has(id)) {
      throw new Error(`Connector "${id}" is already registered`);
    }
    this._registerClass(ConnectorClass);
  }

  get(idOrType: string) {
    if (!idOrType) return undefined;
    return this._connectors.get(idOrType) || this._connectors.get(idOrType.toLowerCase?.());
  }

  async create(idOrType: string, config: any = {}) {
    let ConnectorClass = this.get(idOrType);
    if (!ConnectorClass) {
      // Auto-lookup in standard connectors if not yet registered in this instance
      const matched = ConnectorRegistry.STANDARD_CONNECTORS.find(
        (c: any) => c.name === idOrType || c.type === idOrType || c.type === idOrType?.toLowerCase?.()
      );
      if (matched) {
        this._registerClass(matched);
        ConnectorClass = matched;
      }
    }

    if (!ConnectorClass) {
      throw new Error(`Connector "${idOrType}" not found. Register it first with registry.register(MyConnector).`);
    }
    const connector = new ConnectorClass({ logger: this._logger });
    await connector.connect(config);
    this._instances.set(idOrType, connector);
    return connector;
  }

  getInstance(idOrType: string) {
    return this._instances.get(idOrType) || null;
  }

  list() {
    const unique = new Set();
    const result: any[] = [];
    for (const [_, Cls] of this._connectors.entries()) {
      if (unique.has(Cls)) continue;
      unique.add(Cls);
      result.push({
        id: Cls.name,
        name: Cls.name,
        type: Cls.type,
        protocol: Cls.protocol,
      });
    }
    return result;
  }

  async disconnectAll() {
    for (const [_, instance] of this._instances) {
      try {
        await instance.disconnect();
      } catch {
        // best effort
      }
    }
    this._instances.clear();
  }
}
