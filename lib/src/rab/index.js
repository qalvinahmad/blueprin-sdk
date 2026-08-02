/**
 * RAB Module - SDK interface for Rencana Anggaran Biaya (Budget Planning)
 */

export class RabClient {
  constructor({ storage, hooks, events }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
  }

  async listItems(projectId) {
    return (await this._storage.get(`rab:${projectId}`)) || [];
  }

  async addItem(projectId, input) {
    const item = {
      id: crypto.randomUUID(),
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
    items.push(item);
    await this._storage.set(`rab:${projectId}`, items);
    this._events.emit('blueprin:rab:item:added', { projectId, item });

    return item;
  }

  async updateItem(projectId, itemId, patch) {
    const items = (await this._storage.get(`rab:${projectId}`)) || [];
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx === -1) throw new Error(`RAB item "${itemId}" not found`);

    items[idx] = { ...items[idx], ...patch };
    await this._storage.set(`rab:${projectId}`, items);
    this._events.emit('blueprin:rab:item:updated', { projectId, item: items[idx] });

    return items[idx];
  }

  async removeItem(projectId, itemId) {
    const items = (await this._storage.get(`rab:${projectId}`)) || [];
    const filtered = items.filter((i) => i.id !== itemId);
    await this._storage.set(`rab:${projectId}`, filtered);
    this._events.emit('blueprin:rab:item:removed', { projectId, itemId });
  }

  async calculate(projectId) {
    const ctx = await this._hooks.executeBefore('blueprin:before:rab:calculate', { projectId });

    const items = await this.listItems(ctx.projectId);

    const result = {
      projectId: ctx.projectId,
      items: items.map((item) => ({
        ...item,
        subtotal: item.volume * item.unit_price,
      })),
      total: items.reduce((sum, item) => sum + item.volume * item.unit_price, 0),
      totalItems: items.length,
      calculatedAt: new Date().toISOString(),
    };

    await this._hooks.executeAfter('blueprin:after:rab:calculate', { result });
    this._events.emit('blueprin:rab:calculated', result);

    return result;
  }

  async expand(projectId, ahsComponents = []) {
    const ctx = await this._hooks.executeBefore('blueprin:before:rab:expand', { projectId, ahsComponents });

    const items = await this.listItems(ctx.projectId);

    const materials = [];
    const labor = [];
    const equipment = [];

    for (const item of items) {
      const components = ctx.ahsComponents.filter((c) => c.ahs_item_id === item.ahs_item_id);
      for (const comp of components) {
        const expanded = {
          rab_item_id: item.id,
          name: comp.nama,
          type: comp.jenis,
          unit: comp.satuan,
          coefficient: comp.koefisien,
          unit_price: comp.hargaSatuan,
          quantity: comp.koefisien * item.volume,
          subtotal: comp.koefisien * item.volume * comp.hargaSatuan,
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
      totalMaterialCost: materials.reduce((s, m) => s + m.subtotal, 0),
      totalLaborCost: labor.reduce((s, l) => s + l.subtotal, 0),
      totalEquipmentCost: equipment.reduce((s, e) => s + e.subtotal, 0),
      expandedAt: new Date().toISOString(),
    };

    await this._hooks.executeAfter('blueprin:after:rab:expand', { result });
    this._events.emit('blueprin:rab:expanded', result);

    return result;
  }
}
