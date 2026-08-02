# Blueprin SDK

[![CI Build & Test](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@blueprin/sdk.svg)](https://www.npmjs.com/package/@blueprin/sdk)
[![npm downloads](https://img.shields.io/npm/dm/@blueprin/sdk.svg)](https://www.npmjs.com/package/@blueprin/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk/badge)](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Security Policy](https://img.shields.io/badge/Security-Security%20Policy-blue)](SECURITY.md)

The official SDK for building **plugins**, **connectors**, **extensions** and **integrations** for [Blueprin](https://blueprin.app) — the professional architectural budgeting platform for construction in Indonesia.

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

## Plugin Template

Use the [blueprint_plugin_template](https://github.com/qalvinahmad/blueprint_plugin_template) to scaffold a new plugin:

```bash
# On GitHub, click "Use this template"
# Or clone directly:
git clone https://github.com/qalvinahmad/blueprint_plugin_template my-plugin
cd my-plugin
npm install
```

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

```javascript
import {
  BlueprintButton,
  BlueprintCard,
  BlueprintBadge,
  BlueprintTable,
  BlueprintInput,
} from '@alvinahmad/blueprin-sdk/ui';

// Use in your plugin UI
const button = BlueprintButton({ variant: 'primary', children: 'Click Me' });
const card = BlueprintCard({ children: 'Hello World' });
const badge = BlueprintBadge({ variant: 'success', children: 'Active' });
```

## Security

For security concerns, please see our [Security Policy](SECURITY.md).

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
