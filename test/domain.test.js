import { describe, it, expect, beforeEach } from 'vitest';
import { BlueprinSDK, definePlugin } from '../lib/index.js';
import { ProjectClient } from '../lib/src/project/index.js';
import { MaterialClient } from '../lib/src/material/index.js';
import { RabClient } from '../lib/src/rab/index.js';
import { ScheduleClient } from '../lib/src/schedule/index.js';
import { MarketplaceClient } from '../lib/src/marketplace/index.js';

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

  it('should calculate total RAB', async () => {
    await client.addItem(projectId, { work_name: 'Item 1', volume: 5, unit_price: 100000 });
    await client.addItem(projectId, { work_name: 'Item 2', volume: 3, unit_price: 200000 });

    const result = await client.calculate(projectId);
    expect(result.total).toBe(1100000); // 500000 + 600000
    expect(result.totalItems).toBe(2);
    expect(result.items.length).toBe(2);
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
