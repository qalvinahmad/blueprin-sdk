<div align="center">

# Blueprin SDK

[![CI Build & Test](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@alvinahmad/blueprin-sdk.svg)](https://www.npmjs.com/package/@alvinahmad/blueprin-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@alvinahmad/blueprin-sdk.svg)](https://www.npmjs.com/package/@alvinahmad/blueprin-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk/badge)](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Security Policy](https://img.shields.io/badge/Security-Security%20Policy-blue)](SECURITY.md)
[![Last Commit](https://img.shields.io/github/last-commit/qalvinahmad/blueprin-sdk?color=blue)](https://github.com/qalvinahmad/blueprin-sdk/commits/main)
[![Contributors](https://img.shields.io/github/contributors/qalvinahmad/blueprin-sdk?color=green)](https://github.com/qalvinahmad/blueprin-sdk/graphs/contributors)

**Platforms:**  
![Windows](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white) ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) ![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white) ![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=ios&logoColor=white)

**🌐 Languages:**  
[![English](https://img.shields.io/badge/English-0052CC?style=flat&label=You%20are%20here)](README.md)  
[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md)  
[![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md)  
[![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md)  
[![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md)  
[![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

The official SDK for building **plugins**, **connectors**, **extensions** and **integrations** for [Blueprin](blueprin-app.vercel.app) — the professional architectural budgeting platform for construction in Indonesia.

## Installation

```bash
npm install @alvinahmad/blueprin-sdk
# or
pnpm add @alvinahmad/blueprin-sdk
# or
yarn add @alvinahmad/blueprin-sdk
```

## Quick Start

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';

const sdk = new BlueprinSDK({
  appId: 'my-app',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_ANON_KEY,
  debug: true,
});

await sdk.init();

console.log(sdk.getInfo());
// { version: '1.0.0', plugins: 0, hooks: 0, events: 0, initialized: true }
```

## First Plugin

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-first-plugin',
  name: 'My First Plugin',
  version: '1.0.0',
  description: 'My first Blueprin plugin',

  activate(ctx) {
    // Listen to events
    ctx.events.on('blueprin:project:created', (data) => {
      console.log('Project created:', data.project.name);
    });

    // Register hooks
    ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
      console.log('RAB total:', data.result.total);
      return data;
    });

    // Return plugin API
    return {
      api: {
        getVersion: () => '1.0.0',
      },
    };
  },

  deactivate(instance) {
    console.log('Plugin deactivated');
  },
});
```

## Create a New Plugin

The easiest way to scaffold a new Blueprin Plugin (with TypeScript, Vitest, and the correct folder structure) is using our official CLI tool:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

This will automatically clone the [blueprint_plugin_template](https://github.com/qalvinahmad/blueprint_plugin_template), set up the plugin IDs and names, and prepare it for development.

## Features

- **Plugin System** — Register, activate, deactivate, and manage plugins with lifecycle hooks
- **Event Bus** — Pub/sub system for inter-plugin communication
- **Hook Registry** — Before/after lifecycle hooks for extending functionality
- **Storage Adapter** — localStorage + Supabase hybrid storage with SSR guards
- **Domain Clients** — Project, Material, RAB, Schedule, Marketplace, and Auth modules
- **UI Components** — React components for building plugin interfaces
- **Connector SDK** — Build integrations with external services
- **TypeScript Support** — Full type definitions included

## API Reference

### BlueprinSDK

| Property | Type | Description |
|----------|------|-------------|
| `plugins` | `PluginManager` | Plugin lifecycle management |
| `events` | `EventBus` | Pub/sub event system |
| `hooks` | `HookRegistry` | Before/after lifecycle hooks |
| `storage` | `StorageAdapter` | localStorage + Supabase storage |
| `config` | `ConfigManager` | Plugin configuration |
| `logger` | `Logger` | Debug logging |

### PluginManager

| Method | Description |
|--------|-------------|
| `register(manifest)` | Register a new plugin |
| `activate(pluginId)` | Activate a plugin |
| `deactivate(pluginId)` | Deactivate a plugin |
| `remove(pluginId)` | Remove a plugin |
| `activateAll()` | Activate all plugins |
| `list()` | List all registered plugins |
| `get(pluginId)` | Get plugin by ID |

### Domain Modules

| Module | Description |
| :--- | :--- |
| `ProjectClient` | Core project info, status, team members |
| `MaterialClient` | Manage BOM, catalog materials, equipment |
| `RabClient` | Budgeting, quantity surveying, cost pipelines |
| `ScheduleClient` | Scheduling, timelines, phases |
| `MarketplaceClient` | Procurement, RFQ, Supplier integrations |
| `WorkforceClient` | Workers (Tukang/Mandor), Attendance, Payroll |

### EventBus

| Method | Description |
|--------|-------------|
| `on(event, callback)` | Subscribe to an event |
| `once(event, callback)` | Subscribe once |
| `off(event, callback)` | Unsubscribe |
| `emit(event, data)` | Emit an event |

### HookRegistry

| Method | Description |
|--------|-------------|
| `register(hook, callback)` | Register a hook |
| `unregister(hook, callback)` | Unregister a hook |
| `execute(hook, context)` | Execute all hook callbacks |

## Event Names

| Event | Description |
|-------|-------------|
| `blueprin:project:created` | Project created |
| `blueprin:project:updated` | Project updated |
| `blueprin:project:deleted` | Project deleted |
| `blueprin:material:created` | Material created |
| `blueprin:material:updated` | Material updated |
| `blueprin:rab:calculated` | RAB calculated |
| `blueprin:rab:expanded` | RAB expanded to materials/labor |
| `blueprin:schedule:generated` | Schedule generated |
| `blueprin:task:completed` | Task completed |
| `blueprin:marketplace:order:created` | Marketplace order created |
| `blueprin:marketplace:rfq:received` | RFQ received |
| `blueprin:marketplace:partner:registered` | Partner registered |
| `blueprin:auth:signed:in` | User signed in |
| `blueprin:auth:signed:out` | User signed out |

## Hook Names

| Hook | When |
|------|------|
| `blueprin:before:project:create` | Before project creation |
| `blueprin:after:project:create` | After project creation |
| `blueprin:before:rab:calculate` | Before RAB calculation |
| `blueprin:after:rab:calculate` | After RAB calculation |
| `blueprin:before:material:create` | Before material creation |
| `blueprin:after:material:create` | After material creation |
| `blueprin:before:order:create` | Before order creation |
| `blueprin:after:order:create` | After order creation |
| `blueprin:before:export` | Before report export |
| `blueprin:after:export` | After report export |

## Formula Engine

Blueprin provides an extensible calculation engine inside the RAB module, allowing developers to inject custom math rules at various stages of budget calculation.

```javascript
// Register a custom 10% Profit Margin formula
sdk.rab.formulas.registerProfit('standard-margin', async (context) => {
  return context.baseTotal * 0.10; // 10% profit
});

// Register a 11% Tax formula
sdk.rab.formulas.registerTax('ppn', async (context) => {
  return context.currentTotal * 0.11;
});
```

Pipelines available: `coefficient`, `escalation`, `allowance`, `overhead`, `profit`, `tax`.

## Workforce & Payroll

A dedicated module for managing construction workers and calculating wages.

```javascript
// 1. Add a worker (Tukang)
const worker = await sdk.workforce.addWorker(projectId, {
  name: 'Budi Tukang',
  role: 'TUKANG',
  daily_rate: 150000,
  overtime_rate: 20000
});

// 2. Log attendance
await sdk.workforce.logAttendance(projectId, worker.id, '2026-08-04', 'PRESENT', 2); // 2 hours overtime

// 3. Calculate Wages for a period
const wages = await sdk.workforce.calculateWages(projectId, '2026-08-01', '2026-08-31');
```

## Connector SDK

```javascript
import { BaseConnector } from '@alvinahmad/blueprin-sdk';

class MyConnector extends BaseConnector {
  static protocol = 'rest';

  async connect(config) {
    this.client = new MyClient(config.apiKey);
    return this;
  }

  async disconnect() {
    this.client = null;
  }

  async fetchData() {
    return this.client.get('/data');
  }
}
```

## UI Components

> **Note:** Blueprin is a React-based platform. UI Plugins and components injected via the SDK must be built using **React 18+**. If you plan to support Vue or Svelte in the future, you will need to wrap your UI components as Web Components (Custom Elements) or provide separate bindings.

```jsx
import {
  BlueprintButton,
  BlueprintCard,
  BlueprintBadge,
  BlueprintTable,
  BlueprintInput,
  BlueprintSelect,
  BlueprintModal,
  BlueprintToast,
  BlueprintSkeleton,
} from '@alvinahmad/blueprin-sdk/ui';

// Use in your plugin UI
export default function MyPluginUI() {
  return (
    <BlueprintCard>
      <BlueprintBadge variant="success">Active</BlueprintBadge>
      <BlueprintButton variant="primary">Click Me</BlueprintButton>
    </BlueprintCard>
  );
}
```

## Security & Runtime Sandboxing

The Blueprin SDK implements strict runtime sandboxing to protect the Host App:
- **Hook Timeouts**: All plugin hooks have a hard execution limit (max `200ms`) to prevent infinite loops or UI blocking operations.
- **Network Requests**: Plugins are **not allowed** to fetch from external domains unless explicitly whitelisted by the host app via the plugin manifest permissions.

For vulnerabilities or additional security concerns, please see our [Security Policy](SECURITY.md).

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Documentation

- [Getting Started](docs/getting-started/)
- [Plugin Development](docs/plugin-development/)
- [Hooks & Events](docs/hooks/)
- [UI Components](docs/ui-components/)
- [Storage](docs/storage/)
- [Connectors](docs/connectors/)
- [Testing](docs/testing/)
- [Publishing](docs/publishing/)

## Examples

- [Hello Plugin](example/hello_plugin/) - Simplest plugin
- [RAB Generator](example/rab_generator/) - AI-powered RAB generation
- [WhatsApp Sync](example/whatsapp_sync/) - WhatsApp notifications
- [Material Connector](example/material_connector/) - Supplier sync
- [Custom Report](example/custom_report/) - Report generation

## License

MIT © [qalvinahmad](https://github.com/qalvinahmad)
