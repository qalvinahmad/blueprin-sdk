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
  // RAB
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
export { BaseConnector, ConnectorRegistry } from './connector/index.js';

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
