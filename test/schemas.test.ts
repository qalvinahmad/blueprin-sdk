import { describe, it, expect } from 'vitest';
import {
  materialSchema,
  partnerSchema,
  rfqSchema,
  orderSchema,
  workerSchema,
  projectSchema,
  pluginManifestSchema,
} from '../lib/src/schemas/index.ts';

describe('materialSchema', () => {
  it('should validate valid material', () => {
    const result = materialSchema.safeParse({
      name: 'Semen',
      category: 'BAHAN',
      unit: 'sak',
      price: 65000,
      stock: 100,
      active: true,
    });
    expect(result.success).toBe(true);
  });

  it('should validate with deprecated Indonesian aliases', () => {
    const result = materialSchema.safeParse({
      name: 'Semen',
      kategori: 'BAHAN',
      satuan: 'sak',
      harga: 65000,
      stok: 100,
      aktif: true,
    });
    expect(result.success).toBe(true);
  });

  it('should require name', () => {
    const result = materialSchema.safeParse({ category: 'BAHAN' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('name');
  });

  it('should reject invalid category', () => {
    const result = materialSchema.safeParse({ name: 'Test', category: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should reject negative price', () => {
    const result = materialSchema.safeParse({ name: 'Test', price: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject non-string name', () => {
    const result = materialSchema.safeParse({ name: 123 });
    expect(result.success).toBe(false);
  });

  it('should reject non-number price', () => {
    const result = materialSchema.safeParse({ name: 'Test', price: 'not a number' });
    expect(result.success).toBe(false);
  });

  it('should reject non-boolean active', () => {
    const result = materialSchema.safeParse({ name: 'Test', active: 'yes' });
    expect(result.success).toBe(false);
  });

  it('should accept parse (returns success: false on error)', () => {
    const result = materialSchema.parse({});
    expect(result.success).toBe(false);
  });

  it('should accept valid parse', () => {
    const result = materialSchema.parse({ name: 'Semen' });
    expect(result.success).toBe(true);
  });
});

describe('partnerSchema', () => {
  it('should validate valid partner', () => {
    const result = partnerSchema.safeParse({
      name: 'Toko Jaya',
      type: 'supplier',
      city: 'Jakarta',
      rating: 4.5,
      verified: true,
      active: true,
      categories: ['BAHAN'],
      min_order: 10,
      delivery_radius: 50,
    });
    expect(result.success).toBe(true);
  });

  it('should require name and type', () => {
    const result = partnerSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
  });

  it('should reject invalid type', () => {
    const result = partnerSchema.safeParse({ name: 'Test', type: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should reject rating > 5', () => {
    const result = partnerSchema.safeParse({ name: 'Test', type: 'supplier', rating: 6 });
    expect(result.success).toBe(false);
  });

  it('should reject rating < 0', () => {
    const result = partnerSchema.safeParse({ name: 'Test', type: 'supplier', rating: -1 });
    expect(result.success).toBe(false);
  });

  it('should reject non-array categories', () => {
    const result = partnerSchema.safeParse({ name: 'Test', type: 'supplier', categories: 'not-array' });
    expect(result.success).toBe(false);
  });

  it('should accept parse', () => {
    const result = partnerSchema.parse({});
    expect(result.success).toBe(false);
  });
});

describe('rfqSchema', () => {
  it('should validate valid RFQ', () => {
    const result = rfqSchema.safeParse({
      buyer_id: 'b1',
      items: [{ nama: 'Semen' }],
      supplier_ids: ['s1'],
      status: 'open',
    });
    expect(result.success).toBe(true);
  });

  it('should require buyer_id, items, supplier_ids', () => {
    const result = rfqSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBe(3);
  });

  it('should reject invalid status', () => {
    const result = rfqSchema.safeParse({
      buyer_id: 'b1',
      items: [],
      supplier_ids: [],
      status: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should accept parse', () => {
    const result = rfqSchema.parse({});
    expect(result.success).toBe(false);
  });
});

describe('orderSchema', () => {
  it('should validate valid order', () => {
    const result = orderSchema.safeParse({
      buyer_id: 'b1',
      supplier_id: 's1',
      items: [],
      subtotal: 100000,
      grand_total: 110000,
      payment_status: 'pending',
      delivery_status: 'preparing',
      status: 'active',
    });
    expect(result.success).toBe(true);
  });

  it('should require buyer_id, supplier_id, items', () => {
    const result = orderSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject invalid payment_status', () => {
    const result = orderSchema.safeParse({
      buyer_id: 'b1',
      supplier_id: 's1',
      items: [],
      payment_status: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid delivery_status', () => {
    const result = orderSchema.safeParse({
      buyer_id: 'b1',
      supplier_id: 's1',
      items: [],
      delivery_status: 'invalid',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative subtotal', () => {
    const result = orderSchema.safeParse({
      buyer_id: 'b1',
      supplier_id: 's1',
      items: [],
      subtotal: -1,
    });
    expect(result.success).toBe(false);
  });

  it('should accept parse', () => {
    const result = orderSchema.parse({});
    expect(result.success).toBe(false);
  });
});

describe('workerSchema', () => {
  it('should validate valid worker', () => {
    const result = workerSchema.safeParse({
      name: 'Budi',
      project_id: 'p1',
      daily_rate: 150000,
      overtime_rate: 20000,
    });
    expect(result.success).toBe(true);
  });

  it('should require name and project_id', () => {
    const result = workerSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject negative daily_rate', () => {
    const result = workerSchema.safeParse({ name: 'Budi', project_id: 'p1', daily_rate: -1 });
    expect(result.success).toBe(false);
  });

  it('should accept parse', () => {
    const result = workerSchema.parse({});
    expect(result.success).toBe(false);
  });
});

describe('projectSchema', () => {
  it('should validate valid project', () => {
    const result = projectSchema.safeParse({
      name: 'Proyek A',
      status_proyek: 'baru',
      budget: 1000000,
      building_area_m2: 500,
    });
    expect(result.success).toBe(true);
  });

  it('should require name', () => {
    const result = projectSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject invalid status_proyek', () => {
    const result = projectSchema.safeParse({ name: 'Test', status_proyek: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('should reject negative budget', () => {
    const result = projectSchema.safeParse({ name: 'Test', budget: -1 });
    expect(result.success).toBe(false);
  });

  it('should accept parse', () => {
    const result = projectSchema.parse({});
    expect(result.success).toBe(false);
  });
});

describe('pluginManifestSchema', () => {
  it('should validate valid manifest', () => {
    const result = pluginManifestSchema.safeParse({
      id: 'my-plugin',
      name: 'My Plugin',
      version: '1.0.0',
    });
    expect(result.success).toBe(true);
  });

  it('should require id, name, version', () => {
    const result = pluginManifestSchema.safeParse({});
    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBe(3);
  });

  it('should reject empty id', () => {
    const result = pluginManifestSchema.safeParse({ id: '', name: 'Test', version: '1.0.0' });
    expect(result.success).toBe(false);
  });

  it('should accept parse', () => {
    const result = pluginManifestSchema.parse({});
    expect(result.success).toBe(false);
  });
});
