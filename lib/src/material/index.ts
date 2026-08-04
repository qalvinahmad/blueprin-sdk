/**
 * Material Module - SDK interface for materials (project) and marketplace products
 *
 * Supports two contexts:
 *   1. Project materials — localStorage-based, scoped by project_id (RAB/Catalog)
 *   2. Marketplace products — Supabase-based, scoped by partner_id (seller catalog)
 *
 * The unified Material interface maps between SDK field names and DB column names:
 *   SDK: name → DB: nama
 *   SDK: category → DB: kategori
 *   SDK: unit → DB: satuan
 *   SDK: unit_price → DB: harga
 */

import { generateId } from '../utils/index.js';

/**
 * Unified Material interface — covers both project and marketplace contexts.
 */
export interface Material {
  id: string;
  // Project context
  project_id?: string;
  // Marketplace context
  partner_id?: string;
  // Core fields (DB column names)
  nama: string;
  kategori: string;
  satuan: string;
  harga: number;
  // Marketplace-only fields
  deskripsi?: string;
  gambar_url?: string;
  stok?: number;
  aktif?: boolean;
  // Backward-compat aliases (mapped from DB columns)
  name?: string;
  category?: string;
  unit?: string;
  unit_price?: number;
  supplier?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Map SDK-style input fields to DB column names.
 */
function normalizeInput(input: any): any {
  return {
    nama: input.nama || input.name || '',
    kategori: (input.kategori || input.category || 'BAHAN').toUpperCase(),
    satuan: input.satuan || input.unit || 'buah',
    harga: Math.max(0, Number(input.harga ?? input.unit_price ?? 0)),
    deskripsi: input.deskripsi || input.notes || '',
    gambar_url: input.gambar_url || '',
    stok: Math.max(0, Number(input.stok || 0)),
    aktif: input.aktif !== undefined ? input.aktif : true,
    // Pass through marketplace-only fields
    partner_id: input.partner_id || undefined,
    supplier: input.supplier || '',
  };
}

/**
 * Normalize a DB row to the unified Material interface (add backward-compat aliases).
 */
function normalizeRow(row: any): Material {
  if (!row) return row;
  return {
    ...row,
    // Backward-compat aliases
    name: row.nama,
    category: row.kategori,
    unit: row.satuan,
    unit_price: row.harga,
    notes: row.deskripsi,
  };
}

export class MaterialClient {
  private _storage: any;
  private _hooks: any;
  private _events: any;
  private _supabase: any;

  constructor({ storage, hooks, events, supabaseClient }: { storage: any; hooks: any; events: any; supabaseClient?: any }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
    this._supabase = supabaseClient || null;
  }

  // ──────────────────────────────────────────────
  //  PROJECT MATERIALS (localStorage-based)
  // ──────────────────────────────────────────────

