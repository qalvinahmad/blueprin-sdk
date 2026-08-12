import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlueprinSDK, definePlugin } from '../lib/src/index.ts';
import { MarketplaceClient } from '../lib/src/marketplace/index.ts';
import { RabClient } from '../lib/src/rab/index.ts';
import { ReportClient } from '../lib/src/report/index.ts';
import { ConnectorRegistry, BaseConnector, AccountingConnector, MessagingConnector, BankConnector, SupplierConnector } from '../lib/src/connector/index.ts';
import { CONNECTOR_STATUS } from '../lib/src/core/constants.ts';
import { MaterialClient } from '../lib/src/material/index.ts';
import { ProjectClient } from '../lib/src/project/index.ts';
import { ScheduleClient } from '../lib/src/schedule/index.ts';
import { WorkforceClient } from '../lib/src/workforce/index.ts';

function createTestSDK() {
  return new BlueprinSDK({ appId: 'test-extended', debug: false });
}

describe('MarketplaceClient extended', () => {
  let sdk, client;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new MarketplaceClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: null,
    });
  });

  it('should list partners from storage', async () => {
    const partners = await client.listPartners();
    expect(partners).toEqual([]);
  });

  it('should list suppliers', async () => {
    const suppliers = await client.listSuppliers();
    expect(suppliers).toEqual([]);
  });

  it('should list tukang', async () => {
    const tukang = await client.listTukang();
    expect(tukang).toEqual([]);
  });

  it('should get partner by id', async () => {
    const partner = await client.getPartner('nonexistent');
    expect(partner).toBeNull();
  });

  it('should list products from storage', async () => {
    const products = await client.listProducts();
    expect(products).toEqual([]);
  });

  it('should have correct static constants', () => {
    expect(MarketplaceClient.ORDER_STATUSES).toContain('active');
    expect(MarketplaceClient.PAYMENT_STATUSES).toContain('pending');
    expect(MarketplaceClient.DELIVERY_STATUSES).toContain('preparing');
  });

  it('should update order delivery status', async () => {
    let updatedEmitted = false;
    sdk.events.on('blueprin:marketplace:order:updated', () => { updatedEmitted = true; });
    const result = await client.updateOrderDelivery('order-1', 'in_transit');
    expect(result.delivery_status).toBe('in_transit');
    expect(updatedEmitted).toBe(true);
  });

  it('should emit completed event when delivered', async () => {
    let completedEmitted = false;
    sdk.events.on('blueprin:marketplace:order:completed', () => { completedEmitted = true; });
    await client.updateOrderDelivery('order-1', 'delivered');
    expect(completedEmitted).toBe(true);
  });

  it('should create RFQ with all fields', async () => {
    let rfqReceived = false;
    sdk.events.on('blueprin:marketplace:rfq:received', () => { rfqReceived = true; });
    const rfq = await client.createRFQ({
      buyer_id: 'b1',
      buyer_name: 'PT Test',
      buyer_phone: '08123',
      project_name: 'Proyek Test',
      delivery_address: 'Jl. Test',
      deadline: '2026-12-31',
      budget_estimate: 1000000,
      items: [{ nama: 'Semen', volume: 100 }],
      supplier_ids: ['s1'],
      notes: 'Urgent',
    });
    expect(rfq.buyer_phone).toBe('08123');
    expect(rfq.project_name).toBe('Proyek Test');
    expect(rfqReceived).toBe(true);
  });

  it('should submit quote with all fields', async () => {
    let quotedEmitted = false;
    sdk.events.on('blueprin:marketplace:rfq:quoted', () => { quotedEmitted = true; });
    const quote = await client.submitQuote('rfq-1', {
      supplier_id: 's1',
      supplier_name: 'Toko A',
      items: [{ nama: 'Semen', volume: 100, harga: 65000 }],
      subtotal: 6500000,
      delivery_fee: 50000,
      valid_until: '2026-12-31',
      payment_terms: 'COD',
      notes: 'Ready stock',
    });
    expect(quote.delivery_fee).toBe(50000);
    expect(quote.payment_terms).toBe('COD');
    expect(quotedEmitted).toBe(true);
  });

  it('should create order with all fields', async () => {
    let beforeEmitted = false;
    sdk.hooks.register('blueprin:before:order:create', () => { beforeEmitted = true; });
    const order = await client.createOrder({
      buyer_id: 'b1',
      buyer_name: 'PT Test',
      buyer_phone: '08123',
      supplier_id: 's1',
      rfq_id: 'rfq-1',
      items: [{ nama: 'Semen', volume: 100 }],
      subtotal: 6500000,
      shipping_cost: 50000,
      tax_amount: 650000,
      service_fee: 25000,
      grand_total: 7225000,
      payment_method: 'bank_transfer',
      delivery_address: 'Jl. Test',
      notes: 'Urgent',
    });
    expect(order.buyer_phone).toBe('08123');
    expect(order.rfq_id).toBe('rfq-1');
    expect(order.shipping_cost).toBe(50000);
    expect(order.tax_amount).toBe(650000);
    expect(order.payment_method).toBe('bank_transfer');
  });
});

