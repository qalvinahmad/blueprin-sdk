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
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md) [![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md) [![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md) [![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md) [![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md) [![中文](https://img.shields.io/badge/中文-DE2910?style=flat&label=You%20are%20here)](README.zh.md) [![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat)](README.fr.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md) [![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat)](README.de.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat)](README.pt.md) [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

用于构建 [Blueprin](blueprin-app.vercel.app) 的 **插件**、**连接器**、**扩展** 和 **集成** 的官方 SDK — 印度尼西亚专业的建筑预算平台。

## 为什么选择 Blueprin SDK？

无需重新实现核心基础设施即可为 Blueprin 构建生产就绪的扩展。

- **插件系统** — 无需修改宿主应用即可扩展 Blueprin
- **钩子和事件** — 响应生命周期事件并自定义行为
- **连接器** — 集成外部服务和供应商
- **公式引擎** — 使用自定义业务规则扩展 RAB 计算
- **UI 组件** — 构建原生外观的插件界面
- **沙盒运行时** — 控制插件执行和网络访问
- **TypeScript 优先** — 完整的类型定义和 ESM/CJS 支持

## 架构

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

## 安装

```bash
npm install @alvinahmad/blueprin-sdk
# 或
pnpm add @alvinahmad/blueprin-sdk
# 或
yarn add @alvinahmad/blueprin-sdk
```

## 快速开始

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

## 创建你的第一个插件

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

或使用官方 CLI 脚手架创建新插件:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## 包含内容

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

所有模块支持 tree-shaking，可通过子路径导入:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## 功能特性

- **插件系统** — 使用生命周期钩子注册、激活、停用和管理插件
- **事件总线** — 用于插件间通信的 pub/sub 系统
- **钩子注册表** — 用于扩展功能的前后生命周期钩子
- **存储适配器** — 带 SSR 保护的 localStorage + Supabase 混合存储
- **域客户端** — Project、Material、RAB、Schedule、Marketplace 和 Workforce 模块
- **UI 组件** — 用于构建插件界面的 React 组件
- **连接器 SDK** — 与外部服务构建集成
- **TypeScript 支持** — 包含完整的类型定义

## 安全模型

Blueprin 插件在宿主控制的权限下运行。

| 能力 | 默认值 | 宿主控制 |
|---|---|---|
| 插件执行 | 已启用 | 生命周期控制（激活/停用） |
| 外部网络 | **已禁用** | 需要通过清单权限添加白名单 |
| 钩子 | 已启用 | 每次钩子执行 200ms 超时 |
| 存储 | 受限 | 适配器控制（localStorage 或 Supabase） |
| UI 渲染 | 已启用 | React 沙盒，无法直接访问 DOM |

插件**无法**访问外部网络，除非宿主应用明确将其加入白名单。所有钩子执行都有 200ms 硬超时，以防止无限循环或 UI 阻塞。

有关漏洞报告，请参阅 [安全政策](SECURITY.md)。

## 示例

| 示例 | 描述 |
|---------|------|
| [Hello Plugin](example/hello_plugin/) | 最简单的插件 |
| [RAB Generator](example/rab_generator/) | AI 驱动的 RAB 生成 |
| [WhatsApp Sync](example/whatsapp_sync/) | WhatsApp 通知 |
| [Material Connector](example/material_connector/) | 供应商同步 |
| [Custom Report](example/custom_report/) | 报告生成 |

## 文档

- [完整文档](https://blueprin-docs.vercel.app)
- [快速入门](docs/getting-started/)
- [插件开发](docs/plugin-development/)
- [钩子和事件](docs/hooks/)
- [UI 组件](docs/ui-components/)
- [存储](docs/storage/)
- [连接器](docs/connectors/)
- [测试](docs/testing/)
- [发布](docs/publishing/)

## API 参考

完整的 API 文档请访问 [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api):

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — 主入口点
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — 插件生命周期
- [EventBus](https://blueprin-docs.vercel.app/api/events) — pub/sub 事件
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — 生命周期钩子
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project、Material、RAB 等

## 贡献

我们欢迎贡献！详情请参阅 [贡献指南](CONTRIBUTING.md)。

## 社区

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — 提问、分享想法、与其他开发者交流
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — 报告错误和功能请求

## 许可证

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> 翻译可能滞后于英文文档。英文 README 是权威来源。
