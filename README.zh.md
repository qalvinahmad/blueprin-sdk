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

**🌐 语言:**  
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md)  
[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md)  
[![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md)  
[![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md)  
[![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md)  
[![中文](https://img.shields.io/badge/中文-DE2910?style=flat&label=当前位置)](README.zh.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

用于为 [Blueprin](blueprin-app.vercel.app) 构建 **插件**、**连接器**、**扩展** 和 **集成** 的官方 SDK — 印度尼西亚建筑专业架构预算平台。

## 安装

```bash
npm install @alvinahmad/blueprin-sdk
# 或者
pnpm add @alvinahmad/blueprin-sdk
# 或者
yarn add @alvinahmad/blueprin-sdk
```

## 快速入门

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

## 第一个插件

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-first-plugin',
  name: '我的第一个插件',
  version: '1.0.0',
  description: '我的第一个 Blueprin 插件',

  activate(ctx) {
    // 监听事件
    ctx.events.on('blueprin:project:created', (data) => {
      console.log('项目已创建:', data.project.name);
    });

    // 注册钩子
    ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
      console.log('RAB 总计:', data.result.total);
      return data;
    });

    // 返回插件 API
    return {
      api: {
        getVersion: () => '1.0.0',
      },
    };
  },

  deactivate(instance) {
    console.log('插件已停用');
  },
});
```

## 许可证

MIT © [qalvinahmad](https://github.com/qalvinahmad)
