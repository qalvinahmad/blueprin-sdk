# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-02

### Added

- **Core SDK**
  - `BlueprinSDK` main class with plugin, event, hook, and storage management
  - `PluginManager` for plugin lifecycle (register, activate, deactivate, remove)
  - `EventBus` for pub/sub inter-plugin communication
  - `HookRegistry` for before/after lifecycle hooks
  - `StorageAdapter` with localStorage + Supabase hybrid storage
  - `ConfigManager` for plugin configuration
  - `Logger` with debug support
  - `definePlugin`, `defineConnector`, `defineExtension` helpers

- **Domain Modules**
  - `ProjectClient` - Project CRUD operations
  - `MaterialClient` - Material management with categories
  - `RabClient` - RAB (budget) calculation and expansion
  - `ScheduleClient` - Project scheduling with 13 construction phases
  - `MarketplaceClient` - Partners, products, RFQ, and orders
  - `AuthClient` - Supabase authentication wrapper

- **Connector SDK**
  - `BaseConnector` abstract class
  - `ConnectorRegistry` for managing connectors

- **UI Components**
  - `BlueprintButton` - Primary action button
  - `BlueprintCard` - Content container
  - `BlueprintBadge` - Status badge
  - `BlueprintInput` - Form input
  - `BlueprintSelect` - Dropdown select
  - `BlueprintTable` - Data table
  - `BlueprintModal` - Dialog/modal
  - `BlueprintToast` - Toast notification
  - `BlueprintSkeleton` - Loading skeleton

- **Utilities**
  - `formatIDR` - Indonesian Rupiah formatting
  - `formatDate` - Indonesian date formatting
  - `formatRelativeTime` - Relative time in Indonesian
  - `cn` - Class name merging
  - `generateId`, `debounce`, `deepClone`, `pick`, `omit`

- **Examples**
  - Hello Plugin - Simplest plugin example
  - RAB Generator - AI-powered RAB generation
  - WhatsApp Sync - WhatsApp notifications
  - Material Connector - Supplier integration
  - Custom Report - Report generation

- **Documentation**
  - Getting Started guide
  - Plugin Development guide
  - Hooks & Events reference
  - UI Components reference
  - Storage guide
  - Connector guide
  - Testing guide
  - Publishing guide
