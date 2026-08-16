import { describe, it, expect, vi } from 'vitest';
import { MarketplaceClient } from '../lib/src/marketplace/index.ts';

describe('MarketplaceClient with Supabase filters', () => {
  it('listPartners, listSuppliers, listTukang and getPartner with supabase', async () => {
    const mockPartner = { id: 'p1', name: 'Mitra 10', type: 'supplier', city: 'Jakarta', active: true, verified: true };
    const mockQuery: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockPartner, error: null }),
      then: vi.fn((resolve) => resolve({ data: [mockPartner], error: null })),
    };

    const mockSupabase = {
      from: vi.fn().mockReturnValue(mockQuery),
    };

    const client = new MarketplaceClient({
      storage: null,
      hooks: null,
      events: null,
      supabaseClient: mockSupabase,
    });

    const partners = await client.listPartners({
      type: 'supplier',
      city: 'Jakarta',
      search: 'Mitra',
      active: true,
      verified: true,
    });
    expect(partners.length).toBe(1);

    const suppliers = await client.listSuppliers();
    expect(suppliers.length).toBe(1);

    const tukang = await client.listTukang();
    expect(tukang.length).toBe(1);

    const singlePartner = await client.getPartner('p1');
    expect(singlePartner?.id).toBe('p1');

    const products = await client.listProducts({
      partnerId: 'p1',
      category: 'BAHAN',
      search: 'Semen',
    });
    expect(products.length).toBe(1);
  });
});