  async list(projectId: string, filters: any = {}) {
    const all = (await this._storage.get(`materials:${projectId}`)) || [];
    return all.filter((m) => {
      if (filters.category && m.category !== filters.category && m.kategori !== filters.category) return false;
      if (filters.search) {
        const name = m.name || m.nama || '';
        if (!name.toLowerCase().includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
  }

  async create(projectId: string, input: any) {
    const ctx = await this._hooks.executeBefore('blueprin:before:material:create', { projectId, input });

    const material = {
      id: generateId(),
      project_id: projectId,
      name: ctx.input.name || ctx.input.nama || '',
      category: (ctx.input.category || ctx.input.kategori || 'MATERIAL').toUpperCase(),
      unit: ctx.input.unit || ctx.input.satuan || 'pcs',
      unit_price: ctx.input.unit_price ?? ctx.input.harga ?? 0,
      supplier: ctx.input.supplier || '',
      notes: ctx.input.notes || ctx.input.deskripsi || '',
      created_at: new Date().toISOString(),
    };

    const materials = (await this._storage.get(`materials:${projectId}`)) || [];
    materials.push(material);
    await this._storage.set(`materials:${projectId}`, materials);

    await this._hooks.executeAfter('blueprin:after:material:create', { material });
    this._events.emit('blueprin:material:created', { projectId, material });

    return material;
  }

  async update(projectId: string, materialId: string, patch: any) {
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

  async delete(projectId: string, materialId: string) {
    const materials = (await this._storage.get(`materials:${projectId}`)) || [];
    const filtered = materials.filter((m) => m.id !== materialId);
    await this._storage.set(`materials:${projectId}`, filtered);
    this._events.emit('blueprin:material:deleted', { projectId, materialId });
  }

  async getCategoriesSummary(projectId: string) {
    const materials = await this.list(projectId);
    const summary = { MATERIAL: 0, UPAH: 0, ALAT: 0, LAINNYA: 0 };
    for (const m of materials) {
      const cat = m.category || m.kategori || 'MATERIAL';
      const price = m.unit_price ?? m.harga ?? 0;
      summary[cat] = (summary[cat] || 0) + price;
    }
    return summary;
  }

  // ──────────────────────────────────────────────
  //  MARKETPLACE PRODUCTS (Supabase-based)
  // ──────────────────────────────────────────────

  /**
   * List marketplace products, optionally filtered by partner_id, category, or search.
   */
  async listMarketplaceProducts(filters: any = {}) {
    if (!this._supabase) throw new Error('Supabase client required for marketplace products');

    let query = this._supabase.from('materials').select('*');
    if (filters.partnerId) query = query.eq('partner_id', filters.partnerId);
    if (filters.category) query = query.eq('kategori', filters.category.toUpperCase());
    if (filters.search) query = query.ilike('nama', `%${filters.search}%`);
    if (filters.aktif !== undefined) query = query.eq('aktif', filters.aktif);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(normalizeRow);
  }

  /**
   * Get a single marketplace product by ID.
   */
  async getMarketplaceProduct(materialId: string) {
    if (!this._supabase) throw new Error('Supabase client required for marketplace products');

    const { data, error } = await this._supabase
      .from('materials')
      .select('*')
      .eq('id', materialId)
      .single();
    if (error) throw error;
    return normalizeRow(data);
  }

  /**
   * Create a marketplace product (seller catalog).
   */
  async createMarketplaceProduct(partnerId: string, input: any) {
    if (!this._supabase) throw new Error('Supabase client required for marketplace products');

    const normalized = normalizeInput(input);
    const payload = {
      partner_id: partnerId,
      nama: normalized.nama,
      kategori: normalized.kategori,
      satuan: normalized.satuan,
      harga: normalized.harga,
      deskripsi: normalized.deskripsi,
      gambar_url: normalized.gambar_url,
      stok: normalized.stok,
      aktif: normalized.aktif,
    };

    const { data, error } = await this._supabase
      .from('materials')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;

    const material = normalizeRow(data);
    this._events.emit('blueprin:material:created', { partnerId, material });
    return material;
  }

  /**
   * Update a marketplace product.
   */
  async updateMarketplaceProduct(partnerId: string, materialId: string, patch: any) {
    if (!this._supabase) throw new Error('Supabase client required for marketplace products');

    const allowed = ['nama', 'kategori', 'satuan', 'harga', 'deskripsi', 'gambar_url', 'stok', 'aktif'];
    const payload: any = {};
    for (const key of allowed) {
      if (patch[key] !== undefined) payload[key] = patch[key];
      // Also accept SDK-style aliases
      if (key === 'nama' && patch.name !== undefined) payload.nama = patch.name;
      if (key === 'kategori' && patch.category !== undefined) payload.kategori = patch.category.toUpperCase();
      if (key === 'satuan' && patch.unit !== undefined) payload.satuan = patch.unit;
      if (key === 'harga' && patch.unit_price !== undefined) payload.harga = Math.max(0, Number(patch.unit_price));
      if (key === 'deskripsi' && patch.notes !== undefined) payload.deskripsi = patch.notes;
    }

    // Normalize kategori to uppercase
    if (payload.kategori) payload.kategori = payload.kategori.toUpperCase();
    // Clamp numeric fields
    if (payload.harga !== undefined) payload.harga = Math.max(0, Number(payload.harga));
    if (payload.stok !== undefined) payload.stok = Math.max(0, Number(payload.stok));

    const { data, error } = await this._supabase
      .from('materials')
      .update(payload)
      .eq('id', materialId)
      .eq('partner_id', partnerId)
      .select()
      .single();
    if (error) throw error;

    const material = normalizeRow(data);
    this._events.emit('blueprin:material:updated', { partnerId, material });
    return material;
  }

  /**
   * Delete a marketplace product.
   */
  async deleteMarketplaceProduct(partnerId: string, materialId: string) {
    if (!this._supabase) throw new Error('Supabase client required for marketplace products');

    const { error } = await this._supabase
      .from('materials')
      .delete()
      .eq('id', materialId)
      .eq('partner_id', partnerId);
    if (error) throw error;

    this._events.emit('blueprin:material:deleted', { partnerId, materialId });
  }

  /**
   * Toggle marketplace product active status.
   */
  async toggleMarketplaceProductActive(partnerId: string, materialId: string, aktif: boolean) {
    return this.updateMarketplaceProduct(partnerId, materialId, { aktif });
  }

  /**
   * Get product statistics for a partner.
   */
  async getMarketplaceProductStats(partnerId: string) {
    if (!this._supabase) throw new Error('Supabase client required for marketplace products');

    const products = await this.listMarketplaceProducts({ partnerId });
    const total = products.length;
    const active = products.filter((p) => p.aktif !== false).length;
    const stockValue = products.reduce((sum, p) => sum + (p.harga || 0) * (p.stok || 0), 0);

    const categoryBreakdown: Record<string, number> = {};
    for (const p of products) {
      const cat = p.kategori || 'LAINNYA';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    }

    return { total, active, stockValue, categoryBreakdown };
  }
}
