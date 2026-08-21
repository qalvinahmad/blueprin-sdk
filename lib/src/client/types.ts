/**
 * Types for Blueprin Public API
 */

export interface BlueprinClientOptions {
  apiKey: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  error?: string;
}

export interface AhsComponent {
  id?: string;
  name: string;
  category: 'MATERIAL' | 'LABOR' | 'EQUIPMENT';
  unit: string;
  coefficient: number;
  unit_price: number;
  subtotal: number;
  // Deprecated Indonesian aliases
  /** @deprecated Use `name` */
  nama?: string;
  /** @deprecated Use `category` */
  kategori?: 'MATERIAL' | 'UPAH' | 'ALAT';
  /** @deprecated Use `unit` */
  satuan?: string;
  /** @deprecated Use `coefficient` */
  koefisien?: number;
  /** @deprecated Use `unit_price` */
  harga_satuan?: number;
}

export interface AhsItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  group: string;
  total_price: number;
  total_material: number;
  total_labor: number;
  total_equipment: number;
  component_count?: number;
  components?: AhsComponent[];
  // Deprecated Indonesian aliases
  /** @deprecated Use `code` */
  kode?: string;
  /** @deprecated Use `name` */
  nama?: string;
  /** @deprecated Use `unit` */
  satuan?: string;
  /** @deprecated Use `group` */
  kelompok?: string;
  /** @deprecated Use `total_price` */
  total_harga?: number;
  /** @deprecated Use `total_material` */
  total_bahan?: number;
  /** @deprecated Use `total_labor` */
  total_upah?: number;
  /** @deprecated Use `total_equipment` */
  total_alat?: number;
}

export interface ListAhsParams {
  id?: string;
  search?: string;
  group?: string;
  limit?: number;
  offset?: number;
  /** @deprecated Use `group` */
  kelompok?: string;
}

export interface PublicMaterial {
  id: string;
  name: string;
  category: 'MATERIAL' | 'LABOR' | 'EQUIPMENT';
  unit: string;
  price: number;
  specification?: string;
  code?: string;
  // Deprecated Indonesian aliases
  /** @deprecated Use `name` */
  nama?: string;
  /** @deprecated Use `category` */
  kategori?: 'MATERIAL' | 'UPAH' | 'ALAT';
  /** @deprecated Use `unit` */
  satuan?: string;
  /** @deprecated Use `price` */
  harga?: number;
  /** @deprecated Use `specification` */
  spesifikasi?: string;
}

export interface ListMaterialsParams {
  id?: string;
  category?: 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | string;
  search?: string;
  limit?: number;
  offset?: number;
  /** @deprecated Use `category` */
  kategori?: 'MATERIAL' | 'UPAH' | 'ALAT' | string;
}

export interface PublicRabItem {
  id: string;
  project_id: string;
  description: string;
  category: string;
  volume: number;
  unit: string;
  unit_price: number;
  total_price: number;
  code?: string;
  // Deprecated Indonesian aliases
  /** @deprecated Use `description` */
  uraian?: string;
  /** @deprecated Use `category` */
  kategori?: string;
  /** @deprecated Use `unit` */
  satuan?: string;
  /** @deprecated Use `unit_price` */
  harga_satuan?: number;
  /** @deprecated Use `total_price` */
  total_harga?: number;
  /** @deprecated Use `code` */
  kode?: string;
}

export interface ListRabParams {
  project_id: string;
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
  /** @deprecated Use `category` */
  kategori?: string;
}

export interface ApiPlan {
  code: string;
  name: string;
  price_amount: number;
  currency?: string;
  requests_per_day: number;
  requests_per_month: number;
  rate_limit_per_second: number;
  duration_days?: number;
  features?: string[];
}

export interface ApiUsageStats {
  period_days: number;
  total_requests: number;
  success_requests: number;
  failed_requests: number;
  avg_response_time_ms: number;
  by_endpoint?: Record<string, number>;
  by_day?: Array<{ date: string; count: number }>;
}
