/**
 * @alvinahmad/blueprin-sdk - TakeoffClient
 *
 * Domain client for Digital Takeoff (PDF/CAD measurement) management:
 * - Documents, sheets, and markup layer lifecycle
 * - Interactive scale calibration
 * - Real-time quantity takeoff calculation
 * - Direct BoQ and RAB cost estimation export
 */

import { generateId } from '../utils/index.js';
import { TakeoffEngine } from './takeoff-engine.js';
import type {
  TakeoffDocument,
  TakeoffSheet,
  TakeoffLayer,
  TakeoffItem,
  TakeoffPoint,
  TakeoffScale,
  TakeoffUnit,
  TakeoffMeasurementType,
  TakeoffSummary,
  BoQExportItem,
} from './types.js';

export class TakeoffClient {
  private _storage: any;
  private _hooks: any;
  private _events: any;

  constructor({ storage, hooks, events }: { storage: any; hooks: any; events: any }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
  }

  /**
   * List all takeoff documents for a specific project.
   */
  async listDocuments(projectId?: string): Promise<TakeoffDocument[]> {
    const docs: TakeoffDocument[] = (await this._storage.get('takeoff_documents')) || [];
    if (projectId) {
      return docs.filter((d) => d.projectId === projectId);
    }
    return docs;
  }

  /**
   * Get a single takeoff document by ID.
   */
  async getDocument(id: string): Promise<TakeoffDocument | null> {
    const docs = await this.listDocuments();
    return docs.find((d) => d.id === id) || null;
  }

