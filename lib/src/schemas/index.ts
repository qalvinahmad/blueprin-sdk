/**
 * Zod validation schemas for Blueprin types.
 *
 * Usage:
 *   import { materialSchema, partnerSchema } from '@alvinahmad/blueprin-sdk/schemas';
 *
 *   const result = materialSchema.safeParse(input);
 *   if (!result.success) console.error(result.error);
 */

// ─── Lightweight Zod-like validators ─────────────────────────────────────────
// Since Zod is a heavy dependency, we provide lightweight validators that
// return { success, data, error } compatible with Zod's interface.
// For full Zod validation, use Zod directly with the TypeScript types.

interface ValidationRule {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array';
  min?: number;
  max?: number;
  minLength?: number;
  oneOf?: readonly string[];
}

interface ValidationResult {
  success: boolean;
  data: any;
  error?: { issues: { message: string }[] };
}

function validate(input: unknown, rules: Record<string, ValidationRule>): ValidationResult {
  const errors: string[] = [];
  const obj = input as Record<string, unknown>;
  for (const [field, rule] of Object.entries(rules)) {
    const value = obj?.[field];
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }
    if (value === undefined || value === null) continue;
    if (rule.type === 'string' && typeof value !== 'string') {
      errors.push(`${field} must be a string`);
    }
    if (rule.type === 'number' && typeof value !== 'number') {
      errors.push(`${field} must be a number`);
    }
    if (rule.type === 'boolean' && typeof value !== 'boolean') {
      errors.push(`${field} must be a boolean`);
    }
    if (rule.type === 'array' && !Array.isArray(value)) {
      errors.push(`${field} must be an array`);
    }
    if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
      errors.push(`${field} must be >= ${rule.min}`);
    }
    if (rule.max !== undefined && typeof value === 'number' && value > rule.max) {
      errors.push(`${field} must be <= ${rule.max}`);
    }
    if (rule.minLength !== undefined && typeof value === 'string' && value.length < rule.minLength) {
      errors.push(`${field} must be at least ${rule.minLength} characters`);
    }
    if (rule.oneOf && !rule.oneOf.includes(value as string)) {
      errors.push(`${field} must be one of: ${rule.oneOf.join(', ')}`);
    }
  }
  if (errors.length > 0) {
    return { success: false, data: undefined, error: { issues: errors.map(e => ({ message: e })) } };
  }
  return { success: true, data: input, error: undefined };
}

// ─── Material Schema ─────────────────────────────────────────────────────────

export const materialSchema = {
  parse: (input) => validate(input, {
    nama: { required: true, type: 'string', minLength: 1 },
    kategori: { type: 'string', oneOf: ['BAHAN', 'ALAT', 'UPAH', 'LAINNYA'] },
    satuan: { type: 'string' },
    harga: { type: 'number', min: 0 },
    stok: { type: 'number', min: 0 },
    aktif: { type: 'boolean' },
  }),
  safeParse: (input) => validate(input, {
    nama: { required: true, type: 'string', minLength: 1 },
    kategori: { type: 'string', oneOf: ['BAHAN', 'ALAT', 'UPAH', 'LAINNYA'] },
    satuan: { type: 'string' },
    harga: { type: 'number', min: 0 },
    stok: { type: 'number', min: 0 },
    aktif: { type: 'boolean' },
  }),
};

// ─── Partner Schema ──────────────────────────────────────────────────────────

export const partnerSchema = {
  parse: (input) => validate(input, {
    name: { required: true, type: 'string', minLength: 1 },
    type: { required: true, type: 'string', oneOf: ['supplier', 'tukang', 'subkontraktor'] },
    city: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string' },
    rating: { type: 'number', min: 0, max: 5 },
    verified: { type: 'boolean' },
    active: { type: 'boolean' },
    categories: { type: 'array' },
    min_order: { type: 'number', min: 0 },
    delivery_radius: { type: 'number', min: 0 },
  }),
  safeParse: (input) => validate(input, {
    name: { required: true, type: 'string', minLength: 1 },
    type: { required: true, type: 'string', oneOf: ['supplier', 'tukang', 'subkontraktor'] },
    city: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string' },
    rating: { type: 'number', min: 0, max: 5 },
    verified: { type: 'boolean' },
    active: { type: 'boolean' },
    categories: { type: 'array' },
    min_order: { type: 'number', min: 0 },
    delivery_radius: { type: 'number', min: 0 },
  }),
};

