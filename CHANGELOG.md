# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **WorkforceClient**: Added new domain module for managing construction workers, daily/hourly rates, logging attendance, and calculating period-based wages & overtime.
- **Runtime Sandboxing**: Enforced a `200ms` execution timeout on all Hook executions (`hook-registry`) to prevent host-app freezing or infinite loops from malicious plugins.
- **CLI Scaffolding**: Introduced `create-blueprin-plugin` CLI package to auto-generate boilerplate plugin structures with TypeScript and Vitest pre-configured.
- **Connector Framework**: Added `BaseConnector` classes to allow plugins to register 3rd-party integrations to the `ConnectorRegistry`.
- **UI Components**: Documented 9 core React UI components in the README for consistent plugin styling.
- **TypeScript Migration**: Fully migrated the SDK to TypeScript with `strict: true` validation for robust developer experience and type autocomplete.

### Changed
- Improved `ReportClient` with data generator bindings and custom layout templates.
- Explicitly documented the `React >= 18.0.0` peer-dependency requirement in the README for UI Plugins.
## [1.0.1] - 2026-08-02

### Fixed
- OpenSSF Scorecard token permissions and pinned dependency hashes
- Safe `generateId()` fallback for Node 18 environments
- Added CodeQL SAST scanning workflow

### Added
- Pinned all GitHub Actions to specific commit SHAs (supply chain security)
- Added OpenSSF Scorecard workflow (`scorecard.yml`)
- Added dependency review workflow (`dependency-review.yml`)
- Added Dependabot configuration for automated dependency updates
- Added `CODEOWNERS` file requiring review on security-sensitive files
- Added issue templates (Bug Report, Feature Request)
- Added Pull Request template

## [1.0.0] - 2026-08-02

### Added

- **Core SDK**
  - `BlueprinSDK` main class with plugin, event, hook, and storage management
  - `PluginManager` for plugin lifecycle (register, activate, deactivate, remove)
  - `EventBus` for pub/sub inter-plugin communication
  - `HookRegistry` for before/after lifecycle hooks with priority support
  - `StorageAdapter` with localStorage + Supabase hybrid storage and SSR guards
  - `ConfigManager` for plugin configuration with localStorage persistence
  - `Logger` with debug support and configurable prefix
  - `definePlugin`, `defineConnector`, `defineExtension` helpers

- **Domain Modules**
  - `ProjectClient` — Project CRUD with hooks integration
  - `MaterialClient` — Material management with categories
  - `RabClient` — RAB (budget) calculation, expansion to materials/labor/equipment
  - `ScheduleClient` — Project scheduling with 13 construction phases
  - `MarketplaceClient` — Partners, products, RFQ, and orders
  - `AuthClient` — Supabase authentication wrapper with event emission

- **Connector SDK**
  - `BaseConnector` abstract class with lifecycle (connect, disconnect, test)
  - `ConnectorRegistry` for managing multiple connectors

- **UI Components**
  - `BlueprintButton` — Action button with variants (primary, secondary, danger, ghost)
  - `BlueprintCard` — Content container with elevation variants
  - `BlueprintBadge` — Status badge (default, success, warning, error, info)
  - `BlueprintInput` — Form input with validation state
  - `BlueprintSelect` — Dropdown select
  - `BlueprintTable` — Data table with custom renderers
  - `BlueprintModal` — Dialog/modal with backdrop
  - `BlueprintToast` — Toast notification with auto-dismiss
  - `BlueprintSkeleton` — Loading skeleton (text, title, avatar, card variants)

- **Hook Helpers**
  - `createHook` — Type-safe hook handler creator
  - `HookPatterns` — Reusable patterns (logger, validator, transformer, rateLimit)

- **Utilities**
  - `formatIDR` — Indonesian Rupiah formatting via `Intl.NumberFormat`
  - `formatDate` — Indonesian date formatting
  - `formatRelativeTime` — Relative time in Indonesian (e.g. "2 jam lalu")
  - `cn` — Lightweight class name merging (like clsx)
  - `generateId` — UUID v4 via `crypto.randomUUID()`
  - `debounce`, `deepClone` (via `structuredClone`), `pick`, `omit`

- **CI/CD & Governance**
  - GitHub Actions CI pipeline (Node 18/20/22 matrix, build, test, security audit)
  - Release workflow with npm provenance attestation
  - `SECURITY.md` with responsible disclosure policy
  - `CONTRIBUTING.md` with development setup and commit conventions
  - `CODEOWNERS` for mandatory code review
  - OpenSSF Scorecard integration
  - Dependabot for automated dependency updates

- **Examples**
  - Hello Plugin — Simplest plugin example
  - RAB Generator — AI-powered RAB generation
  - WhatsApp Sync — WhatsApp notifications
  - Material Connector — Supplier integration
  - Custom Report — Report generation

- **Documentation**
  - Getting Started guide
  - Plugin Development guide
  - Hooks & Events reference
  - UI Components reference
  - Storage guide
  - Connector guide
  - Testing guide
  - Publishing guide

## [0.1.0] - 2026-08-02

### Added
- Initial release of `@alvinahmad/blueprin-sdk`
- Core architecture: `PluginManager`, `EventBus`, `HookRegistry`, `StorageAdapter`
- All domain modules, UI components, and utilities (see v1.0.0 for full list)

[Unreleased]: https://github.com/qalvinahmad/blueprin-sdk/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/qalvinahmad/blueprin-sdk/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/qalvinahmad/blueprin-sdk/releases/tag/v0.1.0
