import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlueprinSDK } from '../lib/src/index.ts';
import { MaterialClient } from '../lib/src/material/index.ts';

function createMockSupabase() {
  const createChain = (returnData = null, returnError = null) => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: returnData, error: returnError }),
    };
    chain.then = chain.single.then;
    return chain;
  };

  return {
    from: vi.fn().mockImplementation((table) => createChain(null, null)),
    _createChain: createChain,
  };
}

function createTestSDK() {
  return new BlueprinSDK({ appId: 'test-material-mp', debug: false });
}

describe('MaterialClient Marketplace Products', () => {
  let sdk, client, mockSupabase;

  beforeEach(async () => {
    sdk = createTestSDK();
    await sdk.init();
    mockSupabase = createMockSupabase();
    client = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: mockSupabase,
    });
  });

  it('should throw when no supabase client for listMarketplaceProducts', async () => {
    const noSupabaseClient = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: null,
    });
    await expect(noSupabaseClient.listMarketplaceProducts()).rejects.toThrow('Supabase client required');
  });

  it('should list marketplace products', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((resolve) => resolve({ data: [{ nama: 'Semen', kategori: 'BAHAN', satuan: 'sak', harga: 65000 }], error: null })),
    });

    const products = await client.listMarketplaceProducts({ partnerId: 'p1', category: 'bahan', search: 'semen', aktif: true });
    expect(mockSupabase.from).toHaveBeenCalledWith('materials');
  });

  it('should list marketplace products with no filters', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((resolve) => resolve({ data: [], error: null })),
    });

    const products = await client.listMarketplaceProducts();
    expect(products).toEqual([]);
  });

  it('should throw on listMarketplaceProducts error', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
      then: vi.fn((resolve) => resolve({ data: null, error: new Error('DB error') })),
    });

    await expect(client.listMarketplaceProducts()).rejects.toThrow('DB error');
  });

  it('should throw when no supabase for getMarketplaceProduct', async () => {
    const noSupabaseClient = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: null,
    });
    await expect(noSupabaseClient.getMarketplaceProduct('m1')).rejects.toThrow('Supabase client required');
  });

  it('should get a marketplace product', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'm1', nama: 'Semen', kategori: 'BAHAN', satuan: 'sak', harga: 65000 },
        error: null,
      }),
    });

    const product = await client.getMarketplaceProduct('m1');
    expect(product.nama).toBe('Semen');
    expect(product.name).toBe('Semen'); // backward compat alias
  });

  it('should throw on getMarketplaceProduct error', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Not found') }),
    });

    await expect(client.getMarketplaceProduct('m1')).rejects.toThrow('Not found');
  });

  it('should throw when no supabase for createMarketplaceProduct', async () => {
    const noSupabaseClient = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: null,
    });
    await expect(noSupabaseClient.createMarketplaceProduct('p1', {})).rejects.toThrow('Supabase client required');
  });

  it('should create a marketplace product', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'm1', nama: 'Semen', kategori: 'BAHAN', satuan: 'sak', harga: 65000, partner_id: 'p1', stok: 100, aktif: true },
        error: null,
      }),
    });

    let emitted = false;
    sdk.events.on('blueprin:material:created', () => { emitted = true; });

    const product = await client.createMarketplaceProduct('p1', {
      name: 'Semen',
      category: 'BAHAN',
      unit: 'sak',
      unit_price: 65000,
      stok: 100,
    });
    expect(product.nama).toBe('Semen');
    expect(emitted).toBe(true);
  });

  it('should throw on createMarketplaceProduct error', async () => {
    mockSupabase.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
    });

    await expect(client.createMarketplaceProduct('p1', { nama: 'Test' })).rejects.toThrow('Insert failed');
  });

  it('should throw when no supabase for updateMarketplaceProduct', async () => {
    const noSupabaseClient = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: null,
    });
    await expect(noSupabaseClient.updateMarketplaceProduct('p1', 'm1', {})).rejects.toThrow('Supabase client required');
  });

  it('should update a marketplace product with SDK-style aliases', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'm1', nama: 'Updated', kategori: 'ALAT', satuan: 'pcs', harga: 100000, stok: 50, aktif: true },
        error: null,
      }),
    });

    let emitted = false;
    sdk.events.on('blueprin:material:updated', () => { emitted = true; });

    const product = await client.updateMarketplaceProduct('p1', 'm1', {
      name: 'Updated',
      category: 'alat',
      unit: 'pcs',
      unit_price: 100000,
      stok: 50,
      notes: 'Updated item',
    });
    expect(product.nama).toBe('Updated');
    expect(emitted).toBe(true);
  });

  it('should throw on updateMarketplaceProduct error', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
    });

    await expect(client.updateMarketplaceProduct('p1', 'm1', { nama: 'Test' })).rejects.toThrow('Update failed');
  });

  it('should throw when no supabase for deleteMarketplaceProduct', async () => {
    const noSupabaseClient = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: null,
    });
    await expect(noSupabaseClient.deleteMarketplaceProduct('p1', 'm1')).rejects.toThrow('Supabase client required');
  });

  it('should delete a marketplace product', async () => {
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    let emitted = false;
    sdk.events.on('blueprin:material:deleted', () => { emitted = true; });

    await client.deleteMarketplaceProduct('p1', 'm1');
    expect(emitted).toBe(true);
  });

  it('should throw on deleteMarketplaceProduct error', async () => {
    const eq1 = vi.fn().mockReturnThis();
    const eq2 = vi.fn().mockResolvedValue({ error: new Error('Delete failed') });
    mockSupabase.from.mockReturnValue({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn()
        .mockImplementationOnce(() => ({ eq: eq2 }))
        .mockReturnValueOnce({ eq: eq2 }),
    });

    await expect(client.deleteMarketplaceProduct('p1', 'm1')).rejects.toThrow('Delete failed');
  });

  it('should toggle marketplace product active status', async () => {
    mockSupabase.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'm1', nama: 'Semen', kategori: 'BAHAN', satuan: 'sak', harga: 65000, aktif: false },
        error: null,
      }),
    });

    const product = await client.toggleMarketplaceProductActive('p1', 'm1', false);
    expect(product.aktif).toBe(false);
  });

  it('should throw when no supabase for getMarketplaceProductStats', async () => {
    const noSupabaseClient = new MaterialClient({
      storage: sdk.storage,
      hooks: sdk.hooks,
      events: sdk.events,
      supabaseClient: null,
    });
    await expect(noSupabaseClient.getMarketplaceProductStats('p1')).rejects.toThrow('Supabase client required');
  });

  it('should get marketplace product stats', async () => {
    mockSupabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      then: vi.fn((resolve) => resolve({
        data: [
          { nama: 'Semen', kategori: 'BAHAN', satuan: 'sak', harga: 65000, stok: 100, aktif: true },
          { nama: 'Besi', kategori: 'BAHAN', satuan: 'kg', harga: 15000, stok: 200, aktif: true },
          { nama: 'Cat', kategori: 'LAINNYA', satuan: 'kaleng', harga: 200000, stok: 0, aktif: false },
        ],
        error: null,
      })),
    });

    const stats = await client.getMarketplaceProductStats('p1');
    expect(stats.total).toBe(3);
    expect(stats.active).toBe(2);
    expect(stats.stockValue).toBe(65000 * 100 + 15000 * 200 + 200000 * 0);
    expect(stats.categoryBreakdown.BAHAN).toBe(2);
    expect(stats.categoryBreakdown.LAINNYA).toBe(1);
  });
});