  /**
   * Create a new takeoff document (e.g. uploaded architectural PDF or DWG drawing).
   */
  async createDocument(input: {
    projectId: string;
    title: string;
    filename: string;
    fileType?: 'pdf' | 'dwg' | 'dxf' | 'image';
    layers?: TakeoffLayer[];
  }): Promise<TakeoffDocument> {
    const ctx = await this._hooks.executeBefore('blueprin:before:takeoff:create', { input });

    const defaultLayers: TakeoffLayer[] = ctx.input.layers || [
      { id: generateId(), name: 'Walls & Partitions', color: '#EF4444', visible: true, locked: false, category: 'Dinding' },
      { id: generateId(), name: 'Floor Finishes', color: '#3B82F6', visible: true, locked: false, category: 'Lantai' },
      { id: generateId(), name: 'Ceiling & Roofing', color: '#10B981', visible: true, locked: false, category: 'Plafon' },
      { id: generateId(), name: 'Fixtures & Count', color: '#F59E0B', visible: true, locked: false, category: 'Sanitasi' },
    ];

    const document: TakeoffDocument = {
      id: generateId(),
      projectId: ctx.input.projectId,
      title: ctx.input.title,
      filename: ctx.input.filename,
      fileType: ctx.input.fileType || 'pdf',
      sheets: [],
      layers: defaultLayers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docs = await this.listDocuments();
    docs.push(document);
    await this._storage.set('takeoff_documents', docs);

    await this._hooks.executeAfter('blueprin:after:takeoff:create', { document });
    this._events.emit('blueprin:takeoff:document:created', { document });

    return document;
  }

  /**
   * Update document title, layers, or metadata.
   */
  async updateDocument(id: string, patch: Partial<TakeoffDocument>): Promise<TakeoffDocument> {
    const docs = await this.listDocuments();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx === -1) {
      throw new Error(`Takeoff document "${id}" not found`);
    }

    const updated: TakeoffDocument = {
      ...docs[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    docs[idx] = updated;
    await this._storage.set('takeoff_documents', docs);
    this._events.emit('blueprin:takeoff:document:updated', { document: updated });

    return updated;
  }

  /**
   * Delete a takeoff document.
   */
  async deleteDocument(id: string): Promise<boolean> {
    const docs = await this.listDocuments();
    const filtered = docs.filter((d) => d.id !== id);
    if (filtered.length === docs.length) return false;

    await this._storage.set('takeoff_documents', filtered);
    this._events.emit('blueprin:takeoff:document:deleted', { documentId: id });
    return true;
  }

  /**
   * Add a sheet (drawing page) to a takeoff document.
   */
  async addSheet(
    documentId: string,
    sheetInput: {
      name: string;
      pageNumber?: number;
      imageUrl?: string;
      pdfUrl?: string;
      width?: number;
      height?: number;
      scale?: Partial<TakeoffScale>;
    }
  ): Promise<TakeoffSheet> {
    const doc = await this.getDocument(documentId);
    if (!doc) {
      throw new Error(`Takeoff document "${documentId}" not found`);
    }

    const defaultScale: TakeoffScale = {
      pixelsPerUnit: 100, // default: 100 pixels = 1 meter
      unit: 'm',
      ratio: '1:100',
      ...(sheetInput.scale || {}),
    };

    const sheet: TakeoffSheet = {
      id: generateId(),
      documentId,
      pageNumber: sheetInput.pageNumber || doc.sheets.length + 1,
      name: sheetInput.name || `Sheet ${doc.sheets.length + 1}`,
      imageUrl: sheetInput.imageUrl,
      pdfUrl: sheetInput.pdfUrl,
      width: sheetInput.width || 1920,
      height: sheetInput.height || 1080,
      scale: defaultScale,
      items: [],
    };

    doc.sheets.push(sheet);
    await this.updateDocument(documentId, { sheets: doc.sheets });
    this._events.emit('blueprin:takeoff:sheet:added', { documentId, sheet });

    return sheet;
  }

  /**
   * Calibrate scale for a specific sheet using two reference points and known real distance.
   */
  async calibrateSheetScale(
    documentId: string,
    sheetId: string,
    p1: TakeoffPoint,
    p2: TakeoffPoint,
    knownDistance: number,
    unit: TakeoffUnit = 'm'
  ): Promise<TakeoffScale> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error(`Takeoff document "${documentId}" not found`);

    const sheet = doc.sheets.find((s) => s.id === sheetId);
    if (!sheet) throw new Error(`Sheet "${sheetId}" not found`);

    const newScale = TakeoffEngine.calculateScaleFromKnownDistance(p1, p2, knownDistance, unit);
    sheet.scale = newScale;

    await this.updateDocument(documentId, { sheets: doc.sheets });
    this._events.emit('blueprin:takeoff:scale:calibrated', { documentId, sheetId, scale: newScale });

    return newScale;
  }

  /**
   * Add a measurement markup item to a sheet.
   */
  async addItem(
    documentId: string,
    sheetId: string,
    itemInput: Omit<TakeoffItem, 'id' | 'sheetId'>
  ): Promise<TakeoffItem> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error(`Takeoff document "${documentId}" not found`);

    const sheet = doc.sheets.find((s) => s.id === sheetId);
    if (!sheet) throw new Error(`Sheet "${sheetId}" not found`);

    const item: TakeoffItem = {
      id: generateId(),
      sheetId,
      ...itemInput,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sheet.items.push(item);
    await this.updateDocument(documentId, { sheets: doc.sheets });
    this._events.emit('blueprin:takeoff:item:added', { documentId, sheetId, item });

    return item;
  }

  /**
   * Update an existing takeoff measurement item.
   */
  async updateItem(
    documentId: string,
    sheetId: string,
    itemId: string,
    patch: Partial<TakeoffItem>
  ): Promise<TakeoffItem> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error(`Takeoff document "${documentId}" not found`);

    const sheet = doc.sheets.find((s) => s.id === sheetId);
    if (!sheet) throw new Error(`Sheet "${sheetId}" not found`);

    const idx = sheet.items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error(`Item "${itemId}" not found`);

    const updatedItem: TakeoffItem = {
      ...sheet.items[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    sheet.items[idx] = updatedItem;
    await this.updateDocument(documentId, { sheets: doc.sheets });
    this._events.emit('blueprin:takeoff:item:updated', { documentId, sheetId, item: updatedItem });

    return updatedItem;
  }

  /**
   * Delete a takeoff item.
   */
  async deleteItem(documentId: string, sheetId: string, itemId: string): Promise<boolean> {
    const doc = await this.getDocument(documentId);
    if (!doc) return false;

    const sheet = doc.sheets.find((s) => s.id === sheetId);
    if (!sheet) return false;

    const initialLen = sheet.items.length;
    sheet.items = sheet.items.filter((i) => i.id !== itemId);
    if (sheet.items.length === initialLen) return false;

    await this.updateDocument(documentId, { sheets: doc.sheets });
    this._events.emit('blueprin:takeoff:item:deleted', { documentId, sheetId, itemId });

    return true;
  }

  /**
   * Calculate takeoff summary for a specific sheet.
   */
  async calculateSheet(documentId: string, sheetId: string): Promise<TakeoffSummary> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error(`Takeoff document "${documentId}" not found`);

    const sheet = doc.sheets.find((s) => s.id === sheetId);
    if (!sheet) throw new Error(`Sheet "${sheetId}" not found`);

    return TakeoffEngine.calculateSummary(sheet, doc.layers);
  }

  /**
   * Calculate aggregated takeoff summary for an entire document across all sheets.
   */
  async calculateDocument(documentId: string): Promise<TakeoffSummary> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error(`Takeoff document "${documentId}" not found`);

    const layerMap = new Map<string, TakeoffLayer>();
    doc.layers.forEach((l) => layerMap.set(l.id, l));

    const allItems: TakeoffSummary['items'] = [];
    const categories: TakeoffSummary['categories'] = {};
    let totalCost = 0;

    for (const sheet of doc.sheets) {
      const sheetSummary = TakeoffEngine.calculateSummary(sheet, doc.layers);
      allItems.push(...sheetSummary.items);
      totalCost += sheetSummary.totalCost;

      for (const [catName, cat] of Object.entries(sheetSummary.categories)) {
        if (!categories[catName]) {
          categories[catName] = { ...cat };
        } else {
          categories[catName].quantity += cat.quantity;
          categories[catName].totalCost += cat.totalCost;
          categories[catName].itemsCount += cat.itemsCount;
        }
      }
    }

    return {
      documentId,
      totalItems: allItems.length,
      categories,
      totalCost,
      items: allItems,
    };
  }

  /**
   * Export takeoff items directly into a Bill of Quantities (BoQ) structure.
   */
  async exportToBoQ(documentId: string): Promise<BoQExportItem[]> {
    const doc = await this.getDocument(documentId);
    if (!doc) throw new Error(`Takeoff document "${documentId}" not found`);

    const layerMap = new Map<string, TakeoffLayer>();
    doc.layers.forEach((l) => layerMap.set(l.id, l));

    const boqItems: BoQExportItem[] = [];

    for (const sheet of doc.sheets) {
      for (const item of sheet.items) {
        const calc = TakeoffEngine.calculateItem(item, sheet.scale);
        const layer = layerMap.get(item.layerId);
        const category = layer?.category || layer?.name || 'Pekerjaan Umum';

        boqItems.push({
          id: generateId(),
          description: item.name,
          category,
          quantity: calc.finalQuantityWithWaste,
          unit: calc.unit,
          unitPrice: calc.unitPrice,
          subtotal: calc.totalCost,
          sourceSheetId: sheet.id,
          sourceItemId: item.id,
        });
      }
    }

    this._events.emit('blueprin:takeoff:exported:boq', { documentId, count: boqItems.length });
    return boqItems;
  }
}
