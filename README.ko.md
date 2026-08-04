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

**🌐 언어:**  
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md)  
[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md)  
[![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md)  
[![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md)  
[![한국어](https://img.shields.io/badge/한국어-003478?style=flat&label=현재위치)](README.ko.md)  
[![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

[Blueprin](blueprin-app.vercel.app)용 **플러그인**, **커넥터**, **확장 프로그램** 및 **통합**을 구축하기 위한 공식 SDK — 인도네시아 건설을 위한 전문 아키텍처 예산 플랫폼.

## 설치

```bash
npm install @alvinahmad/blueprin-sdk
# 또는
pnpm add @alvinahmad/blueprin-sdk
# 또는
yarn add @alvinahmad/blueprin-sdk
```

## 빠른 시작

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

## 첫 번째 플러그인

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-first-plugin',
  name: '나의 첫 번째 플러그인',
  version: '1.0.0',
  description: 'Blueprin을 위한 첫 번째 플러그인',

  activate(ctx) {
    // 이벤트 수신
    ctx.events.on('blueprin:project:created', (data) => {
      console.log('프로젝트가 생성되었습니다:', data.project.name);
    });

    // 후크 등록
    ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
      console.log('RAB 합계:', data.result.total);
      return data;
    });

    // 플러그인 API 반환
    return {
      api: {
        getVersion: () => '1.0.0',
      },
    };
  },

  deactivate(instance) {
    console.log('플러그인이 비활성화되었습니다');
  },
});
```

## 라이선스

MIT © [qalvinahmad](https://github.com/qalvinahmad)