describe('RabClient expand', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new RabClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      logger: sdk.logger,
    });
    projectId = 'test-expand-project';
  });

  it('should expand RAB with AHS components', async () => {
    await client.addItem(projectId, {
      work_name: 'Pondasi',
      ahs_item_id: 'ahs-1',
      volume: 10,
      unit_price: 450000,
    });

    const ahsComponents = [
      { ahs_item_id: 'ahs-1', nama: 'Semen', jenis: 'MATERIAL', satuan: 'sak', koefisien: 2, hargaSatuan: 65000 },
      { ahs_item_id: 'ahs-1', nama: 'Tukang', jenis: 'UPAH', satuan: 'hari', koefisien: 1, hargaSatuan: 150000 },
      { ahs_item_id: 'ahs-1', nama: 'Molen', jenis: 'ALAT', satuan: 'unit', koefisien: 0.5, hargaSatuan: 100000 },
    ];

    const result = await client.expand(projectId, ahsComponents);

    expect(result.materials.length).toBe(1);
    expect(result.labor.length).toBe(1);
    expect(result.equipment.length).toBe(1);
    expect(result.materials[0].subtotal).toBe(2 * 10 * 65000); // 1,300,000
    expect(result.labor[0].subtotal).toBe(1 * 10 * 150000); // 1,500,000
    expect(result.equipment[0].subtotal).toBe(0.5 * 10 * 100000); // 500,000
    expect(result.totalMaterialCost).toBe(1300000);
    expect(result.totalLaborCost).toBe(1500000);
    expect(result.totalEquipmentCost).toBe(500000);
  });

  it('should emit rab:expanded event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:rab:expanded', () => { emitted = true; });
    await client.expand(projectId, []);
    expect(emitted).toBe(true);
  });

  it('should update item and emit event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:rab:item:updated', () => { emitted = true; });
    const item = await client.addItem(projectId, { work_name: 'Test', volume: 1 });
    await client.updateItem(projectId, item.id, { volume: 5 });
    expect(emitted).toBe(true);
  });

  it('should remove item and emit event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:rab:item:removed', () => { emitted = true; });
    const item = await client.addItem(projectId, { work_name: 'Test' });
    await client.removeItem(projectId, item.id);
    expect(emitted).toBe(true);
  });

  it('should throw on updateItem with invalid id', async () => {
    await client.addItem(projectId, { work_name: 'Test' });
    await expect(client.updateItem(projectId, 'invalid-id', { volume: 5 })).rejects.toThrow('not found');
  });

  it('should return empty items when no data', async () => {
    const items = await client.listItems('nonexistent-project');
    expect(items).toEqual([]);
  });
});

