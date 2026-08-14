<div align="center">

# Blueprin SDK

[![CI Build & Test](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/qalvinahmad/blueprin-sdk/graph/badge.svg?token=dcf0d4cb-2c2d-4b9c-bd27-842a79e81966)](https://codecov.io/gh/qalvinahmad/blueprin-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@alvinahmad/blueprin-sdk.svg)](https://www.npmjs.com/package/@alvinahmad/blueprin-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Last Commit](https://img.shields.io/github/last-commit/qalvinahmad/blueprin-sdk?date=iso&color=blue)](https://github.com/qalvinahmad/blueprin-sdk/commits/main)
[![Latest Release](https://img.shields.io/github/v/release/qalvinahmad/blueprin-sdk)](https://github.com/qalvinahmad/blueprin-sdk/releases)

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/qalvinahmad/blueprin-sdk/badge)](https://securityscorecards.dev/details/?repo=github.com/qalvinahmad/blueprin-sdk)
[![OpenSSF Criticality](https://img.shields.io/badge/Criticality%20Score-0.37%2F1-blue?label=criticality%20score&style=flat)](https://github.com/ossf/criticality_score#criticality-score) <!-- Updated: 2026-08-14 -->
[![Code Quality](https://img.shields.io/codefactor/grade/github/qalvinahmad/blueprin-sdk?logo=codefactor&logoColor=white)](https://www.codefactor.io/repository/github/qalvinahmad/blueprin-sdk/overview/main)
[![Security Policy](https://img.shields.io/badge/Security-Security%20Policy-blue)](SECURITY.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org/)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?logo=prettier&logoColor=white)](https://github.com/prettier/prettier)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Contributors](https://img.shields.io/github/contributors/qalvinahmad/blueprin-sdk?color=green)](https://github.com/qalvinahmad/blueprin-sdk/graphs/contributors)
[![Discussions](https://img.shields.io/github/discussions/qalvinahmad/blueprin-sdk?logo=github&logoColor=white)](https://github.com/qalvinahmad/blueprin-sdk/discussions)

**Runtime:**
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat&logo=node.js&logoColor=white) ![Browser](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox%20%7C%20Safari%20%7C%20Edge-4285F4?style=flat&logo=googlechrome&logoColor=white) ![React](https://img.shields.io/badge/React-%3E%3D18.0.0-61DAFB?style=flat&logo=react&logoColor=white)

**Package:**
![npm](https://img.shields.io/npm/v/@alvinahmad/blueprin-sdk?style=flat&logo=npm&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat&logo=typescript&logoColor=white) ![Module](https://img.shields.io/badge/Module-ESM%20%2B%20CJS-blueviolet?style=flat) ![Node](https://img.shields.io/badge/Node-%3E%3D18-339933?style=flat&logo=node.js&logoColor=white)

**Languages:**
[![English](https://img.shields.io/badge/English-0052CC?style=flat&label=You%20are%20here)](README.md) [![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md) [![Arabic](https://img.shields.io/badge/Arabic-000000?style=flat)](README.ar.md) [![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md) [![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md) [![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md) [![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat)](README.fr.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md) [![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat)](README.de.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat)](README.pt.md) [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

The official SDK for building **plugins**, **connectors**, **extensions** and **integrations** for [Blueprin](blueprin-app.vercel.app) — the professional architectural budgeting platform for construction in Indonesia.

## Why Blueprin SDK?

Build production-ready extensions for Blueprin without reimplementing its core infrastructure.

- **Plugin System** — Extend Blueprin without modifying the host app
- **Hooks & Events** — React to lifecycle events and customize behavior
- **Connectors** — Integrate external services and suppliers
- **Formula Engine** — Extend RAB calculations with custom business rules
- **UI Components** — Build native-looking React plugin interfaces
- **Sandboxed Runtime** — Control plugin execution and network access
- **TypeScript-first** — Full type definitions and ESM/CJS support

## Architecture

```
                    +---------------------+
                    |    Blueprin Host    |
                    |       App           |
                    +----------+----------+
                               |
                     +---------v---------+
                     |   Blueprin SDK    |
                     +---------+---------+
                               |
        +----------+-----------+-----------+----------+
        v          v           v           v          v
     Plugins    Events       Hooks      Storage   Connectors
        |          |           |           |          |
        +----------+-----------+-----------+----------+
                               |
                    +----------v----------+
                    | Domain Clients      |
                    +---------------------+
                    | Project             |
                    | Material            |
                    | RAB                 |
                    | Schedule            |
                    | Marketplace         |
                    | Workforce           |
                    +---------------------+
```

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
// { version: '1.0.1', plugins: 0, hooks: 0, events: 0, initialized: true }
```

## Create Your First Plugin

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-first-plugin',
  name: 'My First Plugin',
  version: '1.0.0',
  description: 'My first Blueprin plugin',

  activate(ctx) {
    ctx.events.on('blueprin:project:created', (data) => {
      console.log('Project created:', data.project.name);
    });

    ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
      console.log('RAB total:', data.result.total);
      return data;
    });

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

Or scaffold a new plugin with the official CLI:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## What's Included

```
@alvinahmad/blueprin-sdk
│
├── Core
│   ├── BlueprinSDK        @alvinahmad/blueprin-sdk
│   ├── PluginManager      @alvinahmad/blueprin-sdk/core
│   ├── EventBus           @alvinahmad/blueprin-sdk/events
│   ├── HookRegistry       @alvinahmad/blueprin-sdk/hooks
│   └── StorageAdapter     @alvinahmad/blueprin-sdk/storage
│
├── Domain Clients
│   ├── ProjectClient      @alvinahmad/blueprin-sdk/project
│   ├── MaterialClient     @alvinahmad/blueprin-sdk/material
│   ├── RabClient          @alvinahmad/blueprin-sdk/rab
│   ├── ScheduleClient     @alvinahmad/blueprin-sdk/schedule
│   ├── MarketplaceClient  @alvinahmad/blueprin-sdk/marketplace
│   └── WorkforceClient    @alvinahmad/blueprin-sdk/workforce
│
├── Integrations
│   ├── BaseConnector      @alvinahmad/blueprin-sdk/connector
│   └── Reports            @alvinahmad/blueprin-sdk/report
│
└── UI
    └── BlueprintButton, BlueprintCard, ...  @alvinahmad/blueprin-sdk/ui
```

All modules support tree-shaking and are available as subpath imports:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## Features

- **Plugin System** — Register, activate, deactivate, and manage plugins with lifecycle hooks
- **Event Bus** — Pub/sub system for inter-plugin communication
- **Hook Registry** — Before/after lifecycle hooks for extending functionality
- **Storage Adapter** — localStorage + Supabase hybrid storage with SSR guards
- **Domain Clients** — Project, Material, RAB, Schedule, Marketplace, and Workforce modules
- **UI Components** — React components for building plugin interfaces
- **Connector SDK** — Build integrations with external services
- **TypeScript Support** — Full type definitions included

## Security Model

Blueprin plugins run under host-controlled permissions.

| Capability | Default | Host Control |
|---|---|---|
| Plugin execution | Enabled | Lifecycle controlled (activate/deactivate) |
| External network | **Disabled** | Allowlist required via manifest permissions |
| Hooks | Enabled | 200ms timeout per hook execution |
| Storage | Restricted | Adapter-controlled (localStorage or Supabase) |
| UI rendering | Enabled | React sandbox, no direct DOM access |

Plugins **cannot** access external networks unless explicitly whitelisted by the host app. All hook executions have a hard 200ms timeout to prevent infinite loops or UI blocking.

For vulnerability reporting, see [Security Policy](SECURITY.md).

## Examples

| Example | Description |
|---------|-------------|
| [Hello Plugin](example/hello_plugin/) | Simplest plugin |
| [RAB Generator](example/rab_generator/) | AI-powered RAB generation |
| [WhatsApp Sync](example/whatsapp_sync/) | WhatsApp notifications |
| [Material Connector](example/material_connector/) | Supplier sync |
| [Custom Report](example/custom_report/) | Report generation |

## Documentation

- [Full Documentation](https://blueprin-docs.vercel.app)
- [Getting Started](docs/getting-started/)
- [Plugin Development](docs/plugin-development/)
- [Hooks & Events](docs/hooks/)
- [UI Components](docs/ui-components/)
- [Storage](docs/storage/)
- [Connectors](docs/connectors/)
- [Testing](docs/testing/)
- [Publishing](docs/publishing/)

## API Reference

Full API documentation is available at [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api):

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — Main entry point
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — Plugin lifecycle
- [EventBus](https://blueprin-docs.vercel.app/api/events) — Pub/sub events
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — Lifecycle hooks
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project, Material, RAB, etc.

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Community

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — Ask questions, share ideas, and connect with other developers
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — Report bugs and request features

## License

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> Translations may lag behind the English documentation. The English README is the canonical source.
