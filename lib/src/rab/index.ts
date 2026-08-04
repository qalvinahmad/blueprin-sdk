/**
 * RAB Module - SDK interface for Rencana Anggaran Biaya (Budget Planning)
 */

import { generateId } from '../utils/index.js';
import { FormulaEngine } from './formula-engine.js';

export class RabClient {
  private _storage: any;
  private _hooks: any;
  private _events: any;
  private _logger: any;
  private _formulaEngine: any;
  constructor({ storage, hooks, events, logger }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
    this._logger = logger;
    this._formulaEngine = new FormulaEngine({ hooks, logger });
  }

  get formulas() {
    return this._formulaEngine;
  }

  async listItems(projectId) {
    return (await this._storage.get(`rab:${projectId}`)) || [];
  }

  async addItem(projectId, input) {
    const item = {
      id: generateId(),
      project_id: projectId,
      work_name: input.work_name,
      unit: input.unit || 'm',
      volume: input.volume || 0,
      unit_price: input.unit_price || 0,
      notes: input.notes || '',
      ahs_item_id: input.ahs_item_id || null,
      kategori: input.kategori || '',
      kode: input.kode || '',
      uraian: input.uraian || '',
      created_at: new Date().toISOString(),
    };

    const items = (await this._storage.get(`rab:${projectId}`)) || [];
    (items as any).push(item);
    await this._storage.set(`rab:${projectId}`, items);
    (this._events.emit as any)('blueprin:rab:item:added', { projectId, item });

    return item;
  }

  async updateItem(projectId, itemId, patch) {
    const items = (await this._storage.get(`rab:${projectId}`)) || [];
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error(`RAB item "${itemId}" not found`);

    items[idx] = { ...items[idx], ...patch };
    await this._storage.set(`rab:${projectId}`, items);
    (this._events.emit as any)('blueprin:rab:item:updated', { projectId, item: items[idx] });

    return items[idx];
  }

  async removeItem(projectId, itemId) {
    const items = (await this._storage.get(`rab:${projectId}`)) || [];
    const filtered = items.filter((i) => i.id !== itemId);
    await this._storage.set(`rab:${projectId}`, filtered);
    (this._events.emit as any)('blueprin:rab:item:removed', { projectId, itemId });
  }

  async calculate(projectId) {
    const ctx = await this._hooks.executeBefore('blueprin:before:rab:calculate', { projectId });

    const items = await this.listItems(ctx.projectId);
    const calculatedItems: any[] = [];
    let baseTotal = 0;

    // 1. Process Items
    for (const item of items) {
      const itemContext = { item, volume: item.volume, unit_price: item.unit_price };
      
      // Escalation modifies unit_price
      itemContext.unit_price = await this._formulaEngine.applyChain('escalation', itemContext, itemContext.unit_price);
      
      // Coefficient modifies volume
      itemContext.volume = await this._formulaEngine.applyChain('coefficient', itemContext, itemContext.volume);
      
      // Allowances adds flat cost
      const allowances = await this._formulaEngine.applyChain('allowance', itemContext, 0);
      
      const subtotal /* as any */ = (itemContext.volume * itemContext.unit_price) + allowances;
      
      calculatedItems.push({ ...item, ...itemContext, subtotal /* as any */ });
      baseTotal += subtotal /* as any */;
    }

    // 2. Process Globals
    const globalContext = { items: calculatedItems, baseTotal, currentTotal: baseTotal };
    
    // Apply Overhead
    const overheadTotal = await this._formulaEngine.applyChain('overhead', globalContext, 0);
    globalContext.currentTotal += overheadTotal;
    
    // Apply Profit
    const profitTotal = await this._formulaEngine.applyChain('profit', globalContext, 0);
    globalContext.currentTotal += profitTotal;
    
    // Apply Tax
    const taxTotal = await this._formulaEngine.applyChain('tax', globalContext, 0);
    globalContext.currentTotal += taxTotal;

    const result = {
      projectId: ctx.projectId,
      items: calculatedItems,
      baseTotal,
      overheadTotal,
      profitTotal,
      taxTotal,
      grandTotal: globalContext.currentTotal,
      totalItems: items.length,
      calculatedAt: new Date().toISOString(),
    };

    await this._hooks.executeAfter('blueprin:after:rab:calculate', { result });
    (this._events.emit as any)('blueprin:rab:calculated', result);

    return result;
  }

  async expand(projectId, ahsComponents = []) {
    const ctx = await this._hooks.executeBefore('blueprin:before:rab:expand', { projectId, ahsComponents });

    const items = await this.listItems(ctx.projectId);

    const materials: any[] = [];
    const labor: any[] = [];
    const equipment: any[] = [];

    for (const item of items) {
      const components = ctx.ahsComponents.filter((c) => c.ahs_item_id === item.ahs_item_id);
      for (const comp of components) {
        // Base AHS Component Subtotal: koefisien * volume_item * harga_satuan
        const subtotal /* as any */ = (comp.koefisien || 0) * (item.volume || 0) * (comp.hargaSatuan || 0);
        
        const expanded = {
          rab_item_id: item.id,
          name: comp.nama,
          type: comp.jenis,
          unit: comp.satuan,
          coefficient: comp.koefisien,
          unit_price: comp.hargaSatuan,
          quantity: comp.koefisien * item.volume,
          subtotal /* as any */,
        };

        if (comp.jenis === 'MATERIAL') materials.push(expanded);
        else if (comp.jenis === 'UPAH') labor.push(expanded);
        else if (comp.jenis === 'ALAT') equipment.push(expanded);
      }
    }

    const result = {
      projectId: ctx.projectId,
      materials,
      labor,
      equipment,
      totalMaterialCost: materials.reduce((s, m) => s + m.subtotal /* as any */, 0),
      totalLaborCost: labor.reduce((s, l) => s + l.subtotal /* as any */, 0),
      totalEquipmentCost: equipment.reduce((s, e) => s + e.subtotal /* as any */, 0),
      expandedAt: new Date().toISOString(),
    };

    await this._hooks.executeAfter('blueprin:after:rab:expand', { result });
    (this._events.emit as any)('blueprin:rab:expanded', result);

    return result;
  }
}
