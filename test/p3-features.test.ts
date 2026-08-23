import { describe, it, expect, beforeEach } from 'vitest';
import { BimEngine, BimClient } from '../lib/src/bim/index.ts';
import { CollabClient } from '../lib/src/collab/index.ts';
import { FieldClient } from '../lib/src/field/index.ts';
import { BlueprinSDK } from '../lib/src/core/sdk.ts';
import type { BimModel } from '../lib/src/bim/types.ts';

describe('P3 Advanced Features: BIM, Collab, and Field SDK', () => {
  describe('BIM / 3D IFC Quantity Takeoff', () => {
    const sampleModel: BimModel = {
      id: 'bim-1',
      projectId: 'proj-1',
      name: 'Gedung Kantor 2 Lantai',
      filename: 'office_building.ifc',
      ifcVersion: 'IFC4',
      schemaLOD: 'LOD300',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      elements: [
        {
          globalId: '2O2$U$TfX7obAdA1QJ9Q61',
          name: 'Dinding Bata Luar Lt 1',
          type: 'IfcWall',
          storey: 'Lantai 1',
          material: 'Bata Merah',
          dimensions: {
            length: 20,
            height: 3.5,
            netArea: 70,
            grossVolume: 10.5,
            netVolume: 9.5,
          },
          unitPrice: 150000,
        },
        {
          globalId: '2O2$U$TfX7obAdA1QJ9Q62',
          name: 'Kolom Struktur K1',
          type: 'IfcColumn',
          storey: 'Lantai 1',
          material: 'Beton Bertulang',
          dimensions: {
            height: 3.5,
            netVolume: 0.56,
          },
          unitPrice: 1200000,
        },
        {
          globalId: '2O2$U$TfX7obAdA1QJ9Q63',
          name: 'Plat Lantai 2',
          type: 'IfcSlab',
          storey: 'Lantai 2',
          material: 'Beton K-350',
          dimensions: {
            netArea: 100,
            netVolume: 12.0,
          },
          unitPrice: 950000,
        },
      ],
    };

    it('calculates 3D takeoff summary with storey & category breakdowns', () => {
      const summary = BimEngine.calculateSummary(sampleModel);
      expect(summary.totalElements).toBe(3);
      expect(summary.totalVolumeM3).toBeCloseTo(9.5 + 0.56 + 12.0, 2);
      expect(summary.totalAreaM2).toBeCloseTo(70 + 100, 2);
      expect(summary.storeys['Lantai 1'].elementCount).toBe(2);
      expect(summary.storeys['Lantai 2'].elementCount).toBe(1);
      expect(summary.categories['IfcWall'].count).toBe(1);
      expect(summary.categories['IfcColumn'].count).toBe(1);
      expect(summary.categories['IfcSlab'].count).toBe(1);
    });

    it('filters BIM elements by storey, type, and material', () => {
      const wallElements = BimEngine.filterElements(sampleModel.elements, { type: 'IfcWall' });
      expect(wallElements.length).toBe(1);
      expect(wallElements[0].name).toBe('Dinding Bata Luar Lt 1');

      const floor2Elements = BimEngine.filterElements(sampleModel.elements, { storey: 'Lantai 2' });
      expect(floor2Elements.length).toBe(1);
      expect(floor2Elements[0].type).toBe('IfcSlab');
    });

    it('exports BIM model directly to BoQ items', () => {
      const boq = BimEngine.exportToBoQ(sampleModel);
      expect(boq.length).toBe(3);
      expect(boq[0].category).toBe('Wall');
      expect(boq[0].unit).toBe('m3');
      expect(boq[0].totalPrice).toBe(9.5 * 150000);
    });

    it('manages BIM models via BimClient', async () => {
      const sdk = new BlueprinSDK({ appId: 'test-bim' });
      await sdk.init();

      const model = await sdk.bim.importModel({
        projectId: 'proj-1',
        name: 'Villa Model',
        filename: 'villa.ifc',
        elements: sampleModel.elements,
      });

      expect(model.id).toBeDefined();
      const models = await sdk.bim.listModels('proj-1');
      expect(models.length).toBe(1);

      const summary = await sdk.bim.calculateTakeoff(model.id);
      expect(summary.totalElements).toBe(3);

      const boq = await sdk.bim.exportToBoQ(model.id);
      expect(boq.length).toBe(3);

      const deleted = await sdk.bim.deleteModel(model.id);
      expect(deleted).toBe(true);
    });
  });

  describe('Real-time Collaboration SDK', () => {
    it('manages room sessions, presence, and element locks', async () => {
      const sdk = new BlueprinSDK({ appId: 'test-collab' });
      await sdk.init();

      const room = await sdk.collab.createRoom('proj-1', 'Desain Arsitektur Ruang Tamu');
      expect(room.roomId).toBeDefined();

      const joinedRoom = await sdk.collab.joinRoom(room.roomId, {
        userId: 'user-1',
        name: 'Alvin Ahmad',
        color: '#3B82F6',
        role: 'owner',
      });
      expect(joinedRoom.activeUsers.length).toBe(1);

      // Lock element
      const lockSuccess = await sdk.collab.lockElement(room.roomId, 'user-1', 'wall-101');
      expect(lockSuccess).toBe(true);

      // Another user cannot lock the same element
      const lockConflict = await sdk.collab.lockElement(room.roomId, 'user-2', 'wall-101');
      expect(lockConflict).toBe(false);

      // Unlock
      const unlockSuccess = await sdk.collab.unlockElement(room.roomId, 'user-1', 'wall-101');
      expect(unlockSuccess).toBe(true);

      // Update cursor
      await expect(
        sdk.collab.updateCursor(room.roomId, 'user-1', { x: 150, y: 300, sheetId: 'sheet-1' })
      ).resolves.not.toThrow();

      // Broadcast message
      const msg = await sdk.collab.broadcastMessage({
        roomId: room.roomId,
        senderId: 'user-1',
        type: 'chat',
        payload: { text: 'Halo tim, tolong periksa dimensi dinding' },
      });
      expect(msg.timestamp).toBeDefined();

      // Leave room
      const left = await sdk.collab.leaveRoom(room.roomId, 'user-1');
      expect(left).toBe(true);
    });
  });

  describe('Mobile / Field Inspection SDK', () => {
    it('manages daily logs and site quality & safety inspections', async () => {
      const sdk = new BlueprinSDK({ appId: 'test-field' });
      await sdk.init();

      // Create daily log
      const log = await sdk.field.createDailyLog({
        projectId: 'proj-1',
        date: '2026-08-23',
        weatherMorning: { condition: 'cerah', impactOnWork: 'none' },
        weatherAfternoon: { condition: 'hujan_ringan', impactOnWork: 'partial_delay' },
        workforceCount: 14,
        completedActivities: ['Pengecoran kolom K1', 'Pemasangan bekisting plat lt 2'],
        supervisorName: 'Pak Budi (Mandor)',
      });

      expect(log.id).toBeDefined();
      expect(log.workforceCount).toBe(14);

      const logs = await sdk.field.listDailyLogs('proj-1');
      expect(logs.length).toBe(1);

      // Create K3 Inspection
      const inspection = await sdk.field.createInspection({
        projectId: 'proj-1',
        title: 'Inspeksi K3 Harian & APD Pekerja',
        type: 'daily_k3',
        inspectorName: 'HSE Officer',
        items: [
          { id: '1', category: 'K3_Safety', itemDescription: 'Helm & Rompi K3', status: 'pass' },
          { id: '2', category: 'K3_Safety', itemDescription: 'Sepatu Safety & Sarung Tangan', status: 'pass' },
          { id: '3', category: 'K3_Safety', itemDescription: 'Pagar Pengaman Void Tangga', status: 'pass' },
        ],
        locationGPS: { latitude: -6.2088, longitude: 106.8456 },
      });

      expect(inspection.id).toBeDefined();
      expect(inspection.scorePercent).toBe(100);
      expect(inspection.status).toBe('approved');

      const inspections = await sdk.field.listInspections('proj-1');
      expect(inspections.length).toBe(1);
    });
  });
});
