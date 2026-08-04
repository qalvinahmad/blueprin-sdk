import { describe, it, expect, beforeEach } from 'vitest';
import { BlueprinSDK, definePlugin } from '../lib/src/index.ts';
import { ProjectClient } from '../lib/src/project/index.ts';
import { MaterialClient } from '../lib/src/material/index.ts';
import { RabClient } from '../lib/src/rab/index.ts';
import { ScheduleClient } from '../lib/src/schedule/index.ts';
import { MarketplaceClient } from '../lib/src/marketplace/index.ts';
import { WorkforceClient } from '../lib/src/workforce/index.ts';

function createTestSDK() {
  const sdk = new BlueprinSDK({ appId: 'test-domain', debug: false });
  return sdk;
}

describe('ProjectClient', () => {
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

  it('should create a project', async () => {
    const project = await client.create({ name: 'Proyek Tower A' });
    expect(project.id).toBeDefined();
    expect(project.name).toBe('Proyek Tower A');
    expect(project.created_at).toBeDefined();
  });

  it('should list projects', async () => {
    await client.create({ name: 'Project 1' });
    await client.create({ name: 'Project 2' });
    const list = await client.list();
    expect(list.length).toBe(2);
  });

  it('should update a project', async () => {
    const project = await client.create({ name: 'Original' });
    const updated = await client.update(project.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
  });

  it('should delete a project', async () => {
    const project = await client.create({ name: 'To Delete' });
    await client.delete(project.id);
    const list = await client.list();
    expect(list.length).toBe(0);
  });

  it('should emit events on create', async () => {
    let emitted = false;
    sdk.events.on('blueprin:project:created', () => { emitted = true; });
    await client.create({ name: 'Event Test' });
    expect(emitted).toBe(true);
  });
});

describe('MaterialClient', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
    const project = await sdk.plugins._sdk; // Use SDK's project creation
    projectId = 'test-project-id';
  });

  it('should create a material', async () => {
    const material = await client.create(projectId, {
      name: 'Semen Portland',
      category: 'MATERIAL',
      unit: 'sak',
      unit_price: 65000,
    });
    expect(material.id).toBeDefined();
    expect(material.name).toBe('Semen Portland');
    expect(material.unit_price).toBe(65000);
  });

  it('should list materials with filters', async () => {
    await client.create(projectId, { name: 'Semen', category: 'MATERIAL', unit_price: 65000 });
    await client.create(projectId, { name: 'Tukang', category: 'UPAH', unit_price: 150000 });

    const materials = await client.list(projectId, { category: 'MATERIAL' });
    expect(materials.length).toBe(1);
    expect(materials[0].name).toBe('Semen');
  });

  it('should get categories summary', async () => {
    await client.create(projectId, { name: 'Semen', category: 'MATERIAL', unit_price: 65000 });
    await client.create(projectId, { name: 'Tukang', category: 'UPAH', unit_price: 150000 });

    const summary = await client.getCategoriesSummary(projectId);
    expect(summary.MATERIAL).toBe(65000);
    expect(summary.UPAH).toBe(150000);
  });

  it('should delete a material', async () => {
    const material = await client.create(projectId, { name: 'To Delete', unit_price: 10000 });
    await client.delete(projectId, material.id);
    const list = await client.list(projectId);
    expect(list.length).toBe(0);
  });
});