describe('ReportClient extended', () => {
  let sdk;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
  });

  it('should get report by id', async () => {
    sdk.reports.register('test-report', { name: 'Test', generate: () => ({}) });
    const report = sdk.reports.get('test-report');
    expect(report).toBeDefined();
    expect(report.name).toBe('Test');
  });

  it('should return undefined for non-existent report', () => {
    const report = sdk.reports.get('nonexistent');
    expect(report).toBeUndefined();
  });

  it('should throw on register without generate or layout', () => {
    expect(() => sdk.reports.register('bad-report', { name: 'Bad' })).toThrow('must define either');
  });

  it('should throw on generate non-existent report', async () => {
    await expect(sdk.reports.generate('nonexistent')).rejects.toThrow('not found');
  });

  it('should overwrite existing report with warning', async () => {
    sdk.reports.register('test-report', { name: 'First', generate: () => ({}) });
    sdk.reports.register('test-report', { name: 'Second', generate: () => ({}) });
    const list = sdk.reports.list();
    expect(list.length).toBe(1);
    expect(list[0].name).toBe('Second');
  });

  it('should emit report:registered event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:report:registered', () => { emitted = true; });
    sdk.reports.register('event-report', { name: 'Event', generate: () => ({}) });
    expect(emitted).toBe(true);
  });

  it('should emit report:generated event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:report:generated', () => { emitted = true; });
    sdk.reports.register('gen-report', { name: 'Gen', generate: () => ({ total: 100 }) });
    await sdk.reports.generate('gen-report');
    expect(emitted).toBe(true);
  });

  it('should handle hook-modified report result', async () => {
    sdk.hooks.register('blueprin:after:report:hook-report', (ctx) => {
      return { ...ctx, result: { modified: true } };
    });
    sdk.reports.register('hook-report', { name: 'Hook', generate: () => ({ original: true }) });
    const result = await sdk.reports.generate('hook-report');
    // The hook modifies postCtx.result, so the final result should be { modified: true }
    expect(result).toEqual({ modified: true });
  });
});

describe('ConnectorRegistry extended', () => {
  let sdk;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
  });

  it('should throw on duplicate connector registration', () => {
    sdk.connectors.register(AccountingConnector);
    expect(() => sdk.connectors.register(AccountingConnector)).toThrow('already registered');
  });

  it('should throw on create with non-existent connector', async () => {
    await expect(sdk.connectors.create('NonExistent', {})).rejects.toThrow('not found');
  });

  it('should create and connect a connector', async () => {
    sdk.connectors.register(AccountingConnector);
    const connector = await sdk.connectors.create('AccountingConnector', { apiKey: 'test' });
    expect(connector.status).toBe(CONNECTOR_STATUS.CONNECTED);
  });

  it('should get connector by id', () => {
    sdk.connectors.register(AccountingConnector);
    const cls = sdk.connectors.get('AccountingConnector');
    expect(cls).toBe(AccountingConnector);
  });

  it('should return undefined for non-existent connector', () => {
    const cls = sdk.connectors.get('NonExistent');
    expect(cls).toBeUndefined();
  });

  it('should list connectors', () => {
    sdk.connectors.register(AccountingConnector);
    sdk.connectors.register(MessagingConnector);
    const list = sdk.connectors.list();
    expect(list.length).toBe(2);
    expect(list.map(c => c.name)).toContain('AccountingConnector');
  });

  it('should list connectors with protocol', () => {
    sdk.connectors.register(BankConnector);
    const list = sdk.connectors.list();
    expect(list[0].protocol).toBe('rest');
  });
});

