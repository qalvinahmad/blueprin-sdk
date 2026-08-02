/**
 * Marketplace Module - SDK interface for partners, RFQ, and orders
 */

import { generateId } from '../utils/index.js';

export class MarketplaceClient {
  static PARTNER_TYPES = ['supplier', 'tukang', 'subkontraktor'];
  static CATEGORIES = ['BAHAN', 'ALAT', 'UPAH'];
  static ORDER_STATUSES = ['active', 'completed', 'cancelled'];
  static PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
  static DELIVERY_STATUSES = ['preparing', 'in_transit', 'delivered', 'cancelled'];

  constructor({ storage, hooks, events, supabaseClient }) {
    this._storage = storage;
    this._hooks = hooks;
    this._events = events;
    this._supabase = supabaseClient;
  }

  async listPartners(filters = {}) {
    if (this._supabase) {
      let query = this._supabase.from('marketplace_partners').select('*');
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.city) query = query.eq('city', filters.city);
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    return (await this._storage.get('marketplace:partners')) || [];
  }

  async getPartner(partnerId) {
    if (this._supabase) {
      const { data, error } = await this._supabase
        .from('marketplace_partners')
        .select('*')
        .eq('id', partnerId)
        .single();
      if (error) throw error;
      return data;
    }
    const partners = await this.listPartners();
    return partners.find((p) => p.id === partnerId) || null;
  }

  async listProducts(filters = {}) {
    if (this._supabase) {
      let query = this._supabase.from('materials').select('*');
      if (filters.partnerId) query = query.eq('partner_id', filters.partnerId);
      if (filters.category) query = query.eq('kategori', filters.category);
      if (filters.search) query = query.ilike('nama', `%${filters.search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
    return (await this._storage.get('marketplace:products')) || [];
  }

  async createRFQ(input) {
    const rfq = {
      id: generateId(),
      buyer_id: input.buyer_id,
      buyer_name: input.buyer_name,
      buyer_phone: input.buyer_phone || '',
      project_name: input.project_name || '',
      delivery_address: input.delivery_address || '',
      deadline: input.deadline || null,
      budget_estimate: input.budget_estimate || 0,
      items: input.items || [],
      supplier_ids: input.supplier_ids || [],
      status: 'open',
      notes: input.notes || '',
      created_at: new Date().toISOString(),
    };

    await this._hooks.executeAfter('blueprin:after:rfq:create', { rfq });
    this._events.emit('blueprin:marketplace:rfq:received', { rfq });
    return rfq;
  }

  async submitQuote(rfqId, quote) {
    const fullQuote = {
      id: generateId(),
      rfq_id: rfqId,
      supplier_id: quote.supplier_id,
      supplier_name: quote.supplier_name,
      items: quote.items || [],
      subtotal: quote.subtotal || 0,
      delivery_fee: quote.delivery_fee || 0,
      valid_until: quote.valid_until || null,
      payment_terms: quote.payment_terms || '',
      notes: quote.notes || '',
      submitted_at: new Date().toISOString(),
    };

    this._events.emit('blueprin:marketplace:rfq:quoted', { rfqId, quote: fullQuote });
    return fullQuote;
  }

  async createOrder(input) {
    const ctx = await this._hooks.executeBefore('blueprin:before:order:create', { input });

    const order = {
      id: generateId(),
      buyer_id: ctx.input.buyer_id,
      buyer_name: ctx.input.buyer_name,
      buyer_phone: ctx.input.buyer_phone || '',
      supplier_id: ctx.input.supplier_id,
      rfq_id: ctx.input.rfq_id || null,
      items: ctx.input.items || [],
      subtotal: ctx.input.subtotal || 0,
      shipping_cost: ctx.input.shipping_cost || 0,
      tax_amount: ctx.input.tax_amount || 0,
      service_fee: ctx.input.service_fee || 0,
      grand_total: ctx.input.grand_total || 0,
      payment_method: ctx.input.payment_method || '',
      payment_status: 'pending',
      delivery_address: ctx.input.delivery_address || '',
      delivery_status: 'preparing',
      status: 'active',
      notes: ctx.input.notes || '',
      created_at: new Date().toISOString(),
    };

    await this._hooks.executeAfter('blueprin:after:order:create', { order });
    this._events.emit('blueprin:marketplace:order:created', { order });
    return order;
  }

  async updateOrderDelivery(orderId, deliveryStatus) {
    const order = { id: orderId, delivery_status: deliveryStatus };
    this._events.emit('blueprin:marketplace:order:updated', { order });
    if (deliveryStatus === 'delivered') {
      this._events.emit('blueprin:marketplace:order:completed', { order });
    }
    return order;
  }
}
