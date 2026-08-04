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

**المنصات:**  
![Windows](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white) ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) ![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white) ![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=ios&logoColor=white)

**🌐 اللغات:**  
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md)  
[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md)  
[![العربية](https://img.shields.io/badge/العربية-000000?style=flat&label=أنتم%20هنا)](README.ar.md)  
[![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md)  
[![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md)  
[![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

SDK الرسمي لبناء **الإضافات** و **المكونات** و **الامتدادات** و **التكاملات** لـ [Blueprin](blueprin-app.vercel.app) — منصة تخطيط الميزانية المعمارية الاحترافية للبناء في إندونيسيا.

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
// { version: '1.0.0', plugins: 0, hooks: 0, events: 0, initialized: true }
```

## الإضافة الأولى

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-first-plugin',
  name: 'إضافتي الأولى',
  version: '1.0.0',
  description: 'إضافتي الأولى لـ Blueprin',

  activate(ctx) {
    // الاستماع إلى الأحداث
    ctx.events.on('blueprin:project:created', (data) => {
      console.log('تم إنشاء المشروع:', data.project.name);
    });

    // تسجيل الخطافات
    ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
      console.log('إجمالي RAB:', data.result.total);
      return data;
    });

    // إرجاع API الإضافة
    return {
      api: {
        getVersion: () => '1.0.0',
      },
    };
  },

  deactivate(instance) {
    console.log('تم تعطيل الإضافة');
  },
});
```

## قالب الإضافة

استخدم [blueprint_plugin_template](https://github.com/qalvinahmad/blueprint_plugin_template) لإنشاء إضافة جديدة:

```bash
# على GitHub، انقر "Use this template"
# أو استنسخ مباشرة:
git clone https://github.com/qalvinahmad/blueprint_plugin_template my-plugin
cd my-plugin
npm install
```

## الميزات

- **نظام الإضافات** — تسجيل وتفعيل وتعطيل وإدارة الإضافات مع خطافات دورة الحياة
- **نظام الأحداث** — نظام pub/sub للتواصل بين الإضافات
- **سجل الخطافات** — خطافات before/after دورة الحياة لتوسيع الوظائف
- **محادثة التخزين** — تخزين هجين localStorage + Supabase مع حماية SSR
- **عملاء النطاق** — وحدات المشروع والمادة و RAB والجدول وسوق ومصادقة
- **مكونات واجهة المستخدم** — مكونات React لبناء واجهات الإضافات
- **SDK المكونات** — بناء التكاملات مع الخدمات الخارجية
- **دعم TypeScript** — تعريفات الأنواع الكاملة مضمنة

## مرجع API

### BlueprinSDK

| الخاصية | النوع | الوصف |
|----------|-------|-------|
| `plugins` | `PluginManager` | إدارة دورة حياة الإضافات |
| `events` | `EventBus` | نظام أحداث pub/sub |
| `hooks` | `HookRegistry` | خطافات before/after دورة الحياة |
| `storage` | `StorageAdapter` | تخزين localStorage + Supabase |
| `config` | `ConfigManager` | تكوين الإضافات |
| `logger` | `Logger` | تسجيل الأخطاء |

### PluginManager

| الطريقة | الوصف |
|---------|-------|
| `register(manifest)` | تسجيل إضافة جديدة |
| `activate(pluginId)` | تفعيل الإضافة |
| `deactivate(pluginId)` | تعطيل الإضافة |
| `remove(pluginId)` | حذف الإضافة |
| `activateAll()` | تفعيل جميع الإضافات |
| `list()` | قائمة جميع الإضافات المسجلة |
| `get(pluginId)` | الحصول على الإضافة حسب المعرف |

### EventBus

| الطريقة | الوصف |
|---------|-------|
| `on(event, callback)` | الاشتراك في حدث |
| `once(event, callback)` | اشتراك واحد |
| `off(event, callback)` | إلغاء الاشتراك |
| `emit(event, data)` | إطلاق حدث |

### HookRegistry

| الطريقة | الوصف |
|---------|-------|
| `register(hook, callback)` | تسجيل خطاف |
| `unregister(hook, callback)` | إلغاء تسجيل خطاف |
| `execute(hook, context)` | تنفيذ جميع استدعاءات الخطاف |

## أسماء الأحداث

| الحدث | الوصف |
|-------|-------|
| `blueprin:project:created` | تم إنشاء المشروع |
| `blueprin:project:updated` | تم تحديث المشروع |
| `blueprin:project:deleted` | تم حذف المشروع |
| `blueprin:material:created` | تم إنشاء المادة |
| `blueprin:material:updated` | تم تحديث المادة |
| `blueprin:rab:calculated` | تم حساب RAB |
| `blueprin:rab:expanded` | تم توسيع RAB إلى المواد/العمالة |
| `blueprin:schedule:generated` | تم إنشاء الجدول |
| `blueprin:task:completed` | تم إكمال المهمة |
| `blueprin:marketplace:order:created` | تم إنشاء طلب السوق |
| `blueprin:marketplace:rfq:received` | تم استلام RFQ |
| `blueprin:marketplace:partner:registered` | تم تسجيل الشريك |
| `blueprin:auth:signed:in` | دخول المستخدم |
| `blueprin:auth:signed:out` | خروج المستخدم |

## أسماء الخطافات

| الخطاف | متى |
|--------|-----|
| `blueprin:before:project:create` | قبل إنشاء المشروع |
| `blueprin:after:project:create` | بعد إنشاء المشروع |
| `blueprin:before:rab:calculate` | قبل حساب RAB |
| `blueprin:after:rab:calculate` | بعد حساب RAB |
| `blueprin:before:material:create` | قبل إنشاء المادة |
| `blueprin:after:material:create` | بعد إنشاء المادة |
| `blueprin:before:order:create` | قبل إنشاء الطلب |
| `blueprin:after:order:create` | بعد إنشاء الطلب |
| `blueprin:before:export` | قبل تصدير التقرير |
| `blueprin:after:export` | بعد تصدير التقرير |

## SDK المكونات

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

## مكونات واجهة المستخدم

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

// الاستخدام في واجهة الإضافة
export default function MyPluginUI() {
  return (
    <BlueprintCard>
      <BlueprintBadge variant="success">نشط</BlueprintBadge>
      <BlueprintButton variant="primary">انقر هنا</BlueprintButton>
    </BlueprintCard>
  );
}
```

## الأمان

لمخاوف الأمان، يرجى الاطلاع على [سياسة الأمان](SECURITY.md).

## المساهمة

نرحب بالمساهمات! يرجى الاطلاع على [دليل المساهمة](CONTRIBUTING.md) للتفاصيل.

## التوثيق

- [البدء](docs/getting-started/)
- [تطوير الإضافات](docs/plugin-development/)
- [الخطافات والأحداث](docs/hooks/)
- [مكونات واجهة المستخدم](docs/ui-components/)
- [التخزين](docs/storage/)
- [المكونات](docs/connectors/)
- [الاختبار](docs/testing/)
- [النشر](docs/publishing/)

## الأمثلة

- [Hello Plugin](example/hello_plugin/) - أبسط إضافة
- [RAB Generator](example/rab_generator/) - إنشاء RAB بالذكاء الاصطناعي
- [WhatsApp Sync](example/whatsapp_sync/) - إشعارات WhatsApp
- [Material Connector](example/material_connector/) - مزامنة الموردين
- [Custom Report](example/custom_report/) - إنشاء التقارير

## الترخيص

MIT © [qalvinahmad](https://github.com/qalvinahmad)
