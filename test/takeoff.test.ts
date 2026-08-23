import { describe, it, expect, beforeEach } from 'vitest';
import { TakeoffEngine, TakeoffClient } from '../lib/src/takeoff/index.ts';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';
import type { TakeoffScale, TakeoffItem, TakeoffSheet, TakeoffLayer } from '../lib/src/takeoff/types.ts';

describe('Digital Takeoff Engine & Client', () => {
  describe('TakeoffEngine Math & Computations', () => {
    it('calculates scale from known reference distance correctly', () => {
      const p1 = { x: 100, y: 100 };
      const p2 = { x: 300, y: 100 }; // 200 pixels distance
      const knownDistance = 2.0; // 2 meters

      const scale = TakeoffEngine.calculateScaleFromKnownDistance(p1, p2, knownDistance, 'm');

      expect(scale.pixelsPerUnit).toBe(100); // 100 px = 1 meter
      expect(scale.unit).toBe('m');
      expect(scale.knownDistance).toBe(2.0);
    });

    it('throws error for invalid calibration distances or points', () => {
      const p1 = { x: 100, y: 100 };
      expect(() => TakeoffEngine.calculateScaleFromKnownDistance(p1, { x: 200, y: 100 }, 0)).toThrow();
      expect(() => TakeoffEngine.calculateScaleFromKnownDistance(p1, p1, 5)).toThrow();
    });

    it('calculates scale from architectural ratio presets', () => {
      const scale100 = TakeoffEngine.calculateScaleFromPreset('1:100', 72, 'm');
      expect(scale100.pixelsPerUnit).toBeGreaterThan(0);
      expect(scale100.unit).toBe('m');
      expect(scale100.ratio).toBe('1:100');

      expect(() => TakeoffEngine.calculateScaleFromPreset('invalid-ratio')).toThrow();
      expect(() => TakeoffEngine.calculateScaleFromPreset('1:-50')).toThrow();
    });

    it('converts units correctly across dimensions (linear, area, volume)', () => {
      // 10 meters = 1000 cm
      expect(TakeoffEngine.convertUnit(10, 'm', 'cm', 1)).toBeCloseTo(1000, 2);
      // 1 square meter = 10000 square cm
      expect(TakeoffEngine.convertUnit(1, 'm', 'cm', 2)).toBeCloseTo(10000, 2);
      // 1 cubic meter = 1000000 cubic cm
      expect(TakeoffEngine.convertUnit(1, 'm', 'cm', 3)).toBeCloseTo(1000000, 2);
      // same unit identity
      expect(TakeoffEngine.convertUnit(42, 'm', 'm', 1)).toBe(42);
    });

    it('calculates linear polyline length with scale', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 300, y: 0 }, // 300 px
        { x: 300, y: 400 }, // + 400 px = 700 px
      ];
      const scale: TakeoffScale = { pixelsPerUnit: 100, unit: 'm' }; // 100 px = 1 m

      const result = TakeoffEngine.calculatePolylineLength(points, scale);
      expect(result.pixelLength).toBe(700);
      expect(result.scaledLength).toBe(7.0);
      expect(result.unit).toBe('m');

      // Empty / single point
      expect(TakeoffEngine.calculatePolylineLength([]).scaledLength).toBe(0);
    });

    it('calculates polygon area using Shoelace formula', () => {
      // 400x300 rectangle = 120,000 px^2 -> at 100 px/m = 4m x 3m = 12 m^2
      const points = [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
        { x: 400, y: 300 },
        { x: 0, y: 300 },
      ];
      const scale: TakeoffScale = { pixelsPerUnit: 100, unit: 'm' };

      const result = TakeoffEngine.calculatePolygonArea(points, scale);
      expect(result.pixelArea).toBe(120000);
      expect(result.scaledArea).toBe(12.0);
      expect(result.unit).toBe('m2');

      // Invalid polygon
      expect(TakeoffEngine.calculatePolygonArea([{ x: 0, y: 0 }]).scaledArea).toBe(0);
    });

    it('calculates net polygon area with deduction holes', () => {
      // 10m x 10m room = 100 m^2
      const room = [
        { x: 0, y: 0 },
        { x: 1000, y: 0 },
        { x: 1000, y: 1000 },
        { x: 0, y: 1000 },
      ];
      // 2m x 2m column void = 4 m^2
      const columnVoid = [
        { x: 200, y: 200 },
        { x: 400, y: 200 },
        { x: 400, y: 400 },
        { x: 200, y: 400 },
      ];
      const scale: TakeoffScale = { pixelsPerUnit: 100, unit: 'm' };

      const result = TakeoffEngine.calculateNetPolygonArea(room, [columnVoid], scale);
      expect(result.grossArea).toBe(100.0);
      expect(result.deductionsArea).toBe(4.0);
      expect(result.netArea).toBe(96.0);
    });

    it('calculates wall surface area with deductions', () => {
      // 10m wall length, 3m height, 1 door (0.9 x 2.1 = 1.89 m2)
      const wallLine = [
        { x: 0, y: 0 },
        { x: 1000, y: 0 },
      ];
      const scale: TakeoffScale = { pixelsPerUnit: 100, unit: 'm' };

      const result = TakeoffEngine.calculateWallSurfaceArea(
        wallLine,
        3.0,
        [{ width: 0.9, height: 2.1 }],
        scale
      );

      expect(result.wallLength).toBe(10.0);
      expect(result.grossArea).toBe(30.0);
      expect(result.deductionsArea).toBe(1.89);
      expect(result.netArea).toBe(28.11);
    });

    it('calculates slab concrete volume with thickness extrusion', () => {
      // 5m x 4m slab = 20 m2, depth = 0.15m (15cm) -> 3.0 m3
      const slab = [
        { x: 0, y: 0 },
        { x: 500, y: 0 },
        { x: 500, y: 400 },
        { x: 0, y: 400 },
      ];
      const scale: TakeoffScale = { pixelsPerUnit: 100, unit: 'm' };

      const result = TakeoffEngine.calculateSlabVolume(slab, 0.15, [], scale);
      expect(result.netArea).toBe(20.0);
      expect(result.volume).toBe(3.0);
      expect(result.unit).toBe('m3');
    });

    it('tests point inside polygon using ray casting', () => {
      const poly = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ];
      expect(TakeoffEngine.pointInPolygon({ x: 50, y: 50 }, poly)).toBe(true);
      expect(TakeoffEngine.pointInPolygon({ x: 150, y: 50 }, poly)).toBe(false);
      expect(TakeoffEngine.pointInPolygon({ x: 0, y: 0 }, [])).toBe(false);
    });

    it('calculates item for count, linear, area, volume, and deduction types with waste factor', () => {
      const scale: TakeoffScale = { pixelsPerUnit: 100, unit: 'm' };

      // Count item (e.g. 8 Column pillars @ Rp 500,000)
      const countItem: TakeoffItem = {
        id: 'c1',
        sheetId: 's1',
        layerId: 'l1',
        name: 'Kolom K1',
        type: 'count',
        points: [{ x: 10, y: 10 }, { x: 20, y: 20 }, { x: 30, y: 30 }],
        count: 5,
        unitPrice: 500000,
        wasteFactorPercent: 0,
      };
      const countRes = TakeoffEngine.calculateItem(countItem, scale);
      expect(countRes.netMeasurement).toBe(5);
      expect(countRes.unit).toBe('pcs');
      expect(countRes.totalCost).toBe(2500000);

      // Linear item with wall height (10m long, 3m high, 5% waste @ Rp 120,000/m2)
      const wallItem: TakeoffItem = {
        id: 'w1',
        sheetId: 's1',
        layerId: 'l1',
        name: 'Dinding Bata',
        type: 'linear',
        points: [{ x: 0, y: 0 }, { x: 1000, y: 0 }],
        height: 3.0,
        unitPrice: 120000,
        wasteFactorPercent: 5,
      };
      const wallRes = TakeoffEngine.calculateItem(wallItem, scale);
      expect(wallRes.netMeasurement).toBe(30.0);
      expect(wallRes.finalQuantityWithWaste).toBe(31.5);
      expect(wallRes.totalCost).toBe(3780000);

      // Area item (20 m2 flooring + 10% waste @ Rp 150,000/m2)
      const floorItem: TakeoffItem = {
        id: 'f1',
        sheetId: 's1',
        layerId: 'l1',
        name: 'Keramik 60x60',
        type: 'area',
        points: [{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 400 }, { x: 0, y: 400 }],
        unitPrice: 150000,
        wasteFactorPercent: 10,
      };
      const floorRes = TakeoffEngine.calculateItem(floorItem, scale);
      expect(floorRes.netMeasurement).toBe(20.0);
      expect(floorRes.finalQuantityWithWaste).toBe(22.0);
      expect(floorRes.totalCost).toBe(3300000);

      // Volume item (20 m2 * 0.12m = 2.4 m3 concrete @ Rp 950,000/m3)
      const slabItem: TakeoffItem = {
        id: 'sl1',
        sheetId: 's1',
        layerId: 'l1',
        name: 'Beton K-300',
        type: 'volume',
        points: [{ x: 0, y: 0 }, { x: 500, y: 0 }, { x: 500, y: 400 }, { x: 0, y: 400 }],
        depth: 0.12,
        unitPrice: 950000,
      };
      const slabRes = TakeoffEngine.calculateItem(slabItem, scale);
      expect(slabRes.netMeasurement).toBe(2.4);
      expect(slabRes.totalCost).toBe(2280000);

      // Deduction item
      const dedItem: TakeoffItem = {
        id: 'd1',
        sheetId: 's1',
        layerId: 'l1',
        name: 'Void Tangga',
        type: 'deduction',
        points: [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 200 }, { x: 0, y: 200 }],
      };
      const dedRes = TakeoffEngine.calculateItem(dedItem, scale);
      expect(dedRes.netMeasurement).toBe(-4.0);
    });

    it('aggregates sheet summary categorized by layer', () => {
      const scale: TakeoffScale = { pixelsPerUnit: 100, unit: 'm' };
      const layers: TakeoffLayer[] = [
        { id: 'l-arch', name: 'Arsitektur', color: '#3B82F6', visible: true, locked: false, category: 'Arsitektur' },
        { id: 'l-struc', name: 'Struktur', color: '#EF4444', visible: true, locked: false, category: 'Struktur' },
      ];

      const sheet: TakeoffSheet = {
        id: 's1',
        documentId: 'doc1',
        pageNumber: 1,
        name: 'Ground Floor Plan',
        width: 1920,
        height: 1080,
        scale,
        items: [
          {
            id: 'i1',
            sheetId: 's1',
            layerId: 'l-arch',
            name: 'Plesteran Dinding',
            type: 'linear',
            points: [{ x: 0, y: 0 }, { x: 1000, y: 0 }],
            height: 3.0,
            unitPrice: 50000,
          },
          {
            id: 'i2',
            sheetId: 's1',
            layerId: 'l-struc',
            name: 'Kolom Praktis',
            type: 'count',
            count: 4,
            points: [],
            unitPrice: 200000,
          },
        ],
      };

      const summary = TakeoffEngine.calculateSummary(sheet, layers);
      expect(summary.totalItems).toBe(2);
      expect(summary.totalCost).toBe(30 * 50000 + 4 * 200000); // 1,500,000 + 800,000 = 2,300,000
      expect(summary.categories['Arsitektur'].totalCost).toBe(1500000);
      expect(summary.categories['Struktur'].totalCost).toBe(800000);
    });
  });

  describe('TakeoffClient Domain Management', () => {
    let sdk: BlueprinSDK;
    let client: TakeoffClient;

    beforeEach(async () => {
      sdk = new BlueprinSDK({ appId: 'test-takeoff' });
      await sdk.init();
      client = sdk.takeoff;
    });

    it('creates, lists, and gets takeoff documents', async () => {
      const doc = await client.createDocument({
        projectId: 'proj-123',
        title: 'Denah Rumah 2 Lantai',
        filename: 'denah-arsitektur.pdf',
        fileType: 'pdf',
      });

      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Denah Rumah 2 Lantai');
      expect(doc.layers.length).toBe(4); // default layers

      const docs = await client.listDocuments('proj-123');
      expect(docs.length).toBe(1);

      const fetched = await client.getDocument(doc.id);
      expect(fetched?.title).toBe('Denah Rumah 2 Lantai');
    });

    it('updates and deletes takeoff documents', async () => {
      const doc = await client.createDocument({
        projectId: 'proj-123',
        title: 'Old Title',
        filename: 'test.pdf',
      });

      const updated = await client.updateDocument(doc.id, { title: 'New Title' });
      expect(updated.title).toBe('New Title');

      const deleted = await client.deleteDocument(doc.id);
      expect(deleted).toBe(true);

      const missing = await client.getDocument(doc.id);
      expect(missing).toBeNull();
    });

    it('manages sheets and calibrates scale', async () => {
      const doc = await client.createDocument({
        projectId: 'proj-123',
        title: 'Drawing Set',
        filename: 'drawing.pdf',
      });

      const sheet = await client.addSheet(doc.id, {
        name: 'A-101 Floor Plan',
        pageNumber: 1,
        width: 1920,
        height: 1080,
      });

      expect(sheet.name).toBe('A-101 Floor Plan');

      // Calibrate: 200 px = 4 meters (50 px/m)
      const scale = await client.calibrateSheetScale(
        doc.id,
        sheet.id,
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        4.0,
        'm'
      );

      expect(scale.pixelsPerUnit).toBe(50);

      const updatedDoc = await client.getDocument(doc.id);
      expect(updatedDoc?.sheets[0].scale.pixelsPerUnit).toBe(50);
    });

    it('manages takeoff markup items and calculates sheet takeoff', async () => {
      const doc = await client.createDocument({
        projectId: 'proj-123',
        title: 'Residential Villa',
        filename: 'villa.pdf',
      });

      const sheet = await client.addSheet(doc.id, {
        name: 'Ground Floor',
        scale: { pixelsPerUnit: 100, unit: 'm' },
      });

      const item = await client.addItem(doc.id, sheet.id, {
        layerId: doc.layers[0].id,
        name: 'Dinding Utama',
        type: 'linear',
        points: [{ x: 0, y: 0 }, { x: 500, y: 0 }],
        height: 3.5,
        unitPrice: 100000,
        wasteFactorPercent: 5,
      });

      expect(item.id).toBeDefined();

      const updatedItem = await client.updateItem(doc.id, sheet.id, item.id, {
        unitPrice: 120000,
      });
      expect(updatedItem.unitPrice).toBe(120000);

      const sheetSummary = await client.calculateSheet(doc.id, sheet.id);
      expect(sheetSummary.totalItems).toBe(1);
      expect(sheetSummary.totalCost).toBeGreaterThan(0);

      const docSummary = await client.calculateDocument(doc.id);
      expect(docSummary.totalCost).toBe(sheetSummary.totalCost);

      const boq = await client.exportToBoQ(doc.id);
      expect(boq.length).toBe(1);
      expect(boq[0].description).toBe('Dinding Utama');
      expect(boq[0].unitPrice).toBe(120000);

      const itemDeleted = await client.deleteItem(doc.id, sheet.id, item.id);
      expect(itemDeleted).toBe(true);
    });
  });
});
