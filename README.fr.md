<div align="center">

# Blueprin SDK

[![CI Build & Test](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/qalvinahmad/blueprin-sdk/graph/badge.svg?token=dcf0d4cb-2c2d-4b9c-bd27-842a79e81966)](https://codecov.io/gh/qalvinahmad/blueprin-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@alvinahmad/blueprin-sdk.svg)](https://www.npmjs.com/package/@alvinahmad/blueprin-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Last Commit](https://img.shields.io/github/last-commit/qalvinahmad/blueprin-sdk?date=iso&color=blue)](https://github.com/qalvinahmad/blueprin-sdk/commits/main)
[![Latest Release](https://img.shields.io/github/v/release/qalvinahmad/blueprin-sdk)](https://github.com/qalvinahmad/blueprin-sdk/releases)

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk/badge)](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk)
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
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md) [![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md) [![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md) [![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md) [![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md) [![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md) [![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat&label=You%20are%20here)](README.fr.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md) [![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat)](README.de.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat)](README.pt.md) [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

SDK officiel pour construire des **plugins**, **connecteurs**, **extensions** et **intégrations** pour [Blueprin](blueprin-app.vercel.app) — la plateforme professionnelle de budgétisation architecturale pour la construction en Indonésie.

## Pourquoi Blueprin SDK ?

Construisez des extensions prêtes pour la production pour Blueprin sans réimplémenter son infrastructure principale.

- **Système de plugins** — Étendez Blueprin sans modifier l'application hôte
- **Hooks et événements** — Réagissez aux événements du cycle de vie et personnalisez le comportement
- **Connecteurs** — Intégrez des services et fournisseurs externes
- **Moteur de formules** — Étendez les calculs RAB avec des règles métier personnalisées
- **Composants UI** — Construisez des interfaces de plugin React native
- **Runtime sandboxé** — Contrôlez l'exécution des plugins et l'accès réseau
- **TypeScript en premier** — Définitions de types complètes et support ESM/CJS

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
# ou
pnpm add @alvinahmad/blueprin-sdk
# ou
yarn add @alvinahmad/blueprin-sdk
```

## Démarrage rapide

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

## Créez votre premier plugin

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

Ou scaffoldez un nouveau plugin avec le CLI officiel:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## Contenu inclus

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

Tous les modules supportent le tree-shaking et sont disponibles en tant qu'imports de sous-chemins:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## Fonctionnalités

- **Système de plugins** — Enregistrez, activez, désactivez et gérez les plugins avec des hooks de cycle de vie
- **Event Bus** — Système pub/sub pour la communication entre plugins
- **Hook Registry** — Hooks de cycle de vie avant/après pour étendre les fonctionnalités
- **Storage Adapter** — Stockage hybride localStorage + Supabase avec gardes SSR
- **Domain Clients** — Modules Project, Material, RAB, Schedule, Marketplace et Workforce
- **Composants UI** — Composants React pour construire des interfaces de plugin
- **Connector SDK** — Construisez des intégrations avec des services externes
- **Support TypeScript** — Définitions de types complètes incluses

## Modèle de sécurité

Les plugins Blueprin s'exécutent sous des permissions contrôlées par l'hôte.

| Capacité | Par défaut | Contrôle hôte |
|---|---|---|
| Exécution des plugins | Activé | Contrôlé par le cycle de vie (activer/désactiver) |
| Réseau externe | **Désactivé** | Liste blanche requise via les permissions du manifeste |
| Hooks | Activé | Timeout de 200ms par exécution de hook |
| Stockage | Restreint | Contrôlé par l'adaptateur (localStorage ou Supabase) |
| Rendu UI | Activé | Sandbox React, pas d'accès DOM direct |

Les plugins **ne peuvent pas** accéder aux réseaux externes sauf s'ils sont explicitement mis en liste blanche par l'application hôte. Toutes les exécutions de hooks ont un timeout strict de 200ms pour empêcher les boucles infinies ou le blocage de l'UI.

Pour le signalement de vulnérabilités, consultez la [Politique de sécurité](SECURITY.md).

## Exemples

| Exemple | Description |
|---------|-------------|
| [Hello Plugin](example/hello_plugin/) | Plugin le plus simple |
| [RAB Generator](example/rab_generator/) | Génération RAB par IA |
| [WhatsApp Sync](example/whatsapp_sync/) | Notifications WhatsApp |
| [Material Connector](example/material_connector/) | Synchronisation fournisseurs |
| [Custom Report](example/custom_report/) | Génération de rapports |

## Documentation

- [Documentation complète](https://blueprin-docs.vercel.app)
- [Pour commencer](docs/getting-started/)
- [Développement de plugins](docs/plugin-development/)
- [Hooks et événements](docs/hooks/)
- [Composants UI](docs/ui-components/)
- [Stockage](docs/storage/)
- [Connecteurs](docs/connectors/)
- [Tests](docs/testing/)
- [Publication](docs/publishing/)

## Référence API

La documentation API complète est disponible sur [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api):

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — Point d'entrée principal
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — Cycle de vie des plugins
- [EventBus](https://blueprin-docs.vercel.app/api/events) — Événements pub/sub
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — Hooks de cycle de vie
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project, Material, RAB, etc.

## Contribuer

Nous accueillons les contributions ! Veuillez consulter notre [Guide de contribution](CONTRIBUTING.md) pour les détails.

## Communauté

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — Posez des questions, partagez des idées et connectez-vous avec d'autres développeurs
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — Signalez des bugs et demandez des fonctionnalités

## Licence

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> Les traductions peuvent être en retard par rapport à la documentation anglaise. Le README en anglais est la source canonique.
