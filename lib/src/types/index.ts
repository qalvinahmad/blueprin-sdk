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

/** Plugin pricing model type. */
export type PluginPricingType = 'free' | 'premium' | 'subscription';

/** Subscription billing interval. */
export type SubscriptionInterval = 'monthly' | 'quarterly' | 'yearly';

/** Plugin pricing configuration. */
export interface PluginPricing {
  type: PluginPricingType;
  /** Price in IDR (Indonesian Rupiah). 0 for free plugins. */
  amount: number;
  currency: string;
  /** Number of days for trial period. 0 = no trial. */
  trialDays?: number;
  /** Subscription billing interval (only for type: subscription). */
  interval?: SubscriptionInterval;
  /** Features included in free tier (for freemium plugins). */
  freeFeatures?: string[];
  /** Features reserved for paid tier. */
  premiumFeatures?: string[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
  permissions?: string[];
  /** Plugin pricing configuration. */
  pricing?: PluginPricing;
  ui?: {
    menus?: any[];
    panels?: any[];
    widgets?: any[];
    pages?: any[];
  };
}

// ─── Plugin License Keys ─────────────────────────────────────────────────────

export type LicenseStatus =
  | 'active'
  | 'expired'
  | 'revoked'
  | 'pending'
  | 'trial';

export type LicenseActivationStatus = 'active' | 'deactivated' | 'expired';

/** A license key granted after plugin purchase. */
export interface PluginLicenseKey {
  id: string;
  pluginId: string;
  pluginSlug: string;
  userId: string;
  /** Human-readable license key (e.g., BP-XXXX-XXXX-XXXX). */
  key: string;
  status: LicenseStatus;
  /** When the license was issued. */
  issuedAt: string;
  /** When the license expires (null for lifetime). */
  expiresAt?: string;
  /** Payment transaction ID linked to this license. */
  paymentTransactionId?: string;
  /** Number of allowed device activations. 0 = unlimited. */
  maxActivations: number;
  /** Current activation count. */
  activationCount: number;
  /** Plugin version this license was issued for. */
  version: string;
  createdAt: string;
  updatedAt: string;
}

/** A device activation record for a license key. */
export interface PluginLicenseActivation {
  id: string;
  licenseId: string;
  /** Unique device/machine identifier. */
  deviceId: string;
  /** Human-readable device name. */
  deviceName?: string;
  status: LicenseActivationStatus;
  activatedAt: string;
  lastSeenAt?: string;
  deactivatedAt?: string;
}

// ─── Plugin Subscriptions ────────────────────────────────────────────────────

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'trialing'
  | 'paused'
  | 'expired';

/** A user's subscription to a premium plugin. */
export interface PluginSubscription {
  id: string;
  pluginId: string;
  pluginSlug: string;
  userId: string;
  status: SubscriptionStatus;
  /** Current subscription plan (monthly/quarterly/yearly). */
  interval: SubscriptionInterval;
  /** Price per billing cycle in IDR. */
  amount: number;
  currency: string;
  /** DOKU subscription reference ID. */
  dokuSubscriptionId?: string;
  /** When the current billing period started. */
  currentPeriodStart: string;
  /** When the current billing period ends. */
  currentPeriodEnd: string;
  /** When the trial period ends (null if no trial). */
  trialEnd?: string;
  /** When the subscription was cancelled (null if active). */
  cancelledAt?: string;
  /** Whether cancellation takes effect at period end. */
  cancelAtPeriodEnd?: boolean;
  /** Last payment transaction ID. */
  lastPaymentTransactionId?: string;
  /** Next billing date. */
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
}

/** Plugin developer revenue summary. */
export interface PluginDeveloperRevenue {
  developerId: string;
  developerName: string;
  totalRevenue: number;
  /** Platform fee (typically 15-30%). */
  platformFee: number;
  /** Developer net earnings after platform fee. */
  netEarnings: number;
  /** Total plugin sales count. */
  totalSales: number;
  /** Active subscribers count. */
  activeSubscribers: number;
  /** Revenue breakdown by plugin. */
  pluginBreakdown: PluginRevenueItem[];
  period: {
    start: string;
    end: string;
  };
}

/** Individual plugin revenue item. */
export interface PluginRevenueItem {
  pluginId: string;
  pluginName: string;
  pluginSlug: string;
  /** One-time purchase revenue. */
  purchaseRevenue: number;
  /** Subscription revenue. */
  subscriptionRevenue: number;
  totalRevenue: number;
  totalPurchases: number;
  activeSubscribers: number;
  /** Revenue share percentage for developer (e.g., 70 = 70%). */
  revenueSharePercent: number;
  developerEarnings: number;
}

/** Platform fee configuration. */
export interface PlatformFeeConfig {
  /** Percentage taken by platform (e.g., 20 = 20%). */
  platformFeePercent: number;
  /** Developer receives this percentage. */
  developerFeePercent: number;
  /** Minimum payout amount in IDR. */
  minimumPayout: number;
  /** Payment schedule (e.g., 'monthly'). */
  payoutSchedule: string;
}

// ─── License Management Application (LMA) ────────────────────────────────────

/**
 * License tier determines how users are licensed.
 * - site-wide: All users in org automatically have access
 * - per-user: Admin must manually assign licenses to users
 * - feature-gated: Features are gated by entitlements
 */
export type LicenseTier = 'site-wide' | 'per-user' | 'feature-gated';

/** Status of an org-level license. */
export type OrgLicenseStatus = 
  | 'active' 
  | 'expired' 
  | 'suspended' 
  | 'trial' 
  | 'pending';

/** Status of a user-level license assignment. */
export type UserLicenseStatus = 'assigned' | 'revoked' | 'pending';

/**
 * Org-level license — automatically created when plugin is installed.
 * Binds plugin to an organization (org_id).
 */
export interface OrgLicense {
  id: string;
  /** Plugin this license is for. */
  pluginId: string;
  pluginSlug: string;
  pluginName: string;
  /** Organization ID (org_id) that installed the plugin. */
  orgId: string;
  /** Organization name. */
  orgName?: string;
  /** License tier: site-wide, per-user, or feature-gated. */
  tier: LicenseTier;
  /** License status. */
  status: OrgLicenseStatus;
  /** Maximum users allowed (0 = unlimited, only for per-user tier). */
  maxSeats: number;
  /** Currently assigned seats count. */
  usedSeats: number;
  /** When the license was created (auto on install). */
  issuedAt: string;
  /** When the license expires (null for lifetime). */
  expiresAt?: string;
  /** Payment transaction ID linked to this license. */
  paymentTransactionId?: string;
  /** Plugin version this license was issued for. */
  version: string;
  /** Whether the license is currently active. */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * User-level license — for per-user tier licensing.
 * Admin assigns licenses to specific users via LMA admin.
 */
export interface UserLicense {
  id: string;
  /** Reference to the org license. */
  orgLicenseId: string;
  /** Plugin ID. */
  pluginId: string;
  /** User ID being assigned the license. */
  userId: string;
  /** User email for display. */
  userEmail?: string;
  /** User full name for display. */
  userName?: string;
  /** License assignment status. */
  status: UserLicenseStatus;
  /** When the license was assigned. */
  assignedAt: string;
  /** Who assigned the license (admin user ID). */
  assignedBy?: string;
  /** When the license was revoked (if applicable). */
  revokedAt?: string;
  /** Last time this user accessed the plugin. */
  lastAccessAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Feature entitlement — for feature-gated licensing.
 * Defines which features are available at each tier.
 */
export interface FeatureEntitlement {
  id: string;
  /** Plugin ID. */
  pluginId: string;
  /** Feature key (e.g., 'advanced_reporting', 'api_access'). */
  featureKey: string;
  /** Human-readable feature name. */
  featureName: string;
  /** Description of what this feature enables. */
  description?: string;
  /** Which tier includes this feature (free, premium, enterprise). */
  tier: 'free' | 'premium' | 'enterprise';
  /** Whether this feature is currently enabled. */
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Plugin feature definition — declared in plugin manifest.
 * Plugin defines its features and their tier requirements.
 */
export interface PluginFeature {
  /** Unique feature key. */
  key: string;
  /** Display name. */
  name: string;
  /** Description. */
  description?: string;
  /** Minimum tier required to access this feature. */
  minTier: 'free' | 'premium' | 'enterprise';
  /** Whether this feature requires external API connection. */
  requiresExternalAuth?: boolean;
}

/**
 * External connector auth — for plugins that connect to SaaS.
 * Stores API keys/OAuth tokens securely.
 */
export interface ExternalConnectorAuth {
  id: string;
  /** Plugin ID. */
  pluginId: string;
  /** Organization ID. */
  orgId: string;
  /** Connector type (e.g., 'erp', 'ai', 'accounting'). */
  connectorType: string;
  /** Display name for this connection. */
  displayName: string;
  /** Encrypted API key or OAuth token (never store plaintext). */
  encryptedCredentials: string;
  /** OAuth refresh token (if applicable). */
  encryptedRefreshToken?: string;
  /** Connection status. */
  status: 'active' | 'expired' | 'error' | 'revoked';
  /** When the credentials were last refreshed. */
  lastRefreshedAt?: string;
  /** When the credentials expire. */
  expiresAt?: string;
  /** Error message if connection failed. */
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

/** LMA license check result. */
export interface LicenseCheckResult {
  /** Whether the license is valid. */
  valid: boolean;
  /** License status. */
  status: OrgLicenseStatus | UserLicenseStatus;
  /** License tier. */
  tier: LicenseTier;
  /** Reason if invalid (e.g., 'expired', 'no_seats', 'revoked'). */
  reason?: string;
  /** Number of days until expiry (null if lifetime). */
  daysUntilExpiry?: number;
  /** Whether the user has a valid license. */
  userLicensed?: boolean;
  /** Whether the feature is available. */
  featureAvailable?: boolean;
}

/** LMA feature check result. */
export interface FeatureCheckResult {
  /** Whether the feature is available. */
  available: boolean;
  /** Feature key checked. */
  featureKey: string;
  /** Required tier for this feature. */
  requiredTier: string;
  /** Current org tier. */
  orgTier: string;
  /** Reason if not available. */
  reason?: string;
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

// ─── Report Builder ──────────────────────────────────────────────────────────

export type ReportFormat = 'csv' | 'json' | 'markdown' | 'xlsx' | 'pdf';

export type ReportDataSource =
  | 'rab_items'
  | 'ahs'
  | 'materials'
  | 'labor'
  | 'equipment'
  | 'schedule'
  | 'workforce'
  | 'project'
  | 'custom';

export interface ReportTypeConfig {
  id: string;
  name: string;
  description?: string;
  dataSources: ReportDataSource[];
  defaultFormat: ReportFormat;
  columns: ReportColumn[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReportColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean';
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: string;
}

export interface ReportGenerateOptions {
  format?: ReportFormat;
  projectId?: string;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, any>;
  columns?: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ReportResult {
  success: boolean;
  reportType: string;
  format: ReportFormat;
  data: any;
  totalRows: number;
  generatedAt: string;
  error?: string;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  type: ReportTypeConfig;
  pluginId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Indeks Kemahalan Konstruksi (IKK) — Construction Cost Index ─────────────
//
// IKK is published annually by BPS (Badan Pusat Statistik).
// It measures relative construction costs across Indonesian regions.
// Reference city changes yearly (Banjarmasin=2024, Makassar=2023, etc.).
//
// Key concepts:
//   - IKK = 100: costs equal the reference city
//   - IKK > 100: more expensive than reference
//   - IKK < 100: cheaper than reference
//   - Formula: adjustedCost = baseCost × (ikk / 100)
//
// Data covers 38 provinces and 514 kabupaten/kota.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * IKK Reference City — the base city used as 100 for index calculation.
 * Changes yearly per BPS publication. Each year a different city is chosen
 * as the reference to ensure national comparability.
 */
export type IKKReferenceCity = 
  | 'Banjarmasin'  // 2024
  | 'Makassar'     // 2021-2023
  | 'Semarang'     // 2018-2020
  | 'Surabaya'     // 2015-2017
  | 'Samarinda';   // 2012-2014

/**
 * IKK Component — the cost components used in IKK calculation.
 * Based on Basket of Construction Components (BOCC) approach.
 * Each component type has a weight in the overall IKK calculation.
 */
export type IKKComponentType = 
  | 'material'      // Harga bahan bangunan
  | 'equipment'     // Sewa alat berat
  | 'labor'         // Upah jasa konstruksi
  | 'overhead'      // Biaya overhead
  | 'profit';       // Keuntungan

/**
 * Province data — 38 provinsi di Indonesia.
 * Each province has a BPS code, IKK value, and ranking among all provinces.
 */
export interface IKKProvince {
  id: string;
  /** BPS province code (e.g., '1100' for Aceh). */
  code: string;
  /** Province name in Indonesian. */
  name: string;
  /** Province name in English. */
  nameEn?: string;
  /** Island/region group (Sumatera, Jawa, Kalimantan, Sulawesi, Bali-Nusa Tenggara, Maluku-Papua). */
  region: string;
  /** IKK value for the given year. */
  ikk: number;
  /** Ranking among all provinces (1 = most expensive). */
  ranking: number;
  /** Reference city used for this year's calculation. */
  referenceCity: IKKReferenceCity;
  /** Data year. */
  year: number;
  /** Whether IKK > 100 (more expensive than reference). */
  isAboveReference: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * City/Kabupaten data — 514 kabupaten/kota di Indonesia.
 * Each city belongs to a province and has its own IKK value and ranking.
 */
export interface IKKCity {
  id: string;
  /** Parent province code. */
  provinceCode: string;
  /** BPS city code (e.g., '7371' for Makassar). */
  code: string;
  /** City/Kabupaten name. */
  name: string;
  /** IKK value for the given year. */
  ikk: number;
  /** Ranking within the province. */
  ranking: number;
  /** Reference city used for this year's calculation. */
  referenceCity: IKKReferenceCity;
  /** Data year. */
  year: number;
  /** Whether IKK > 100 (more expensive than reference). */
  isAboveReference: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * IKK Component Detail — detailed breakdown of IKK components.
 * Shows individual material, equipment, and labor costs that make up the IKK.
 */
export interface IKKComponentDetail {
  id: string;
  /** Province or city code. */
  locationCode: string;
  /** Location type: 'province' or 'city'. */
  locationType: 'province' | 'city';
  /** Component type. */
  componentType: IKKComponentType;
  /** Component name (e.g., 'Semen Portland', 'Besi Beton'). */
  name: string;
  /** Component value/index. */
  value: number;
  /** Weight in IKK calculation. */
  weight: number;
  /** Unit of measurement. */
  unit: string;
  /** Data year. */
  year: number;
  /** Data quarter (Q1-Q4). */
  quarter?: number;
  createdAt?: string;
}

/**
 * IKK Historical Data — yearly IKK trends for a location.
 * Useful for tracking how construction costs change over time.
 */
export interface IKKHistory {
  locationCode: string;
  locationName: string;
  locationType: 'province' | 'city';
  /** Yearly IKK values. */
  data: Array<{
    year: number;
    ikk: number;
    ranking?: number;
    referenceCity: IKKReferenceCity;
  }>;
}

/**
 * IKK Comparison — compare IKK between multiple locations.
 * Shows side-by-side IKK values for cost analysis across regions.
 */
export interface IKKComparison {
  /** Reference city IKK (always 100). */
  referenceCity: IKKReferenceCity;
  /** Locations to compare. */
  locations: Array<{
    code: string;
    name: string;
    type: 'province' | 'city';
    ikk: number;
    ranking?: number;
    isAboveReference: boolean;
  }>;
  /** Year of comparison. */
  year: number;
}

/**
 * IKK Cost Estimate — estimated construction cost based on IKK.
 * Formula: adjustedCost = baseCost × (ikk / 100)
 */
export interface IKKCostEstimate {
  /** Base cost in reference city (IDR). */
  baseCost: number;
  /** Adjusted cost for target location (IDR). */
  adjustedCost: number;
  /** IKK multiplier. */
  multiplier: number;
  /** Target location code. */
  locationCode: string;
  /** Target location name. */
  locationName: string;
  /** IKK value used. */
  ikk: number;
  /** Reference city. */
  referenceCity: IKKReferenceCity;
  /** Year. */
  year: number;
}

/**
 * IKK Region — grouping of provinces by island/region.
 * Used for filtering and organizing the 38 provinces into 6 major regions.
 */
export type IKKRegion = 
  | 'Sumatera'
  | 'Jawa'
  | 'Kalimantan'
  | 'Sulawesi'
  | 'Bali & Nusa Tenggara'
  | 'Maluku & Papua';

/** 38 Provinsi Indonesia with BPS codes and region groupings. */
export const INDONESIA_PROVINCES = [
  { code: '1100', name: 'Aceh', region: 'Sumatera' },
  { code: '1200', name: 'Sumatera Utara', region: 'Sumatera' },
  { code: '1300', name: 'Sumatera Barat', region: 'Sumatera' },
  { code: '1400', name: 'Riau', region: 'Sumatera' },
  { code: '1500', name: 'Jambi', region: 'Sumatera' },
  { code: '1600', name: 'Sumatera Selatan', region: 'Sumatera' },
  { code: '1700', name: 'Bengkulu', region: 'Sumatera' },
  { code: '1800', name: 'Lampung', region: 'Sumatera' },
  { code: '1900', name: 'Kepulauan Bangka Belitung', region: 'Sumatera' },
  { code: '2100', name: 'Kepulauan Riau', region: 'Sumatera' },
  { code: '3100', name: 'DKI Jakarta', region: 'Jawa' },
  { code: '3200', name: 'Jawa Barat', region: 'Jawa' },
  { code: '3300', name: 'Jawa Tengah', region: 'Jawa' },
  { code: '3400', name: 'DI Yogyakarta', region: 'Jawa' },
  { code: '3500', name: 'Jawa Timur', region: 'Jawa' },
  { code: '3600', name: 'Banten', region: 'Jawa' },
  { code: '5100', name: 'Bali', region: 'Bali & Nusa Tenggara' },
  { code: '5200', name: 'Nusa Tenggara Barat', region: 'Bali & Nusa Tenggara' },
  { code: '5300', name: 'Nusa Tenggara Timur', region: 'Bali & Nusa Tenggara' },
  { code: '6100', name: 'Kalimantan Barat', region: 'Kalimantan' },
  { code: '6200', name: 'Kalimantan Tengah', region: 'Kalimantan' },
  { code: '6300', name: 'Kalimantan Selatan', region: 'Kalimantan' },
  { code: '6400', name: 'Kalimantan Timur', region: 'Kalimantan' },
  { code: '6500', name: 'Kalimantan Utara', region: 'Kalimantan' },
  { code: '7100', name: 'Sulawesi Utara', region: 'Sulawesi' },
  { code: '7200', name: 'Sulawesi Tengah', region: 'Sulawesi' },
  { code: '7300', name: 'Sulawesi Selatan', region: 'Sulawesi' },
  { code: '7400', name: 'Sulawesi Tenggara', region: 'Sulawesi' },
  { code: '7500', name: 'Gorontalo', region: 'Sulawesi' },
  { code: '7600', name: 'Sulawesi Barat', region: 'Sulawesi' },
  { code: '8100', name: 'Maluku', region: 'Maluku & Papua' },
  { code: '8200', name: 'Maluku Utara', region: 'Maluku & Papua' },
  { code: '9100', name: 'Papua Barat', region: 'Maluku & Papua' },
  { code: '9200', name: 'Papua Barat Daya', region: 'Maluku & Papua' },
  { code: '9400', name: 'Papua', region: 'Maluku & Papua' },
  { code: '9500', name: 'Papua Selatan', region: 'Maluku & Papua' },
  { code: '9600', name: 'Papua Tengah', region: 'Maluku & Papua' },
  { code: '9700', name: 'Papua Pegunungan', region: 'Maluku & Papua' },
] as const;