describe('BaseConnector extended', () => {
  it('should default to constructor name', () => {
    const connector = new BaseConnector();
    expect(connector.name).toBe('BaseConnector');
  });

  it('should use provided id, name, version', () => {
    const connector = new BaseConnector({ id: 'c1', name: 'Custom', version: '2.0.0' });
    expect(connector.id).toBe('c1');
    expect(connector.name).toBe('Custom');
    expect(connector.version).toBe('2.0.0');
  });

  it('should return info', () => {
    const connector = new BaseConnector({ id: 'c1', name: 'Test' });
    const info = connector.getInfo();
    expect(info.id).toBe('c1');
    expect(info.protocol).toBe('rest');
    expect(info.status).toBe(CONNECTOR_STATUS.DISCONNECTED);
  });

  it('should connect and update status', async () => {
    const connector = new BaseConnector({ id: 'c1' });
    await connector.connect({ apiKey: 'test' });
    expect(connector.status).toBe(CONNECTOR_STATUS.CONNECTED);
    expect(connector.config.apiKey).toBe('test');
  });

  it('should disconnect', async () => {
    const connector = new BaseConnector({ id: 'c1' });
    await connector.connect({});
    await connector.disconnect();
    expect(connector.status).toBe(CONNECTOR_STATUS.DISCONNECTED);
  });

  it('should return true from test when connected', async () => {
    const connector = new BaseConnector({ id: 'c1' });
    await connector.connect({});
    const result = await connector.test();
    expect(result).toBe(true);
  });

  it('should return false from test when not connected', async () => {
    const connector = new BaseConnector({ id: 'c1' });
    const result = await connector.test();
    expect(result).toBe(false);
  });

  it('should return false from test when onTest throws', async () => {
    class BadConnector extends BaseConnector {
      async onTest() { throw new Error('test failed'); }
    }
    const connector = new BadConnector({ id: 'c1' });
    await connector.connect({});
    const result = await connector.test();
    expect(result).toBe(false);
  });

  it('should set error status on connect failure', async () => {
    class FailConnector extends BaseConnector {
      async onConnect() { throw new Error('connect failed'); }
    }
    const connector = new FailConnector({ id: 'c1' });
    await expect(connector.connect({})).rejects.toThrow('connect failed');
    expect(connector.status).toBe(CONNECTOR_STATUS.ERROR);
  });

  it('should handle disconnect error gracefully', async () => {
    class FailDisconnectConnector extends BaseConnector {
      async onDisconnect() { throw new Error('disconnect failed'); }
    }
    const connector = new FailDisconnectConnector({ id: 'c1' });
    await connector.connect({});
    // disconnect() has try/finally, so error is thrown but status is still reset
    try {
      await connector.disconnect();
    } catch (e) {
      // Expected to throw
    }
    expect(connector.status).toBe(CONNECTOR_STATUS.DISCONNECTED);
  });
});

describe('Specialized Connectors', () => {
  it('AccountingConnector should throw on methods', async () => {
    const connector = new AccountingConnector();
    await expect(connector.getAccountBalances()).rejects.toThrow('Not implemented');
    await expect(connector.createJournalEntry({})).rejects.toThrow('Not implemented');
    await expect(connector.syncInvoices()).rejects.toThrow('Not implemented');
  });

  it('MessagingConnector should throw on methods', async () => {
    const connector = new MessagingConnector();
    await expect(connector.sendMessage('to', 'msg')).rejects.toThrow('Not implemented');
    await expect(connector.sendTemplate('to', 'tid', {})).rejects.toThrow('Not implemented');
  });

  it('BankConnector should throw on methods', async () => {
    const connector = new BankConnector();
    await expect(connector.getMutasi('a', 's', 'e')).rejects.toThrow('Not implemented');
    await expect(connector.createTransfer({})).rejects.toThrow('Not implemented');
  });

  it('SupplierConnector should throw on methods', async () => {
    const connector = new SupplierConnector();
    await expect(connector.getCatalog()).rejects.toThrow('Not implemented');
    await expect(connector.submitPurchaseOrder({})).rejects.toThrow('Not implemented');
    await expect(connector.checkOrderStatus('id')).rejects.toThrow('Not implemented');
  });
});