describe('RabClient', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new RabClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
    projectId = 'test-rab-project';
  });

  it('should add a RAB item', async () => {
    const item = await client.addItem(projectId, {
      work_name: 'Pekerjaan Pondasi',
      unit: 'm3',
      volume: 10,
      unit_price: 450000,
    });
    expect(item.id).toBeDefined();
    expect(item.work_name).toBe('Pekerjaan Pondasi');
    expect(item.subtotal).toBeUndefined(); // subtotal calculated on list
  });

  it('should list RAB items', async () => {
    await client.addItem(projectId, { work_name: 'Item 1', volume: 5, unit_price: 100000 });
    await client.addItem(projectId, { work_name: 'Item 2', volume: 3, unit_price: 200000 });

    const items = await client.listItems(projectId);
    expect(items.length).toBe(2);
  });

  it('should calculate total RAB with pipelines', async () => {
    // Register pipeline formulas
    client.formulas.registerCoefficient('waste', (ctx) => ctx.currentValue * 1.05); // 5% waste
    client.formulas.registerEscalation('inflation', (ctx) => ctx.currentValue + 1000); // flat 1000 price increase
    client.formulas.registerAllowance('delivery', (ctx) => ctx.currentValue + 5000); // 5000 flat delivery fee per item
    
    client.formulas.registerOverhead('jasa', (ctx) => ctx.currentValue + (ctx.baseTotal * 0.10)); // 10% overhead
    client.formulas.registerTax('ppn', (ctx) => ctx.currentValue + (ctx.currentTotal * 0.11)); // 11% tax on total

    await client.addItem(projectId, { work_name: 'Item 1', volume: 10, unit_price: 10000 });
    
    const result = await client.calculate(projectId);
    
    // Expected Item 1 math:
    // unit_price = 10000 + 1000 = 11000
    // volume = 10 * 1.05 = 10.5
    // subtotal = (11000 * 10.5) + 5000 = 115500 + 5000 = 120500
    
    expect(result.items[0].subtotal).toBe(120500);
    expect(result.baseTotal).toBe(120500);
    
    // Global math:
    // overhead = 120500 * 0.10 = 12050
    // pre-tax total = 120500 + 12050 = 132550
    // tax = 132550 * 0.11 = 14580.5
    // grandTotal = 132550 + 14580.5 = 147130.5

    expect(result.overheadTotal).toBe(12050);
    expect(result.taxTotal).toBe(14580.5);
    expect(result.grandTotal).toBe(147130.5);
  });

  it('should update a RAB item', async () => {
    const item = await client.addItem(projectId, { work_name: 'Original', volume: 1, unit_price: 100 });
    const updated = await client.updateItem(projectId, item.id, { volume: 5 });
    expect(updated.volume).toBe(5);
  });

  it('should remove a RAB item', async () => {
    const item = await client.addItem(projectId, { work_name: 'To Remove' });
    await client.removeItem(projectId, item.id);
    const items = await client.listItems(projectId);
    expect(items.length).toBe(0);
  });

  it('should emit rab:calculated event', async () => {
    let emitted = false;
    sdk.events.on('blueprin:rab:calculated', () => { emitted = true; });
    await client.calculate(projectId);
    expect(emitted).toBe(true);
  });
});

describe('ScheduleClient', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new ScheduleClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
    projectId = 'test-schedule-project';
  });

  it('should have 13 standard phases', () => {
    expect(ScheduleClient.PHASES.length).toBe(13);
  });

  it('should generate a schedule', async () => {
    const schedule = await client.generate(projectId);
    expect(schedule.projectId).toBe(projectId);
    expect(schedule.phases.length).toBe(13);
    expect(schedule.tasks).toEqual([]);
  });

  it('should create a task', async () => {
    const task = await client.createTask(projectId, {
      title: 'Pour foundation',
      priority: 'high',
    });
    expect(task.id).toBeDefined();
    expect(task.title).toBe('Pour foundation');
    expect(task.status).toBe('pending');
  });

  it('should complete a task', async () => {
    const task = await client.createTask(projectId, { title: 'Test Task' });
    const completed = await client.completeTask(projectId, task.id);
    expect(completed.status).toBe('completed');
    expect(completed.column).toBe('done');
    expect(completed.completed_date).toBeDefined();
  });

  it('should emit task events', async () => {
    let created = false, completed = false;
    sdk.events.on('blueprin:task:created', () => { created = true; });
    sdk.events.on('blueprin:task:completed', () => { completed = true; });

    const task = await client.createTask(projectId, { title: 'Event Task' });
    expect(created).toBe(true);

    await client.completeTask(projectId, task.id);
    expect(completed).toBe(true);
  });
});

describe('MarketplaceClient', () => {
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

  it('should have correct constants', () => {
    expect(MarketplaceClient.PARTNER_TYPES).toContain('supplier');
    expect(MarketplaceClient.CATEGORIES).toContain('BAHAN');
    expect(MarketplaceClient.DELIVERY_STATUSES).toContain('preparing');
  });

  it('should create an RFQ', async () => {
    const rfq = await client.createRFQ({
      buyer_id: 'buyer-1',
      buyer_name: 'PT Construction',
      items: [{ nama: 'Semen', volume: 100, satuan: 'sak' }],
      supplier_ids: ['supplier-1'],
    });
    expect(rfq.id).toBeDefined();
    expect(rfq.status).toBe('open');
    expect(rfq.items.length).toBe(1);
  });

  it('should submit a quote', async () => {
    const quote = await client.submitQuote('rfq-123', {
      supplier_id: 'supplier-1',
      supplier_name: 'Toko Material Jaya',
      items: [{ nama: 'Semen', volume: 100, satuan: 'sak', harga: 65000 }],
      subtotal: 6500000,
    });
    expect(quote.id).toBeDefined();
    expect(quote.rfq_id).toBe('rfq-123');
  });

  it('should create an order', async () => {
    const order = await client.createOrder({
      buyer_id: 'buyer-1',
      buyer_name: 'PT Construction',
      supplier_id: 'supplier-1',
      items: [{ nama: 'Semen', volume: 100, harga: 65000 }],
      grand_total: 6500000,
    });
    expect(order.id).toBeDefined();
    expect(order.payment_status).toBe('pending');
    expect(order.delivery_status).toBe('preparing');
  });

  it('should emit order events', async () => {
    let emitted = false;
    sdk.events.on('blueprin:marketplace:order:created', () => { emitted = true; });
    await client.createOrder({
      buyer_id: 'b1',
      buyer_name: 'Buyer',
      supplier_id: 's1',
    });
    expect(emitted).toBe(true);
  });
});

