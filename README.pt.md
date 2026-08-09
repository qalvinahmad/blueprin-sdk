<div align="center">

# Blueprin SDK

[![CI Build & Test](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/qalvinahmad/blueprin-sdk/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@alvinahmad/blueprin-sdk.svg)](https://www.npmjs.com/package/@alvinahmad/blueprin-sdk)
[![npm downloads](https://img.shields.io/npm/dm/@alvinahmad/blueprin-sdk.svg)](https://www.npmjs.com/package/@alvinahmad/blueprin-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Last Commit](https://img.shields.io/github/last-commit/qalvinahmad/blueprin-sdk?date=iso&color=blue)](https://github.com/qalvinahmad/blueprin-sdk/commits/main)
[![Latest Release](https://img.shields.io/github/v/release/qalvinahmad/blueprin-sdk)](https://github.com/qalvinahmad/blueprin-sdk/releases)

[![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk/badge)](https://api.securityscorecards.dev/projects/github.com/qalvinahmad/blueprin-sdk)
[![Dependabot](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg?logo=dependabot&logoColor=white)](https://github.com/qalvinahmad/blueprin-sdk/network/updates)
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
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md)
[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md)
[![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md)
[![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md)
[![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md)
[![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md)
[![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat)](README.fr.md)
[![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md)
[![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat)](README.de.md)
[![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat&label=You%20are%20here)](README.pt.md)
[![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

SDK oficial para construir **plugins**, **conectores**, **extensões** e **integrações** para [Blueprin](blueprin-app.vercel.app) — a plataforma profissional de orçamento arquitetônico para construção na Indonésia.

## Por que o Blueprin SDK?

Construa extensões prontas para produção para o Blueprin sem reimplementar sua infraestrutura principal.

- **Sistema de Plugins** — Estenda o Blueprin sem modificar o aplicativo host
- **Hooks e Eventos** — Reaja a eventos do ciclo de vida e personalize o comportamento
- **Conectores** — Integre serviços externos e fornecedores
- **Motor de Fórmulas** — Estenda os cálculos RAB com regras de negócio personalizadas
- **Componentes UI** — Construa interfaces de plugin nativas com React
- **Runtime Isolado** — Controle a execução de plugins e o acesso à rede
- **TypeScript primeiro** — Definições de tipos completas e suporte ESM/CJS

## Arquitetura

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

## Instalação

```bash
npm install @alvinahmad/blueprin-sdk
# ou
pnpm add @alvinahmad/blueprin-sdk
# ou
yarn add @alvinahmad/blueprin-sdk
```

## Início Rápido

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

## Crie Seu Primeiro Plugin

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

Ou scaffold um novo plugin com o CLI oficial:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## O Que Está Incluído

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

Todos os módulos suportam tree-shaking e estão disponíveis como imports de subcaminhos:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## Funcionalidades

- **Sistema de Plugins** — Registre, ative, desative e gerencie plugins com hooks de ciclo de vida
- **Event Bus** — Sistema pub/sub para comunicação entre plugins
- **Hook Registry** — Hooks de ciclo de vida antes/depois para estender funcionalidades
- **Storage Adapter** — Armazenamento híbrido localStorage + Supabase com proteções SSR
- **Domain Clients** — Módulos Project, Material, RAB, Schedule, Marketplace e Workforce
- **Componentes UI** — Componentes React para construir interfaces de plugin
- **Connector SDK** — Construa integrações com serviços externos
- **Suporte TypeScript** — Definições de tipos completas incluídas

## Modelo de Segurança

Os plugins do Blueprin executam sob permissões controladas pelo host.

| Capacidade | Padrão | Controle do Host |
|---|---|---|
| Execução de plugins | Ativado | Controlado pelo ciclo de vida (ativar/desativar) |
| Rede externa | **Desativado** | Lista de permissões necessária via permissões do manifesto |
| Hooks | Ativado | Timeout de 200ms por execução de hook |
| Armazenamento | Restrito | Controlado pelo adaptador (localStorage ou Supabase) |
| Renderização UI | Ativado | Sandbox React, sem acesso DOM direto |

Os plugins **não podem** acessar redes externas, a menos que sejam explicitamente incluídos na lista de permissões pelo aplicativo host. Todas as execuções de hooks têm um timeout rígido de 200ms para impedir loops infinitos ou bloqueio de UI.

Para relatórios de vulnerabilidades, consulte a [Política de Segurança](SECURITY.md).

## Exemplos

| Exemplo | Descrição |
|---------|-----------|
| [Hello Plugin](example/hello_plugin/) | Plugin mais simples |
| [RAB Generator](example/rab_generator/) | Geração RAB com IA |
| [WhatsApp Sync](example/whatsapp_sync/) | Notificações WhatsApp |
| [Material Connector](example/material_connector/) | Sincronização de fornecedores |
| [Custom Report](example/custom_report/) | Geração de relatórios |

## Documentação

- [Documentação Completa](https://blueprin-docs.vercel.app)
- [Primeiros Passos](docs/getting-started/)
- [Desenvolvimento de Plugins](docs/plugin-development/)
- [Hooks e Eventos](docs/hooks/)
- [Componentes UI](docs/ui-components/)
- [Armazenamento](docs/storage/)
- [Conectores](docs/connectors/)
- [Testes](docs/testing/)
- [Publicação](docs/publishing/)

## Referência API

A documentação completa da API está disponível em [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api):

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — Ponto de entrada principal
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — Ciclo de vida dos plugins
- [EventBus](https://blueprin-docs.vercel.app/api/events) — Eventos pub/sub
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — Hooks de ciclo de vida
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project, Material, RAB, etc.

## Contribuir

Aceitamos contribuições! Por favor, consulte nosso [Guia de Contribuição](CONTRIBUTING.md) para mais detalhes.

## Comunidade

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — Faça perguntas, compartilhe ideias e conecte-se com outros desenvolvedores
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — Relate bugs e solicite funcionalidades

## Licença

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> As traduções podem estar desatualizadas em relação à documentação em inglês. O README em inglês é a fonte canônica.
