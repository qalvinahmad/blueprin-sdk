import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  BaseConnector,
  ConnectorRegistry,
  GoogleCalendarConnector,
  NotionConnector,
  WhatsAppConnector,
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
} from '../lib/src/connector/index.ts';

describe('13 Real Connectors in blueprin-sdk', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('ConnectorRegistry has all 13+ connectors auto-registered by name and alias', () => {
    const registry = new ConnectorRegistry({ autoRegisterDefaults: true });

    expect(registry.get('google')).toBe(GoogleCalendarConnector);
    expect(registry.get('GoogleCalendarConnector')).toBe(GoogleCalendarConnector);

    expect(registry.get('notion')).toBe(NotionConnector);
    expect(registry.get('whatsapp')).toBe(WhatsAppConnector);
    expect(registry.get('telegram')).toBe(TelegramConnector);
    expect(registry.get('discord')).toBe(DiscordConnector);
    expect(registry.get('teams')).toBe(TeamsConnector);
    expect(registry.get('slack')).toBe(SlackConnector);
    expect(registry.get('zoom')).toBe(ZoomConnector);
    expect(registry.get('jira')).toBe(JiraConnector);
    expect(registry.get('linear')).toBe(LinearConnector);
    expect(registry.get('onedrive')).toBe(OneDriveConnector);
    expect(registry.get('confluence')).toBe(ConfluenceConnector);
    expect(registry.get('miro')).toBe(MiroConnector);
    expect(registry.get('accounting')).toBe(AccountingConnector);
    expect(registry.get('bank')).toBe(BankConnector);
    expect(registry.get('supplier')).toBe(SupplierConnector);
    expect(registry.get('bpjs')).toBe(BPJSConnector);

    const list = registry.list();
    expect(list.length).toBeGreaterThanOrEqual(13);
  });

  it('1. GoogleCalendarConnector creates, lists, deletes, and syncs events', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, eventId: 'g-1' }),
    });

    const conn = new GoogleCalendarConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', apiKey: 'g-key' });

    await conn.createEvent({
      summary: 'Rapat RAB',
      start: '2026-08-25T09:00:00Z',
      end: '2026-08-25T10:00:00Z',
    });
    await conn.listEvents({ maxResults: 10 });
    await conn.deleteEvent('g-1');
    await conn.syncSchedule([{ id: 'task-1', title: 'Cor Pondasi' }]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('2. NotionConnector queries database, creates/updates page, and syncs RAB', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, pageId: 'n-1' }),
    });

    const conn = new NotionConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', token: 'secret-token' });

    await conn.queryDatabase('db-123');
    await conn.createPage({ parentDatabaseId: 'db-123', properties: { Name: 'Proyek Baru' } });
    await conn.updatePage('page-1', { Status: 'Done' });
    await conn.syncRAB('db-123', [{ kode: 'A.1', nama: 'Semen' }]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('3. WhatsAppConnector sends text, template, media, and bulk messages', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, messageId: 'wa-1' }),
    });

    const conn = new WhatsAppConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', token: 'wa-token' });

    await conn.sendMessage('628123456789', 'Halo Mandor');
    await conn.sendTemplate('628123456789', 'rab_ready', { total: 'Rp 50jt' });
    await conn.sendMedia('628123456789', 'https://example.com/rab.pdf', 'document', 'File RAB');
    await conn.sendBulk(['628123456789', '628987654321'], 'Broadcast');
    await conn.getStatus('wa-1');

    expect(globalThis.fetch).toHaveBeenCalledTimes(5);
  });

  it('4. TelegramConnector sends messages, photos, documents, and broadcasts', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const conn = new TelegramConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', token: 'bot-token' });

    await conn.sendMessage('chat-1', 'Pesan Telegram');
    await conn.sendPhoto('chat-1', 'https://example.com/site.jpg', 'Foto Lapangan');
    await conn.sendDocument('chat-1', 'https://example.com/doc.pdf', 'Dokumen');
    await conn.broadcast('@channel', 'Broadcast ke Channel');

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('5. DiscordConnector sends webhooks and milestone notifications', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const conn = new DiscordConnector();
    await conn.connect({ baseUrl: 'https://api.example.com' });

    await conn.sendWebhook('https://discord.com/api/webhooks/1/2', { content: 'Update' });
    await conn.notifyProjectMilestone('https://discord.com/api/webhooks/1/2', {
      projectName: 'Gedung A',
      milestone: 'Struktur Lantai 2',
      progress: 75,
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('6. TeamsConnector sends cards and meeting notifications', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const conn = new TeamsConnector();
    await conn.connect({ baseUrl: 'https://api.example.com' });

    await conn.sendCard('https://teams.webhook.url', { title: 'Laporan Proyek', text: 'Detail' });
    await conn.notifyMeeting('https://teams.webhook.url', {
      title: 'Koordinasi Mingguan',
      joinUrl: 'https://teams.microsoft.com/l/meetup-join/...',
      startTime: '2026-08-25T10:00:00Z',
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('7. SlackConnector sends messages and order approvals', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const conn = new SlackConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', token: 'xoxb-token' });

    await conn.sendMessage('#general', { text: 'Pesanan material disetujui' });
    await conn.notifyOrderApproval('#logistik', {
      orderId: 'PO-2026-001',
      supplierName: 'PT Semen Maju',
      totalAmount: 15000000,
    });

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('8. ZoomConnector creates, gets, lists, and deletes meetings', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, meetingId: 'z-123', joinUrl: 'https://zoom.us/j/123' }),
    });

    const conn = new ZoomConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', token: 'jwt-token' });

    await conn.createMeeting({ topic: 'Rapat Owner', duration: 45 });
    await conn.getMeeting('z-123');
    await conn.listMeetings();
    await conn.deleteMeeting('z-123');

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('9. JiraConnector creates, gets, updates issues, and syncs tasks', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, issueKey: 'PROJ-101' }),
    });

    const conn = new JiraConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', apiToken: 'jira-tok' });

    await conn.createIssue({ projectKey: 'BLU', summary: 'Pasang Atap Baja Ringan' });
    await conn.getIssue('BLU-101');
    await conn.updateIssue('BLU-101', { summary: 'Update Atap' });
    await conn.syncTasks('BLU', [{ id: 't-1', name: 'Pengecatan' }]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('10. LinearConnector creates, gets, updates issues, and syncs milestones', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, issueId: 'lin-1' }),
    });

    const conn = new LinearConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', apiKey: 'lin-key' });

    await conn.createIssue({ teamId: 'team-1', title: 'Pondasi Batu Kali' });
    await conn.getIssue('lin-1');
    await conn.updateIssue('lin-1', { estimate: 5 });
    await conn.syncMilestones('team-1', [{ title: 'Serah Terima Kunci' }]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('11. OneDriveConnector uploads, downloads, lists, and backups RAB files', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, fileId: 'od-file-1' }),
    });

    const conn = new OneDriveConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', accessToken: 'ms-tok' });

    await conn.uploadFile('Proyek Rumah', 'RAB-Rumah.xlsx', 'base64data');
    await conn.downloadFile('od-file-1');
    await conn.createFolder('Root', 'Dokumen');
    await conn.listFiles('Proyek Rumah');
    await conn.backupRAB('RAB-backup.json', { total: 1000000 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(5);
  });

  it('12. ConfluenceConnector creates, gets, updates pages, and exports documentation', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, pageId: 'conf-1' }),
    });

    const conn = new ConfluenceConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', apiToken: 'atlassian-tok' });

    await conn.createPage({ spaceKey: 'BLU', title: 'Spesifikasi Teknis', content: '<p>Spek</p>' });
    await conn.updatePage('conf-1', { title: 'Spesifikasi Teknis v2', content: '<p>Spek Baru</p>', version: 2 });
    await conn.getPage('conf-1');
    await conn.exportRABDocumentation('BLU', { projectName: 'Hotel', grandTotal: 500000000 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('13. MiroConnector creates boards, cards, sticky notes, and syncs WBS', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, boardId: 'miro-1' }),
    });

    const conn = new MiroConnector();
    await conn.connect({ baseUrl: 'https://api.example.com', apiKey: 'miro-tok' });

    await conn.createBoard({ name: 'Papan Visual Proyek', description: 'WBS' });
    await conn.createCard('miro-1', { title: 'Pekerjaan Tanah', x: 0, y: 0 });
    await conn.createStickyNote('miro-1', { content: 'Perlu cek tanah', color: 'yellow', x: 100, y: 100 });
    await conn.syncWBS('miro-1', [{ id: 'wbs-1', name: 'Struktur' }]);

    expect(globalThis.fetch).toHaveBeenCalledTimes(4);
  });

  it('ConnectorRegistry creates instance via create() and getInstance()', async () => {
    const registry = new ConnectorRegistry();
    const zoomInstance = await registry.create('zoom', { baseUrl: 'https://zoom.api' });
    expect(zoomInstance).toBeInstanceOf(ZoomConnector);
    expect(registry.getInstance('zoom')).toBe(zoomInstance);
  });
});
