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
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md) [![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md) [![Arabic](https://img.shields.io/badge/Arabic-000000?style=flat)](README.ar.md) [![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md) [![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md) [![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md) [![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat)](README.fr.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md) [![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat&label=You%20are%20here)](README.de.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat)](README.pt.md) [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

Offizielles SDK zur Erstellung von **Plugins**, **Connectoren**, **Erweiterungen** und **Integrationen** für [Blueprin](blueprin-app.vercel.app) — die professionelle architektonische Budgetierungsplattform für das Bauwesen in Indonesien.

## Warum Blueprin SDK?

Erstellen Sie produktionsfertige Erweiterungen für Blueprin, ohne die Kerninfrastruktur neu zu implementieren.

- **Plugin-System** — Erweitern Sie Blueprin ohne die Host-App zu ändern
- **Hooks & Events** — Reagieren Sie auf Lifecycle-Events und passen Sie das Verhalten an
- **Connectoren** — Integrieren Sie externe Dienste und Lieferanten
- **Formel-Engine** — Erweitern Sie RAB-Berechnungen mit benutzerdefinierten Geschäftsregeln
- **UI-Komponenten** — Erstellen Sie native aussehende Plugin-Oberflächen
- **Sandboxed Runtime** — Kontrollieren Sie Plugin-Ausführung und Netzwerkzugriff
- **TypeScript-first** — Vollständige Tydefinitionen und ESM/CJS-Unterstützung

## Architektur

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
# oder
pnpm add @alvinahmad/blueprin-sdk
# oder
yarn add @alvinahmad/blueprin-sdk
```

## Schnellstart

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

## Erstellen Sie Ihr erstes Plugin

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

Oder scaffoldein Sie ein neues Plugin mit dem offiziellen CLI:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## Was ist enthalten

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

Alle Module unterstützen Tree-Shaking und sind als Subpath-Imports verfügbar:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## Funktionen

- **Plugin-System** — Plugins mit Lifecycle-Hooks registrieren, aktivieren, deaktivieren und verwalten
- **Event Bus** — Pub/Sub-System für die Kommunikation zwischen Plugins
- **Hook Registry** — Vorher/Nachher-Lifecycle-Hooks zur Erweiterung der Funktionalität
- **Storage Adapter** — Hybrid-Speicherung localStorage + Supabase mit SSR-Schutz
- **Domain Clients** — Module Project, Material, RAB, Schedule, Marketplace und Workforce
- **UI-Komponenten** — React-Komponenten zum Erstellen von Plugin-Oberflächen
- **Connector SDK** — Erstellen Sie Integrationen mit externen Diensten
- **TypeScript-Unterstützung** — Vollständige Tydefinitionen enthalten

## Sicherheitsmodell

Blueprin-Plugins laufen unter host-kontrollierten Berechtigungen.

| Fähigkeit | Standard | Host-Kontrolle |
|---|---|---|
| Plugin-Ausführung | Aktiviert | Lifecycle-kontrolliert (aktivieren/deaktivieren) |
| Externes Netzwerk | **Deaktiviert** | Whitelist erforderlich über Manifest-Berechtigungen |
| Hooks | Aktiviert | 200ms-Timeout pro Hook-Ausführung |
| Speicher | Eingeschränkt | Adapter-kontrolliert (localStorage oder Supabase) |
| UI-Rendering | Aktiviert | React-Sandbox, kein direkter DOM-Zugriff |

Plugins **können** nicht auf externe Netzwerke zugreifen, es sei denn, sie werden explizit von der Host-App in die Whitelist aufgenommen. Alle Hook-Ausführungen haben ein hartes 200ms-Timeout, um Endlosschleifen oder UI-Blockaden zu verhindern.

Für die Meldung von Sicherheitslücken siehe [Sicherheitsrichtlinie](SECURITY.md).

## Beispiele

| Beispiel | Beschreibung |
|---------|-------------|
| [Hello Plugin](example/hello_plugin/) | Einfachstes Plugin |
| [RAB Generator](example/rab_generator/) | KI-gestützte RAB-Generierung |
| [WhatsApp Sync](example/whatsapp_sync/) | WhatsApp-Benachrichtigungen |
| [Material Connector](example/material_connector/) | Lieferanten-Synchronisation |
| [Custom Report](example/custom_report/) | Berichtsgenerierung |

## Dokumentation

- [Vollständige Dokumentation](https://blueprin-docs.vercel.app)
- [Erste Schritte](docs/getting-started/)
- [Plugin-Entwicklung](docs/plugin-development/)
- [Hooks & Events](docs/hooks/)
- [UI-Komponenten](docs/ui-components/)
- [Speicher](docs/storage/)
- [Connectoren](docs/connectors/)
- [Testen](docs/testing/)
- [Veröffentlichung](docs/publishing/)

## API-Referenz

Vollständige API-Dokumentation ist unter [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api) verfügbar:

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — Haupt-Einstiegspunkt
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — Plugin-Lifecycle
- [EventBus](https://blueprin-docs.vercel.app/api/events) — Pub/Sub-Events
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — Lifecycle-Hooks
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project, Material, RAB usw.

## Beiträge

Wir freuen uns über Beiträge! Bitte lesen Sie unseren [Beitragsleitfaden](CONTRIBUTING.md) für Details.

## Community

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — Stellen Sie Fragen, teilen Sie Ideen und verbinden Sie sich mit anderen Entwicklern
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — Melden Sie Fehler und beantragen Sie Funktionen

## Lizenz

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> Übersetzungen können hinter der englischen Dokumentation zurückbleiben. Die englische README ist die kanonische Quelle.
