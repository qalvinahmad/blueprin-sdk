<div dir="rtl" align="center">

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
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md) [![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md) [![العربية](https://img.shields.io/badge/العربية-000000?style=flat&label=You%20are%20here)](README.ar.md) [![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md) [![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md) [![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md) [![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat)](README.fr.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md) [![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat)](README.de.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat)](README.pt.md) [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

SDK الرسمي لبناء **الإضافات** وال**موصلات** و**الامتدادات** و**التكاملات** لـ [Blueprin](blueprin-app.vercel.app) — منصة ميزانية معمارية احترافية للبناء في إندونيسيا.

## لماذا Blueprin SDK؟

قم ببناء امتدادات جاهزة للإنتاج لـ Blueprin دون إعادة تنفيذ البنية التحتية الأساسية.

- **نظام الإضافات** — قم بتوسيع Blueprin دون تعديل التطبيق المضيف
- **الخطافات والأحداث** — استجب لأحداث دورة الحياة وخصّص السلوك
- **الموصلات** — قم بدمج الخدمات والموردين الخارجيين
- **محرك الصيغ** — قم بتوسيع حسابات RAB بقواعد عمل مخصصة
- **مكونات واجهة المستخدم** — قم ببناء واجهات إضافات React تبدو أصلية
- **بيئة التشغيل المعزولة** — تحكم في تنفيذ الإضافات والوصول إلى الشبكة
- **TypeScript أولاً** — تعريفات Types كاملة ودعم ESM/CJS

## الهيكلية

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

## التثبيت

```bash
npm install @alvinahmad/blueprin-sdk
# أو
pnpm add @alvinahmad/blueprin-sdk
# أو
yarn add @alvinahmad/blueprin-sdk
```

## البدء السريع

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

## أنشئ إضافتك الأولى

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

أو قم بإنشاء إضافة جديدة باستخدام CLI الرسمي:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## ما الم included

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

جميع الوحدات تدعم tree-shaking ومتاحة كاستيرادات فرعية:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## الميزات

- **نظام الإضافات** — سجّل وفعّل وأوقف وأدر الإضافات مع خطافات دورة الحياة
- **Event Bus** — نظام pub/sub للاتصال بين الإضافات
- **Hook Registry** — خطافات دورة الحياة قبل/بعد لتوسيع الوظائف
- **Storage Adapter** — تخزين هجين localStorage + Supabase مع حماية SSR
- **Domain Clients** — وحدات Project وMaterial وRAB وSchedule وMarketplace وWorkforce
- **مكونات واجهة المستخدم** — مكونات React لبناء واجهات الإضافات
- **Connector SDK** — قم ببناء تكاملات مع الخدمات الخارجية
- **دعم TypeScript** — تعريفات Types كاملة مضمنة

## نموذج الأمان

تعمل إضافات Blueprin تحت أذونات تتحكم فيها التطبيق المضيف.

| القدرة | الافتراضي | التحكم المضيف |
|---|---|---|
| تنفيذ الإضافات | مفعّل | تتحكم دورة الحياة (تفعيل/تعطيل) |
| الشبكة الخارجية | **معطّل** | مطلوب allowlist عبر أذونات القائمة |
| الخطافات | مفعّل | مهلة 200ms لكل تنفيذ خطاف |
| التخزين | مقيد | تتحكم فيه الوحدة (localStorage أو Supabase) |
| عرض واجهة المستخدم | مفعّل | React sandbox، بدون وصول DOM مباشر |

الإضافات **لا يمكنها** الوصول إلى الشبكات الخارجية ما لم تتم إضافتها إلى القائمة البيضاء بشكل صريح من قِبَل التطبيق المضيف. جميع عمليات تنفيذ الخطافات لها مهلة صلبة 200ms لمنع الحلقات اللانهائية أو حظر واجهة المستخدم.

للإبلاغ عن الثغرات الأمنية، راجع [سياسة الأمان](SECURITY.md).

## الأمثلة

| المثال | الوصف |
|---------|-------|
| [Hello Plugin](example/hello_plugin/) | أبسط إضافة |
| [RAB Generator](example/rab_generator/) | إنشاء RAB بالذكاء الاصطناعي |
| [WhatsApp Sync](example/whatsapp_sync/) | إشعارات WhatsApp |
| [Material Connector](example/material_connector/) | مزامنة الموردين |
| [Custom Report](example/custom_report/) | إنشاء التقارير |

## التوثيق

- [التوثيق الكامل](https://blueprin-docs.vercel.app)
- [البدء](docs/getting-started/)
- [تطوير الإضافات](docs/plugin-development/)
- [الخطافات والأحداث](docs/hooks/)
- [مكونات واجهة المستخدم](docs/ui-components/)
- [التخزين](docs/storage/)
- [الموصلات](docs/connectors/)
- [الاختبار](docs/testing/)
- [النشر](docs/publishing/)

## مرجع API

التوثيق الكامل لـ API متاح على [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api):

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — نقطة الدخول الرئيسية
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — دورة حياة الإضافة
- [EventBus](https://blueprin-docs.vercel.app/api/events) — أحداث pub/sub
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — خطافات دورة الحياة
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project وMaterial وRAB إلخ

## المساهمة

نرحب بالمساهمات! يرجى الاطلاع على [دليل المساهمة](CONTRIBUTING.md) للتفاصيل.

## المجتمع

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — اطرح الأسئلة وشارك الأفكار وتواصل مع المطورين الآخرين
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — أبلغ عن الأخطاء واطلب الميزات

## الترخيص

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> قد تتأخر الترجمات عن التوثيق الإنجليزي. ملف README بالإنجليزية هو المصدر الرسمي.
