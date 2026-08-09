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
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md) [![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md) [![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md) [![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md) [![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md) [![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md) [![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat)](README.fr.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md) [![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat)](README.de.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat)](README.pt.md) [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat&label=You%20are%20here)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

Официальный SDK для создания **плагинов**, **коннекторов**, **расширений** и **интеграций** для [Blueprin](blueprin-app.vercel.app) — профессиональная платформа архитектурного бюджетирования для строительства в Индонезии.

## Зачем Blueprin SDK?

Создавайте готовые к производству расширения для Blueprin без повторной реализации его базовой инфраструктуры.

- **Система плагинов** — Расширяйте Blueprin без изменения хост-приложения
- **Хуки и события** — Реагируйте на события жизненного цикла и настраивайте поведение
- **Коннекторы** — Интегрируйте внешние сервисы и поставщиков
- **Формульный движок** — Расширяйте расчёты RAB пользовательскими бизнес-правилами
- **UI компоненты** — Создавайте нативно выглядящие интерфейсы плагинов на React
- **Песочница рантайма** — Контролируйте выполнение плагинов и сетевой доступ
- **TypeScript в первую очередь** — Полные определения типов и поддержка ESM/CJS

## Архитектура

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

## Установка

```bash
npm install @alvinahmad/blueprin-sdk
# или
pnpm add @alvinahmad/blueprin-sdk
# или
yarn add @alvinahmad/blueprin-sdk
```

## Быстрый старт

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

## Создайте свой первый плагин

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

Или создайте новый плагин с помощью официального CLI:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## Что включено

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

Все модули поддерживают tree-shaking и доступны как subpath-импорты:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## Возможности

- **Система плагинов** — Регистрируйте, активируйте, деактивируйте и управляйте плагинами с хуками жизненного цикла
- **Event Bus** — Система pub/sub для межплагинного взаимодействия
- **Hook Registry** — Хуки жизненного цикла до/после для расширения функциональности
- **Storage Adapter** — Гибридное хранилище localStorage + Supabase с SSR-защитой
- **Domain Clients** — Модули Project, Material, RAB, Schedule, Marketplace и Workforce
- **UI компоненты** — Компоненты React для создания интерфейсов плагинов
- **Connector SDK** — Создавайте интеграции с внешними сервисами
- **Поддержка TypeScript** — Полные определения типов включены

## Модель безопасности

Плагины Blueprin работают под контролем хост-приложения.

| Возможность | По умолчанию | Контроль хоста |
|---|---|---|
| Выполнение плагинов | Включено | Контроль жизненного цикла (активация/деактивация) |
| Внешняя сеть | **Отключено** | Требуется белый список через разрешения манифеста |
| Хуки | Включено | Тайм-аут 200мс на выполнение хука |
| Хранилище | Ограничено | Контроль адаптером (localStorage или Supabase) |
| Рендеринг UI | Включено | React-песочница, прямой доступ к DOM запрещён |

Плагины **не могут** обращаться к внешним сетям, если только они не внесены в белый список хост-приложения. Все выполнения хуков имеют жёсткий тайм-аут 200мс для предотвращения бесконечных циклов или блокировки UI.

Для сообщения об уязвимостях см. [Политику безопасности](SECURITY.md).

## Примеры

| Пример | Описание |
|---------|----------|
| [Hello Plugin](example/hello_plugin/) | Самый простой плагин |
| [RAB Generator](example/rab_generator/) | Генерация RAB на основе ИИ |
| [WhatsApp Sync](example/whatsapp_sync/) | Уведомления WhatsApp |
| [Material Connector](example/material_connector/) | Синхронизация с поставщиками |
| [Custom Report](example/custom_report/) | Генерация отчётов |

## Документация

- [Полная документация](https://blueprin-docs.vercel.app)
- [Начало работы](docs/getting-started/)
- [Разработка плагинов](docs/plugin-development/)
- [Хуки и события](docs/hooks/)
- [UI компоненты](docs/ui-components/)
- [Хранилище](docs/storage/)
- [Коннекторы](docs/connectors/)
- [Тестирование](docs/testing/)
- [Публикация](docs/publishing/)

## Справочник API

Полная документация API доступна на [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api):

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — Основная точка входа
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — Жизненный цикл плагинов
- [EventBus](https://blueprin-docs.vercel.app/api/events) — События pub/sub
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — Хуки жизненного цикла
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project, Material, RAB и др.

## Участие

Мы приветствуем вклад! Ознакомьтесь с [Руководством по участию](CONTRIBUTING.md) для подробностей.

## Сообщество

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — Задавайте вопросы, делитесь идеями и общайтесь с другими разработчиками
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — Сообщайте об ошибках и запрашивайте функции

## Лицензия

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> Переводы могут отставать от английской документации. Английский README является каноническим источником.