// ─── RFQ Schema ──────────────────────────────────────────────────────────────

export const rfqSchema = {
  parse: (input) => validate(input, {
    buyer_id: { required: true, type: 'string' },
    items: { required: true, type: 'array' },
    supplier_ids: { required: true, type: 'array' },
    status: { type: 'string', oneOf: ['open', 'quoted', 'accepted', 'closed'] },
  }),
  safeParse: (input) => validate(input, {
    buyer_id: { required: true, type: 'string' },
    items: { required: true, type: 'array' },
    supplier_ids: { required: true, type: 'array' },
    status: { type: 'string', oneOf: ['open', 'quoted', 'accepted', 'closed'] },
  }),
};

// ─── Order Schema ────────────────────────────────────────────────────────────

export const orderSchema = {
  parse: (input) => validate(input, {
    buyer_id: { required: true, type: 'string' },
    supplier_id: { required: true, type: 'string' },
    items: { required: true, type: 'array' },
    subtotal: { type: 'number', min: 0 },
    grand_total: { type: 'number', min: 0 },
    payment_status: { type: 'string', oneOf: ['pending', 'paid', 'failed', 'refunded'] },
    delivery_status: { type: 'string', oneOf: ['preparing', 'in_transit', 'delivered', 'cancelled'] },
    status: { type: 'string', oneOf: ['active', 'completed', 'cancelled'] },
  }),
  safeParse: (input) => validate(input, {
    buyer_id: { required: true, type: 'string' },
    supplier_id: { required: true, type: 'string' },
    items: { required: true, type: 'array' },
    subtotal: { type: 'number', min: 0 },
    grand_total: { type: 'number', min: 0 },
    payment_status: { type: 'string', oneOf: ['pending', 'paid', 'failed', 'refunded'] },
    delivery_status: { type: 'string', oneOf: ['preparing', 'in_transit', 'delivered', 'cancelled'] },
    status: { type: 'string', oneOf: ['active', 'completed', 'cancelled'] },
  }),
};

// ─── Worker Schema ───────────────────────────────────────────────────────────

export const workerSchema = {
  parse: (input) => validate(input, {
    name: { required: true, type: 'string', minLength: 1 },
    project_id: { required: true, type: 'string' },
    daily_rate: { type: 'number', min: 0 },
    overtime_rate: { type: 'number', min: 0 },
  }),
  safeParse: (input) => validate(input, {
    name: { required: true, type: 'string', minLength: 1 },
    project_id: { required: true, type: 'string' },
    daily_rate: { type: 'number', min: 0 },
    overtime_rate: { type: 'number', min: 0 },
  }),
};

// ─── Project Schema ──────────────────────────────────────────────────────────

export const projectSchema = {
  parse: (input) => validate(input, {
    name: { required: true, type: 'string', minLength: 1 },
    status_proyek: { type: 'string', oneOf: ['baru', 'berjalan', 'selesai', 'dibatalkan'] },
    budget: { type: 'number', min: 0 },
    building_area_m2: { type: 'number', min: 0 },
  }),
  safeParse: (input) => validate(input, {
    name: { required: true, type: 'string', minLength: 1 },
    status_proyek: { type: 'string', oneOf: ['baru', 'berjalan', 'selesai', 'dibatalkan'] },
    budget: { type: 'number', min: 0 },
    building_area_m2: { type: 'number', min: 0 },
  }),
};

// ─── Plugin Manifest Schema ──────────────────────────────────────────────────

export const pluginManifestSchema = {
  parse: (input) => validate(input, {
    id: { required: true, type: 'string', minLength: 1 },
    name: { required: true, type: 'string', minLength: 1 },
    version: { required: true, type: 'string', minLength: 1 },
  }),
  safeParse: (input) => validate(input, {
    id: { required: true, type: 'string', minLength: 1 },
    name: { required: true, type: 'string', minLength: 1 },
    version: { required: true, type: 'string', minLength: 1 },
  }),
};
