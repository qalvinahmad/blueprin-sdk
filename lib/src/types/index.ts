/**
 * Shared TypeScript types for Blueprin platform.
 *
 * These types define the contracts between:
 *   - blueprin-sdk (core SDK)
 *   - blueprin-app-main (buyer/desktop app)
 *   - blueprin-partner-main (seller/partner dashboard)
 *
 * All Supabase tables map 1:1 to these interfaces.
 */

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

// ─── Marketplace Partners ─────────────────────────────────────────────────────

export type PartnerType = 'supplier' | 'tukang' | 'subkontraktor';

export interface MarketplacePartner {
  id: string;
  user_id?: string;
  name: string;
  type: PartnerType;
  city?: string;
  province?: string;
  rating: number;
  verified: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  // Contact
  email?: string;
  phone?: string;
  whatsapp?: string;
  // Profile
  description?: string;
  logo_url?: string;
  categories: string[];
  year_established?: number;
  // Logistics
  min_order: number;
  delivery_radius: number;
  delivery_fee?: string;
  payment_methods: string[];
  // Stats
  completed_orders: number;
  completed_jobs: number;
  reviews: number;
  // Tukang-specific
  specialization?: string;
  rate_oh: number;
  rate_borongan?: string;
  years_experience: number;
  portfolio: string[];
  team_size: number;
  photo?: string;
  available: boolean;
  available_from?: string;
}

// ─── Materials / Products ─────────────────────────────────────────────────────

export type MaterialCategory = 'BAHAN' | 'ALAT' | 'UPAH' | 'LAINNYA';

export interface Material {
  id: string;
  // Project context (for RAB/Catalog in main app)
  project_id?: string;
  // Marketplace context (for seller products)
  partner_id?: string;
  // Core fields (DB column names)
  nama: string;
  kategori: MaterialCategory | string;
  satuan: string;
  harga: number;
  // Marketplace-only fields
  deskripsi?: string;
  gambar_url?: string;
  stok?: number;
  aktif?: boolean;
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

// ─── RAB (Rencana Anggaran Biaya) ────────────────────────────────────────────

export interface RabItem {
  id: string;
  project_id: string;
  work_name: string;
  unit: string;
  volume: number;
  unit_price: number;
  notes?: string;
  ahs_item_id?: string;
  kategori?: string;
  kode?: string;
  uraian?: string;
  created_at?: string;
}

export interface RabCalculation {
  projectId: string;
  items: RabItem[];
  baseTotal: number;
  overheadTotal: number;
  profitTotal: number;
  taxTotal: number;
  grandTotal: number;
  totalItems: number;
  calculatedAt: string;
}

// ─── Project Items (project_items table) ──────────────────────────────────────

export interface ProjectItem {
  id: string;
  project_id: string;
  nama_item: string;
  volume: number;
  satuan: string;
  harga_satuan: number;
  kode?: string;
  kategori?: string;
  user_id?: string;
  created_at?: string;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export type SchedulePhase =
  | 'PERSIAPAN' | 'STRUKTUR' | 'DINDING' | 'ATAP'
  | 'PLESTERAN' | 'KERAMIK' | 'KUSEN' | 'PINTU'
  | 'JENDELA' | 'PLAFON' | 'ELEKTRIK' | 'PLUMBING' | 'FINISHING';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  column?: string;
  priority: TaskPriority;
  tags?: string[];
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  kategori?: string;
  status: TaskStatus;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  projectId: string;
  phases: any[];
  tasks: Task[];
  startDate?: string;
  workDaysPerWeek: number;
  createdAt?: string;
}

// ─── RFQ (Request For Quote) ─────────────────────────────────────────────────

export type RFQStatus = 'open' | 'quoted' | 'accepted' | 'closed';

export interface RFQItem {
  uraian: string;
  satuan: string;
  volume: number;
  referencePrice?: number;
}

export interface RFQ {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_phone?: string;
  project_id?: string;
  project_name?: string;
  delivery_address?: string;
  deadline?: string;
  budget_estimate?: number;
  items: RFQItem[];
  supplier_ids: string[];
  status: RFQStatus;
  notes?: string;
  created_at?: string;
}

export interface RFQQuote {
  id: string;
  rfq_id: string;
  supplier_id: string;
  supplier_name?: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  valid_until?: string;
  payment_terms?: string;
  notes?: string;
  submitted_at: string;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'active' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DeliveryStatus = 'preparing' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderItem {
  name: string;
  quantity: number;
  unit_price: number;
  subtotal?: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  buyer_name?: string;
  buyer_phone?: string;
  supplier_id: string;
  rfq_id?: string;
  items: OrderItem[];
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  service_fee: number;
  grand_total: number;
  payment_method?: string;
  payment_status: PaymentStatus;
  payment_ref?: string;
  delivery_address?: string;
  delivery_status: DeliveryStatus;
  awb?: string;
  courier?: string;
  status: OrderStatus;
  notes?: string;
  created_at?: string;
}

// ─── Workforce ────────────────────────────────────────────────────────────────

export type WorkerRole = 'TUKANG' | 'MANDOR' | 'SPV' | 'OPERATOR' | 'LAGI';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY';

export interface Worker {
  id: string;
  project_id: string;
  name: string;
  role: WorkerRole | string;
  daily_rate: number;
  overtime_rate: number;
  phone?: string;
  created_at?: string;
}

export interface Attendance {
  id: string;
  project_id: string;
  worker_id: string;
  date: string;
  status: AttendanceStatus;
  overtime_hours: number;
  notes?: string;
  logged_at: string;
}

export interface WageCalculation {
  workerId: string;
  periodStart: string;
  periodEnd: string;
  baseWages: number;
  overtimeWages: number;
  total: number;
  daysPresent: number;
}

// ─── Project ──────────────────────────────────────────────────────────────────

export type ProjectStatus = 'baru' | 'berjalan' | 'selesai' | 'dibatalkan';

export interface Project {
  id: string;
  name: string;
  location?: string;
  deadline?: string;
  client_name?: string;
  building_area_m2?: number;
  budget?: number;
  jenis_bangunan?: string;
  status_proyek: ProjectStatus;
  meta?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// ─── Plugin System ────────────────────────────────────────────────────────────

export type PluginLifecycle =
  | 'registered' | 'initializing' | 'ready' | 'active'
  | 'suspended' | 'error' | 'destroyed';

export type PluginStatus = 'installed' | 'enabled' | 'disabled' | 'updating';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  permissions?: string[];
  ui?: {
    menus?: any[];
    panels?: any[];
    widgets?: any[];
    pages?: any[];
  };
}

// ─── Connector ────────────────────────────────────────────────────────────────

export type ConnectorProtocol = 'rest' | 'soap' | 'grpc' | 'websocket';
export type ConnectorStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface ConnectorConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

// ─── Telemetry ────────────────────────────────────────────────────────────────

export type TelemetryLifecycle = 'track' | 'enable' | 'disable' | 'handler_added' | 'handler_removed';

export interface TelemetryContext {
  track: (eventName: string, payload?: Record<string, any>) => Promise<any>;
  isEnabled: () => boolean;
}
