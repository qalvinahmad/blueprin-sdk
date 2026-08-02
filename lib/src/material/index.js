/**
 * Material Module - SDK interface for materials, suppliers, and tukang
 */

export class MaterialClient {
  constructor({ storage, hooks, events }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
  }

  async list(projectId, filters = {}) {
    const all = (await this._storage.get(`materials:${projectId}`)) || [];
    return all.filter((m) => {
      if (filters.category && m.category !== filters.category) return false;
      if (filters.search && !m.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      return true;
    });
  }

  async create(projectId, input) {
    const ctx = await this._hooks.executeBefore('blueprin:before:material:create', { projectId, input });

    const material = {
      id: crypto.randomUUID(),
      project_id: projectId,
      name: ctx.input.name,
      category: ctx.input.category || 'MATERIAL',
      unit: ctx.input.unit || 'pcs',
      unit_price: ctx.input.unit_price || 0,
      supplier: ctx.input.supplier || '',
      notes: ctx.input.notes || '',
      created_at: new Date().toISOString(),
    };

    const materials = (await this._storage.get(`materials:${projectId}`)) || [];
    materials.push(material);
    await this._storage.set(`materials:${projectId}`, materials);

    await this._hooks.executeAfter('blueprin:after:material:create', { material });
    this._events.emit('blueprin:material:created', { projectId, material });

    return material;
  }

  async update(projectId, materialId, patch) {
    const ctx = await this._hooks.executeBefore('blueprin:before:material:update', { projectId, materialId, patch });

    const materials = (await this._storage.get(`materials:${projectId}`)) || [];
    const idx = materials.findIndex((m) => m.id === ctx.materialId);
    if (idx === -1) throw new Error(`Material "${ctx.materialId}" not found`);

    materials[idx] = { ...materials[idx], ...ctx.patch };
    await this._storage.set(`materials:${projectId}`, materials);

    await this._hooks.executeAfter('blueprin:after:material:update', { material: materials[idx] });
    this._events.emit('blueprin:material:updated', { projectId, material: materials[idx] });

    return materials[idx];
  }

  async delete(projectId, materialId) {
    const materials = (await this._storage.get(`materials:${projectId}`)) || [];
    const filtered = materials.filter((m) => m.id !== materialId);
    await this._storage.set(`materials:${projectId}`, filtered);
    this._events.emit('blueprin:material:deleted', { projectId, materialId });
  }

  async getCategoriesSummary(projectId) {
    const materials = await this.list(projectId);
    const summary = { MATERIAL: 0, UPAH: 0, ALAT: 0, LAINNYA: 0 };
    for (const m of materials) {
      summary[m.category] = (summary[m.category] || 0) + m.unit_price;
    }
    return summary;
  }
}
