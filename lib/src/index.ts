/**
 * @alvinahmad/blueprin-sdk - Official SDK for Blueprin Platform
 *
 * Build plugins, connectors, extensions and integrations for Blueprin.
 *
 * @example
 * import { BlueprinSDK, definePlugin } from '@alvinahmad/blueprin-sdk';
 *
 * const sdk = new BlueprinSDK({ appId: 'my-plugin-host' });
 * await sdk.init();
 */

// Core
export { BlueprinSDK } from './core/sdk.js';
export { PluginManager } from './core/plugin-manager.js';
export { EventBus } from './core/event-bus.js';
export { HookRegistry } from './core/hook-registry.js';
export { StorageAdapter } from './core/storage-adapter.js';
export { Logger } from './core/logger.js';
export { ConfigManager } from './core/config-manager.js';
export {
  TelemetryManager,
  type TelemetryEventPayload,
  type TelemetryTrackOptions,
  type TelemetryHandler,
  type ScopedTelemetry,
  type TelemetryManagerOptions,
} from './telemetry/index.js';

// Plugin definitions
export { definePlugin, defineConnector, defineExtension } from './core/plugin-def.js';

// Constants
export {
  PLUGIN_LIFECYCLE,
  PLUGIN_STATUS,
  CONNECTOR_STATUS,
  EVENT_NAMES,
  HOOK_NAMES,
} from './core/constants.js';

// Domain clients
export { ProjectClient } from './project/index.js';
export { MaterialClient } from './material/index.js';
export type { Material } from './material/index.js';
export { RabClient } from './rab/index.js';
export { ScheduleClient } from './schedule/index.js';
export { MarketplaceClient } from './marketplace/index.js';
export { AuthClient } from './auth/index.js';
export { ReportClient } from './report/index.js';
export { ReportBuilder } from './report/report-builder.js';
export type { ReportTypeConfig, DataSourceFetcher, FormatterFn } from './report/report-builder.js';
export { WorkforceClient } from './workforce/index.js';

// Shared types (zero runtime cost)
export type {
  // Auth
  User,
  Session,
  // Marketplace
  PartnerType,
  MarketplacePartner,
  // Materials
  MaterialCategory,
  // RAB (Budget Plan)
  RabItem,
  RabCalculation,
  // Project Items
  ProjectItem,
  // Schedule
  SchedulePhase,
  TaskStatus,
  TaskPriority,
  Task,
  Schedule,
  // RFQ
  RFQStatus,
  RFQItem,
  RFQ,
  RFQQuote,
  // Orders
  OrderStatus,
  PaymentStatus,
  DeliveryStatus,
  OrderItem,
  Order,
  // Workforce
  WorkerRole,
  AttendanceStatus,
  Worker,
  Attendance,
  WageCalculation,
  // Project
  ProjectStatus,
  Project,
  // Plugin
  PluginManifest,
  // Connector
  ConnectorProtocol,
  ConnectorStatus,
  ConnectorConfig,
  // Telemetry
  TelemetryLifecycle,
  TelemetryContext,
  // Report
  ReportFormat,
  ReportDataSource,
  ReportColumn,
  ReportGenerateOptions,
  ReportResult,
  ReportDefinition,
} from './types/index.js';

// Validation schemas
export {
  materialSchema,
  partnerSchema,
  rfqSchema,
  orderSchema,
  workerSchema,
  projectSchema,
  pluginManifestSchema,
} from './schemas/index.js';

// Connector
export {
  BaseConnector,
  ConnectorRegistry,
  GoogleCalendarConnector,
  NotionConnector,
  WhatsAppConnector,
  MessagingConnector,
  TelegramConnector,
  DiscordConnector,
  TeamsConnector,
  SlackConnector,
  ZoomConnector,
  JiraConnector,
  LinearConnector,
  OneDriveConnector,
  ConfluenceConnector,
  MiroConnector,
  AccountingConnector,
  BankConnector,
  SupplierConnector,
  BPJSConnector,
} from './connector/index.js';

// Hooks helpers
export { createHook, HookPatterns } from './hooks/index.js';

// UI Components
export {
  BlueprintButton,
  BlueprintCard,
  BlueprintBadge,
  BlueprintInput,
  BlueprintSelect,
  BlueprintTable,
  BlueprintModal,
  BlueprintToast,
  BlueprintSkeleton,
} from './ui/index.js';

// Utils
export {
  formatIDR,
  formatDate,
  formatRelativeTime,
  cn,
  generateId,
  debounce,
  deepClone,
  pick,
  omit,
} from './utils/index.js';

// Public API Client & Errors
export {
  BlueprinClient,
  AhsClient as PublicAhsClient,
  MaterialsClient as PublicMaterialsClient,
  RabClient as PublicRabClient,
  PlansClient as PublicPlansClient,
  BlueprinApiError,
  AuthenticationError,
  ScopePermissionError,
  RateLimitError,
  NotFoundError,
} from './client/index.js';
export type {
  BlueprinClientOptions,
  ApiResponse,
  PaginationMeta,
  AhsItem,
  AhsComponent,
  ListAhsParams,
  PublicMaterial,
  ListMaterialsParams,
  PublicRabItem,
  ListRabParams,
  ApiPlan,
  ApiUsageStats,
} from './client/index.js';

// Webhook
export {
  verifyWebhookSignature,
  createWebhookDigest,
  createWebhookSignature,
} from './webhook/index.js';
export type {
  WebhookVerificationOptions,
  WebhookVerificationResult,
  WebhookEventType,
  WebhookPayload,
} from './webhook/index.js';

// OpenRouter
export { OpenRouterClient } from './openrouter/index.js';
export type {
  OpenRouterClientOptions,
  CreditsResponse,
  ActivityItem,
  Model,
  ImageModel,
  GenerationStats,
  ChatCompletionOptions,
  ImageGenerationOptions,
  EmbeddingOptions,
  EmbeddingData,
} from './openrouter/index.js';
