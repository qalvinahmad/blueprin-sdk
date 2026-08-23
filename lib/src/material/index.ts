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
  // Core fields (English primary)
  name: string;
  category: string;
  unit: string;
  price: number;
  // Marketplace-only fields
  description?: string;
  image_url?: string;
  stock?: number;
  active?: boolean;
  // Backward-compat aliases (DB column names)
  /** @deprecated Use `name` */
  nama?: string;
  /** @deprecated Use `category` */
  kategori?: string;
  /** @deprecated Use `unit` */
  satuan?: string;
  /** @deprecated Use `price` */
  harga?: number;
  /** @deprecated Use `description` */
  deskripsi?: string;
  /** @deprecated Use `image_url` */
  gambar_url?: string;
  /** @deprecated Use `stock` */
  stok?: number;
  /** @deprecated Use `active` */
  aktif?: boolean;
  supplier?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Map SDK-style input fields to normalized output.
 * English names are primary; Indonesian names are accepted for backward compatibility.
 */
function normalizeInput(input: any): any {
  return {
    name: input.name || input.nama || '',
    category: (input.category || input.kategori || 'BAHAN').toUpperCase(),
    unit: input.unit || input.satuan || 'pcs',
    price: Math.max(0, Number(input.price ?? input.unit_price ?? input.harga ?? 0)),
    description: input.description || input.notes || input.deskripsi || '',
    image_url: input.image_url || input.gambar_url || '',
    stock: Math.max(0, Number(input.stock ?? input.stok ?? 0)),
    active: input.active !== undefined ? input.active : input.aktif !== undefined ? input.aktif : true,
    // Pass through marketplace-only fields
    partner_id: input.partner_id || undefined,
    supplier: input.supplier || '',
  };
}

/**
 * Normalize a DB row to the unified Material interface.
 * DB columns are in Indonesian; English aliases are added for convenience.
 */
function normalizeRow(row: any): Material {
  if (!row) return row;
  return {
    ...row,
    // English aliases from DB columns
    name: row.nama || row.name,
    category: row.kategori || row.category,
    unit: row.satuan || row.unit,
    price: row.harga ?? row.price ?? row.unit_price,
    description: row.deskripsi || row.notes || row.description,
    image_url: row.gambar_url || row.image_url,
    stock: row.stok ?? row.stock,
    active: row.aktif ?? row.active,
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
      price: ctx.input.unit_price ?? ctx.input.price ?? ctx.input.harga ?? 0,
      supplier: ctx.input.supplier || '',
      description: ctx.input.description || ctx.input.notes || ctx.input.deskripsi || '',
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
      const price = m.price ?? m.unit_price ?? m.harga ?? 0;
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
    if (filters.active !== undefined) query = query.eq('aktif', filters.active);
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
      nama: normalized.name,
      kategori: normalized.category,
      satuan: normalized.unit,
      harga: normalized.price,
      deskripsi: normalized.description,
      gambar_url: normalized.image_url,
      stok: normalized.stock,
      aktif: normalized.active,
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
      // Also accept English aliases
      if (key === 'nama' && patch.name !== undefined) payload.nama = patch.name;
      if (key === 'kategori' && patch.category !== undefined) payload.kategori = patch.category.toUpperCase();
      if (key === 'satuan' && patch.unit !== undefined) payload.satuan = patch.unit;
      if (key === 'harga' && (patch.price !== undefined || patch.unit_price !== undefined)) payload.harga = Math.max(0, Number(patch.price ?? patch.unit_price));
      if (key === 'deskripsi' && (patch.description !== undefined || patch.notes !== undefined)) payload.deskripsi = patch.description || patch.notes;
      if (key === 'gambar_url' && patch.image_url !== undefined) payload.gambar_url = patch.image_url;
      if (key === 'stok' && patch.stock !== undefined) payload.stok = Math.max(0, Number(patch.stock));
      if (key === 'aktif' && patch.active !== undefined) payload.aktif = patch.active;
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
  async toggleMarketplaceProductActive(partnerId: string, materialId: string, active: boolean) {
    return this.updateMarketplaceProduct(partnerId, materialId, { active, aktif: active });
  }

  /**
   * Get product statistics for a partner.
   */
  async getMarketplaceProductStats(partnerId: string) {
    if (!this._supabase) throw new Error('Supabase client required for marketplace products');

    const products = await this.listMarketplaceProducts({ partnerId });
    const total = products.length;
    const active = products.filter((p) => (p.active ?? p.aktif) !== false).length;
    const stockValue = products.reduce((sum, p) => sum + (p.price ?? p.harga ?? 0) * (p.stock ?? p.stok ?? 0), 0);

    const categoryBreakdown: Record<string, number> = {};
    for (const p of products) {
      const cat = p.category || p.kategori || 'LAINNYA';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    }

    return { total, active, stockValue, categoryBreakdown };
  }
}