describe('MaterialClient extended', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
    projectId = 'test-material-ext';
  });

  it('should update a material', async () => {
    const material = await client.create(projectId, { name: 'Original', unit_price: 100 });
    const updated = await client.update(projectId, material.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('should throw on update non-existent material', async () => {
    await expect(client.update(projectId, 'fake-id', { name: 'X' })).rejects.toThrow('not found');
  });

  it('should emit material events', async () => {
    let created = false, updated = false, deleted = false;
    sdk.events.on('blueprin:material:created', () => { created = true; });
    sdk.events.on('blueprin:material:updated', () => { updated = true; });
    sdk.events.on('blueprin:material:deleted', () => { deleted = true; });

    const material = await client.create(projectId, { name: 'Test', unit_price: 100 });
    expect(created).toBe(true);

    await client.update(projectId, material.id, { name: 'Updated' });
    expect(updated).toBe(true);

    await client.delete(projectId, material.id);
    expect(deleted).toBe(true);
  });

  it('should list with search filter', async () => {
    await client.create(projectId, { name: 'Semen Portland', unit_price: 65000 });
    await client.create(projectId, { name: 'Besi Beton', unit_price: 100000 });
    const filtered = await client.list(projectId, { search: 'semen' });
    expect(filtered.length).toBe(1);
  });

  it('should get categories summary with multiple categories', async () => {
    await client.create(projectId, { name: 'A', category: 'MATERIAL', unit_price: 100 });
    await client.create(projectId, { name: 'B', category: 'ALAT', unit_price: 200 });
    await client.create(projectId, { name: 'C', category: 'UPAH', unit_price: 300 });
    await client.create(projectId, { name: 'D', category: 'LAINNYA', unit_price: 400 });
    const summary = await client.getCategoriesSummary(projectId);
    expect(summary.MATERIAL).toBe(100);
    expect(summary.ALAT).toBe(200);
    expect(summary.UPAH).toBe(300);
    expect(summary.LAINNYA).toBe(400);
  });
});

describe('ProjectClient extended', () => {
  let sdk, client;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new ProjectClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
  });

  it('should get project by id', async () => {
    const project = await client.create({ name: 'Test' });
    const list = await client.list();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(project.id);
  });

  it('should emit updated event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:project:updated', () => { emitted = true; });
    const project = await client.create({ name: 'Test' });
    await client.update(project.id, { name: 'Updated' });
    expect(emitted).toBe(true);
  });

  it('should emit deleted event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:project:deleted', () => { emitted = true; });
    const project = await client.create({ name: 'Test' });
    await client.delete(project.id);
    expect(emitted).toBe(true);
  });
});

describe('ScheduleClient extended', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new ScheduleClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
    projectId = 'test-schedule-ext';
  });

  it('should update a task', async () => {
    const task = await client.createTask(projectId, { title: 'Original' });
    const updated = await client.updateTask(projectId, task.id, { title: 'Updated' });
    expect(updated.title).toBe('Updated');
  });

  it('should get schedule', async () => {
    const schedule = await client.get(projectId);
    expect(schedule.projectId).toBe(projectId);
    expect(schedule.tasks).toEqual([]);
  });

  it('should generate schedule', async () => {
    const schedule = await client.generate(projectId);
    expect(schedule.phases.length).toBe(13);
  });
});

describe('WorkforceClient extended', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new WorkforceClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
    projectId = 'test-workforce-ext';
  });

  it('should list workers with search', async () => {
    await client.addWorker(projectId, { name: 'Budi', daily_rate: 100000 });
    await client.addWorker(projectId, { name: 'Andi', daily_rate: 150000 });
    const filtered = await client.listWorkers(projectId, { search: 'budi' });
    expect(filtered.length).toBe(1);
  });

  it('should calculate wages with no attendance', async () => {
    const worker = await client.addWorker(projectId, { name: 'No Attendance', daily_rate: 100000 });
    const wages = await client.calculateWages(projectId, worker.id, '2026-01-01', '2026-01-31');
    expect(wages.total).toBe(0);
  });
});