describe('ReportClient', () => {
  let sdk;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
  });

  it('should register and generate a report', async () => {
    sdk.reports.register('rab-summary', {
      name: 'RAB Summary',
      generate: (ctx) => ({ total: 1000 })
    });

    const list = sdk.reports.list();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe('rab-summary');

    const result = await sdk.reports.generate('rab-summary');
    expect(result.total).toBe(1000);
  });

  it('should support layout-only reports', async () => {
    sdk.reports.register('rab-ui-only', {
      name: 'RAB UI',
      layout: { type: 'react-component' }
    });

    const result = await sdk.reports.generate('rab-ui-only', { customData: 123 });
    // Should pass through the context if no generate function is provided
    expect(result.customData).toBe(123);
  });
});

describe('ConnectorRegistry Domain Connectors', () => {
  let sdk;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
  });

  it('should expose ConnectorRegistry via sdk.connectors', () => {
    expect(sdk.connectors).toBeDefined();
  });

  it('should list registered connectors', async () => {
    const { AccountingConnector } = await import('../lib/src/connector/index.ts');
    sdk.connectors.register(AccountingConnector);

    const list = sdk.connectors.list();
    expect(list.length).toBeGreaterThan(0);
    expect(list[0].name).toBe('AccountingConnector');
  });
});

describe('PluginManager UI Slots & Pages', () => {
  let sdk;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
  });

  it('should allow plugins with ui:inject permission to register slots and pages', async () => {
    const manifest = {
      id: 'ui-test-plugin',
      name: 'UI Test Plugin',
      version: '1.0.0',
      permissions: ['ui:inject'],
      activate: (ctx) => {
        ctx.ui.registerSlot('sidebar:bottom', { render: () => 'Menu' });
        ctx.ui.addPage('/settings', { render: () => 'Settings' });
        return { api: {} };
      }
    };

    await sdk.plugins.register(manifest);
    await sdk.plugins.activate('ui-test-plugin');

    const slots = sdk.plugins.getUiSlot('sidebar:bottom');
    expect(slots.length).toBe(1);
    expect(slots[0].pluginId).toBe('ui-test-plugin');

    const pages = sdk.plugins.getUiPages();
    expect(pages.length).toBe(1);
    expect(pages[0].route).toBe('/settings');
  });
});

describe('WorkforceClient', () => {
  let sdk, client, projectId;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    client = new WorkforceClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
    });
    projectId = 'test-workforce-project';
  });

  it('should add a worker', async () => {
    const worker = await client.addWorker(projectId, {
      name: 'Budi',
      role: 'Tukang',
      daily_rate: 150000,
      overtime_rate: 20000,
    });
    expect(worker.id).toBeDefined();
    expect(worker.name).toBe('Budi');
    expect(worker.daily_rate).toBe(150000);
  });

  it('should list workers', async () => {
    await client.addWorker(projectId, { name: 'A', role: 'Mandor' });
    await client.addWorker(projectId, { name: 'B', role: 'Tukang' });

    const workers = await client.listWorkers(projectId);
    expect(workers.length).toBe(2);
    
    const mandors = await client.listWorkers(projectId, { role: 'Mandor' });
    expect(mandors.length).toBe(1);
  });

  it('should log attendance', async () => {
    const worker = await client.addWorker(projectId, { name: 'C', daily_rate: 100000 });
    const attendance = await client.logAttendance(projectId, worker.id, {
      date: '2026-08-01',
      status: 'PRESENT',
      overtime_hours: 2
    });
    
    expect(attendance.id).toBeDefined();
    expect(attendance.status).toBe('PRESENT');
    
    const records = await client.listAttendance(projectId, worker.id);
    expect(records.length).toBe(1);
  });

  it('should calculate wages', async () => {
    const worker = await client.addWorker(projectId, {
      name: 'D',
      daily_rate: 100000,
      overtime_rate: 20000,
    });
    
    await client.logAttendance(projectId, worker.id, { date: '2026-08-01', status: 'PRESENT' });
    await client.logAttendance(projectId, worker.id, { date: '2026-08-02', status: 'PRESENT', overtime_hours: 3 });
    await client.logAttendance(projectId, worker.id, { date: '2026-08-03', status: 'HALF_DAY' });
    await client.logAttendance(projectId, worker.id, { date: '2026-08-04', status: 'ABSENT' });

    const wages = await client.calculateWages(projectId, worker.id, '2026-08-01', '2026-08-31');
    
    // Base wages: 100k + 100k + 50k (half day) = 250k
    // Overtime: 3 * 20k = 60k
    // Total: 310k
    expect(wages.baseWages).toBe(250000);
    expect(wages.overtimeWages).toBe(60000);
    expect(wages.total).toBe(310000);
    expect(wages.daysPresent).toBe(3);
  });
});
