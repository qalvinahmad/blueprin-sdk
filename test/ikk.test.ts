import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IKKClient } from '../lib/src/ikk/ikk-client.ts';
import { INDONESIA_PROVINCES } from '../lib/src/types/index.ts';

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('IKKClient', () => {
  let client: IKKClient;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a minimal SDK mock
    const mockSdk = {} as any;
    client = new IKKClient(mockSdk, { baseUrl: 'http://localhost:3000' });
  });

  describe('getProvinceList', () => {
    it('returns all 38 provinces', () => {
      const provinces = client.getProvinceList();
      expect(provinces).toHaveLength(38);
    });

    it('returns code, name, and region for each province', () => {
      const provinces = client.getProvinceList();
      const aceh = provinces.find((p) => p.code === '1100');
      expect(aceh).toBeDefined();
      expect(aceh!.name).toBe('Aceh');
      expect(aceh!.region).toBe('Sumatera');
    });

    it('includes all 6 regions', () => {
      const provinces = client.getProvinceList();
      const regions = [...new Set(provinces.map((p) => p.region))];
      expect(regions).toContain('Sumatera');
      expect(regions).toContain('Jawa');
      expect(regions).toContain('Kalimantan');
      expect(regions).toContain('Sulawesi');
      expect(regions).toContain('Bali & Nusa Tenggara');
      expect(regions).toContain('Maluku & Papua');
    });
  });

  describe('getProvinceName', () => {
    it('returns name for valid code', () => {
      expect(client.getProvinceName('1100')).toBe('Aceh');
      expect(client.getProvinceName('3100')).toBe('DKI Jakarta');
      expect(client.getProvinceName('6400')).toBe('Kalimantan Timur');
    });

    it('returns null for invalid code', () => {
      expect(client.getProvinceName('9999')).toBeNull();
      expect(client.getProvinceName('')).toBeNull();
    });
  });

  describe('getProvincesByRegion', () => {
    it('returns provinces for Sumatera region', () => {
      const sumatera = client.getProvincesByRegion('Sumatera');
      expect(sumatera.length).toBe(10);
      expect(sumatera.map((p) => p.code)).toContain('1100');
      expect(sumatera.map((p) => p.code)).toContain('2100');
    });

    it('returns provinces for Jawa region', () => {
      const jawa = client.getProvincesByRegion('Jawa');
      expect(jawa.length).toBe(6);
      expect(jawa.map((p) => p.code)).toContain('3100');
    });

    it('returns empty array for non-existent region', () => {
      const result = client.getProvincesByRegion('NonExistent' as any);
      expect(result).toHaveLength(0);
    });
  });

  describe('getProvinceIKK', () => {
    it('fetches all provinces from API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            provinces: [
              { code: '1100', name: 'Aceh', ikk: 96.61, ranking: 27 },
              { code: '3100', name: 'DKI Jakarta', ikk: 114.79, ranking: 6 },
            ],
          },
        }),
      });

      const provinces = await client.getProvinceIKK(2024);
      expect(provinces).toHaveLength(2);
      expect(provinces[0].code).toBe('1100');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/ikk/province?year=2024',
        expect.any(Object)
      );
    });

    it('filters by province code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            provinces: [{ code: '3100', name: 'DKI Jakarta', ikk: 114.79 }],
          },
        }),
      });

      const provinces = await client.getProvinceIKK(2024, '3100');
      expect(provinces).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/ikk/province?year=2024&code=3100',
        expect.any(Object)
      );
    });

    it('returns empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const provinces = await client.getProvinceIKK(2024);
      expect(provinces).toEqual([]);
    });

    it('returns empty array on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      const provinces = await client.getProvinceIKK(2024);
      expect(provinces).toEqual([]);
    });
  });

  describe('getCityIKK', () => {
    it('fetches cities for a province', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            cities: [
              { code: '1671', name: 'Palembang', ikk: 95.5 },
              { code: '1672', name: 'Prabumulih', ikk: 92.3 },
            ],
          },
        }),
      });

      const cities = await client.getCityIKK(2024, '1600');
      expect(cities).toHaveLength(2);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/ikk/city?year=2024&province_code=1600',
        expect.any(Object)
      );
    });

    it('returns empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const cities = await client.getCityIKK(2024, '1600');
      expect(cities).toEqual([]);
    });
  });

  describe('getIKKHistory', () => {
    it('fetches historical data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            locationCode: '1100',
            locationName: 'Aceh',
            data: [
              { year: 2019, ikk: 95.2, referenceCity: 'Semarang' },
              { year: 2024, ikk: 96.61, referenceCity: 'Banjarmasin' },
            ],
          },
        }),
      });

      const history = await client.getIKKHistory('1100', 'province', 2019, 2024);
      expect(history).not.toBeNull();
      expect(history!.locationCode).toBe('1100');
      expect(history!.data).toHaveLength(2);
    });

    it('returns null on error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const history = await client.getIKKHistory('1100');
      expect(history).toBeNull();
    });
  });

  describe('compareIKK', () => {
    it('compares multiple locations', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            referenceCity: 'Banjarmasin',
            locations: [
              { code: '1100', name: 'Aceh', ikk: 96.61 },
              { code: '3100', name: 'DKI Jakarta', ikk: 114.79 },
            ],
            year: 2024,
          },
        }),
      });

      const comparison = await client.compareIKK(['1100', '3100'], 2024);
      expect(comparison).not.toBeNull();
      expect(comparison!.locations).toHaveLength(2);
      expect(comparison!.year).toBe(2024);
    });

    it('returns null on error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const comparison = await client.compareIKK(['1100']);
      expect(comparison).toBeNull();
    });
  });

  describe('calculateCost', () => {
    it('calculates adjusted cost', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            baseCost: 1000000000,
            adjustedCost: 1147900000,
            multiplier: 1.1479,
            locationCode: '3100',
            locationName: 'DKI Jakarta',
            ikk: 114.79,
            year: 2024,
          },
        }),
      });

      const estimate = await client.calculateCost(1000000000, '3100', 2024);
      expect(estimate).not.toBeNull();
      expect(estimate!.adjustedCost).toBe(1147900000);
      expect(estimate!.multiplier).toBeCloseTo(1.1479);
    });

    it('returns null on error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const estimate = await client.calculateCost(1000000000, '3100');
      expect(estimate).toBeNull();
    });
  });

  describe('getIKKRankings', () => {
    it('fetches rankings', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            rankings: [
              { code: '9700', name: 'Papua Pegunungan', ikk: 249.12, ranking: 1 },
              { code: '9600', name: 'Papua Tengah', ikk: 209.28, ranking: 2 },
            ],
          },
        }),
      });

      const rankings = await client.getIKKRankings(2024, 2, 'desc');
      expect(rankings).toHaveLength(2);
      expect(rankings[0].ikk).toBeGreaterThan(rankings[1].ikk);
    });

    it('returns empty array on error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false });
      const rankings = await client.getIKKRankings(2024);
      expect(rankings).toEqual([]);
    });
  });

  describe('constructor options', () => {
    it('uses default options when none provided', () => {
      const mockSdk = {} as any;
      const defaultClient = new IKKClient(mockSdk);
      expect(defaultClient).toBeDefined();
    });

    it('accepts custom base URL', () => {
      const mockSdk = {} as any;
      const customClient = new IKKClient(mockSdk, {
        baseUrl: 'https://custom.api.com',
      });
      expect(customClient).toBeDefined();
    });
  });
});

describe('INDONESIA_PROVINCES constant', () => {
  it('contains exactly 38 provinces', () => {
    expect(INDONESIA_PROVINCES).toHaveLength(38);
  });

  it('each province has code, name, and region', () => {
    INDONESIA_PROVINCES.forEach((p) => {
      expect(p.code).toBeDefined();
      expect(p.name).toBeDefined();
      expect(p.region).toBeDefined();
      expect(typeof p.code).toBe('string');
      expect(typeof p.name).toBe('string');
      expect(typeof p.region).toBe('string');
    });
  });

  it('has unique codes', () => {
    const codes = INDONESIA_PROVINCES.map((p) => p.code);
    const uniqueCodes = [...new Set(codes)];
    expect(codes).toHaveLength(uniqueCodes.length);
  });

  it('covers all 6 regions', () => {
    const regions = [...new Set(INDONESIA_PROVINCES.map((p) => p.region))];
    expect(regions).toHaveLength(6);
    expect(regions).toContain('Sumatera');
    expect(regions).toContain('Jawa');
    expect(regions).toContain('Kalimantan');
    expect(regions).toContain('Sulawesi');
    expect(regions).toContain('Bali & Nusa Tenggara');
    expect(regions).toContain('Maluku & Papua');
  });
});
