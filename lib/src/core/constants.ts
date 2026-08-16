/**
 * Blueprin SDK Constants
 */

export const PLUGIN_LIFECYCLE = {
  REGISTERED: 'registered',
  INITIALIZING: 'initializing',
  READY: 'ready',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  ERROR: 'error',
  DESTROYED: 'destroyed',
};

export const PLUGIN_STATUS = {
  INSTALLED: 'installed',
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  UPDATING: 'updating',
};

export const CONNECTOR_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  ERROR: 'error',
};

export const EVENT_NAMES = {
  // Plugin lifecycle
  PLUGIN_REGISTERED: 'blueprin:plugin:registered',
  PLUGIN_INITIALIZED: 'blueprin:plugin:initialized',
  PLUGIN_ACTIVATED: 'blueprin:plugin:activated',
  PLUGIN_DEACTIVATED: 'blueprin:plugin:deactivated',
  PLUGIN_REMOVED: 'blueprin:plugin:removed',

  // Project events
  PROJECT_CREATED: 'blueprin:project:created',
  PROJECT_UPDATED: 'blueprin:project:updated',
  PROJECT_DELETED: 'blueprin:project:deleted',
  PROJECT_ARCHIVED: 'blueprin:project:archived',

  // Material events
  MATERIAL_CREATED: 'blueprin:material:created',
  MATERIAL_UPDATED: 'blueprin:material:updated',
  MATERIAL_DELETED: 'blueprin:material:deleted',
  MATERIAL_IMPORTED: 'blueprin:material:imported',

  // RAB (Budget Plan) events
  RAB_ITEM_ADDED: 'blueprin:rab:item:added',
  RAB_ITEM_UPDATED: 'blueprin:rab:item:updated',
  RAB_ITEM_REMOVED: 'blueprin:rab:item:removed',
  RAB_EXPANDED: 'blueprin:rab:expanded',
  RAB_CALCULATED: 'blueprin:rab:calculated',

  // Schedule events
  SCHEDULE_GENERATED: 'blueprin:schedule:generated',
  SCHEDULE_UPDATED: 'blueprin:schedule:updated',
  TASK_CREATED: 'blueprin:task:created',
  TASK_UPDATED: 'blueprin:task:updated',
  TASK_COMPLETED: 'blueprin:task:completed',

  // Marketplace events
  ORDER_CREATED: 'blueprin:marketplace:order:created',
  ORDER_UPDATED: 'blueprin:marketplace:order:updated',
  ORDER_COMPLETED: 'blueprin:marketplace:order:completed',
  RFQ_RECEIVED: 'blueprin:marketplace:rfq:received',
  RFQ_QUOTED: 'blueprin:marketplace:rfq:quoted',
  PARTNER_REGISTERED: 'blueprin:marketplace:partner:registered',
  PARTNER_VERIFIED: 'blueprin:marketplace:partner:verified',

  // Collaboration events
  COLLABORATOR_ADDED: 'blueprin:collab:added',
  COLLABORATOR_REMOVED: 'blueprin:collab:removed',
  PRESENCE_UPDATE: 'blueprin:collab:presence',

  // UI events
  SIDEBAR_TOGGLE: 'blueprin:ui:sidebar:toggle',
  MODAL_OPEN: 'blueprin:ui:modal:open',
  MODAL_CLOSE: 'blueprin:ui:modal:close',
  THEME_CHANGED: 'blueprin:ui:theme:changed',
  TOAST_SHOW: 'blueprin:ui:toast:show',

  // Auth events
  AUTH_SIGNED_IN: 'blueprin:auth:signed:in',
  AUTH_SIGNED_OUT: 'blueprin:auth:signed:out',
  AUTH_SESSION_REFRESHED: 'blueprin:auth:session:refreshed',

  // Telemetry events
  TELEMETRY_TRACK: 'blueprin:telemetry:track',
  TELEMETRY_METRIC: 'blueprin:telemetry:metric',
  TELEMETRY_HEALTH: 'blueprin:telemetry:health',
  TELEMETRY_ERROR: 'blueprin:telemetry:error',
  TELEMETRY_PERF: 'blueprin:telemetry:perf',

  // Plugin health events
  PLUGIN_HEALTH_CHECK: 'blueprin:plugin:health:check',
  PLUGIN_HEALTH_REPORT: 'blueprin:plugin:health:report',
  PLUGIN_PERF_RECORD: 'blueprin:plugin:perf:record',
};

export const HOOK_NAMES = {
  // Project hooks
  BEFORE_PROJECT_CREATE: 'blueprin:before:project:create',
  AFTER_PROJECT_CREATE: 'blueprin:after:project:create',
  BEFORE_PROJECT_UPDATE: 'blueprin:before:project:update',
  AFTER_PROJECT_UPDATE: 'blueprin:after:project:update',
  BEFORE_PROJECT_DELETE: 'blueprin:before:project:delete',
  AFTER_PROJECT_DELETE: 'blueprin:after:project:delete',

  // Material hooks
  BEFORE_MATERIAL_CREATE: 'blueprin:before:material:create',
  AFTER_MATERIAL_CREATE: 'blueprin:after:material:create',
  BEFORE_MATERIAL_UPDATE: 'blueprin:before:material:update',
  AFTER_MATERIAL_UPDATE: 'blueprin:after:material:update',

  // RAB (Budget Plan) hooks
  BEFORE_RAB_CALCULATE: 'blueprin:before:rab:calculate',
  AFTER_RAB_CALCULATE: 'blueprin:after:rab:calculate',
  BEFORE_RAB_EXPAND: 'blueprin:before:rab:expand',
  AFTER_RAB_EXPAND: 'blueprin:after:rab:expand',
  BEFORE_GENERATE_QUOTES: 'blueprin:before:generate:quotes',
  AFTER_GENERATE_QUOTES: 'blueprin:after:generate:quotes',

  // Schedule hooks
  BEFORE_SCHEDULE_GENERATE: 'blueprin:before:schedule:generate',
  AFTER_SCHEDULE_GENERATE: 'blueprin:after:schedule:generate',
  BEFORE_TASK_COMPLETE: 'blueprin:before:task:complete',
  AFTER_TASK_COMPLETE: 'blueprin:after:task:complete',

  // Marketplace hooks
  BEFORE_ORDER_CREATE: 'blueprin:before:order:create',
  AFTER_ORDER_CREATE: 'blueprin:after:order:create',
  BEFORE_CHECKOUT: 'blueprin:before:checkout',
  AFTER_CHECKOUT: 'blueprin:after:checkout',

  // Report hooks
  BEFORE_EXPORT: 'blueprin:before:export',
  AFTER_EXPORT: 'blueprin:after:export',
  CUSTOMIZE_REPORT: 'blueprin:customize:report',

  // Telemetry hooks
  BEFORE_TELEMETRY_TRACK: 'blueprin:before:telemetry:track',
  AFTER_TELEMETRY_TRACK: 'blueprin:after:telemetry:track',
};

export const STORAGE_KEYS = {
  PLUGINS: 'blueprin_sdk_plugins',
  CONFIG: 'blueprin_sdk_config',
  CONNECTORS: 'blueprin_sdk_connectors',
};

export const MAX_PLUGIN_NAME_LENGTH = 64;
export const MAX_PLUGIN_DESCRIPTION_LENGTH = 512;
export const PLUGIN_API_VERSION = '1.0.1';
