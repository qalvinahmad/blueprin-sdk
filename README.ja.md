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
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md) [![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat)](README.id.md) [![Arabic](https://img.shields.io/badge/Arabic-000000?style=flat)](README.ar.md) [![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat&label=You%20are%20here)](README.ja.md) [![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md) [![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md) [![Français](https://img.shields.io/badge/Fran%C3%A7ais-0052CC?style=flat)](README.fr.md) [![Español](https://img.shields.io/badge/Espa%C3%B1ol-D80027?style=flat)](README.es.md) [![Deutsch](https://img.shields.io/badge/Deutsch-000000?style=flat)](README.de.md) [![Português](https://img.shields.io/badge/Portugu%C3%AAs-009B3A?style=flat)](README.pt.md) [![Русский](https://img.shields.io/badge/%D0%A0%D1%83%D1%81%D1%81%D0%BA%D0%B8%D0%B9-0039A6?style=flat)](README.ru.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

[Blueprin](blueprin-app-vercel-app) の **プラグイン**、**コネクタ**、**拡張機能**、**統合** を構築するための公式 SDK — インドネシアの建設向けプロフェッショナル建築予算プラットフォーム。

## なぜ Blueprin SDK？

コアインフラを再実装せずに、Blueprin 用の本番環境対応の拡張機能を構築します。

- **プラグインシステム** — ホストアプリを変更せずに Blueprin を拡張
- **フック＆イベント** — ライフサイクルイベントに反応し、動作をカスタマイズ
- **コネクタ** — 外部サービスやサプライヤーとの統合
- **フォーマルエンジン** — カスタムビジネスルールで RAB 計算を拡張
- **UI コンポーネント** — ネイティブに見えるプラグインインターフェースを構築
- **サンドボックスランタイム** — プラグインの実行とネットワークアクセスを制御
- **TypeScript ファースト** — 完全な型定義と ESM/CJS サポート

## アーキテクチャ

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

## インストール

```bash
npm install @alvinahmad/blueprin-sdk
# または
pnpm add @alvinahmad/blueprin-sdk
# または
yarn add @alvinahmad/blueprin-sdk
```

## クイックスタート

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

## 最初のプラグインを作成する

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

または公式 CLI で新しいプラグインをスキャフォールド:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

## 含まれるもの

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

すべてのモジュールは tree-shaking をサポートし、サブパスインポートとして利用可能です:

```javascript
import { BlueprinSDK } from '@alvinahmad/blueprin-sdk';
import { definePlugin } from '@alvinahmad/blueprin-sdk/core';
import { ProjectClient } from '@alvinahmad/blueprin-sdk/project';
```

## 機能

- **プラグインシステム** — ライフサイクルフックによるプラグインの登録、有効化、無効化、管理
- **Event Bus** — プラグイン間通信のための pub/sub システム
- **Hook Registry** — 機能拡張のための前後ライフサイクルフック
- **Storage Adapter** — SSR ガード付きの localStorage + Supabase ハイブリッドストレージ
- **Domain Clients** — Project、Material、RAB、Schedule、Marketplace、Workforce モジュール
- **UI コンポーネント** — プラグインインターフェース構築用の React コンポーネント
- **Connector SDK** — 外部サービスとの統合を構築
- **TypeScript サポート** — 完全な型定義を含む

## セキュリティモデル

Blueprin プラグインはホスト制御の権限下で実行されます。

| ケーパリティ | デフォルト | ホスト制御 |
|---|---|---|
| プラグイン実行 | 有効 | ライフサイクル制御（有効/無効） |
| 外部ネットワーク | **無効** | マニフェスト権限による許可リストが必要 |
| フック | 有効 | フック実行ごとに 200ms タイムアウト |
| ストレージ | 制限付き | アダプター制御（localStorage または Supabase） |
| UI レンダリング | 有効 | React サンドボックス、直接 DOM アクセス不可 |

プラグインはホストアプリによって明示的にホワイトリストに追加されない限り、外部ネットワークにアクセス**できません**。無限ループや UI ブロックを防ぐため、すべてのフック実行には 200ms のハードタイムアウトがあります。

脆弱性の報告については、[セキュリティポリシー](SECURITY.md)を参照してください。

## 例

| 例 | 説明 |
|------|------|
| [Hello Plugin](example/hello_plugin/) | 最もシンプルなプラグイン |
| [RAB Generator](example/rab_generator/) | AI 対応 RAB 生成 |
| [WhatsApp Sync](example/whatsapp_sync/) | WhatsApp 通知 |
| [Material Connector](example/material_connector/) | サプライヤー同期 |
| [Custom Report](example/custom_report/) | レポート生成 |

## ドキュメント

- [完全なドキュメント](https://blueprin-docs.vercel.app)
- [はじめに](docs/getting-started/)
- [プラグイン開発](docs/plugin-development/)
- [フック＆イベント](docs/hooks/)
- [UI コンポーネント](docs/ui-components/)
- [ストレージ](docs/storage/)
- [コネクタ](docs/connectors/)
- [テスト](docs/testing/)
- [公開](docs/publishing/)

## API リファレンス

完全な API ドキュメントは [blueprin-docs.vercel.app/api](https://blueprin-docs.vercel.app/api) でご覧いただけます:

- [BlueprinSDK](https://blueprin-docs.vercel.app/api/sdk) — メインエントリポイント
- [PluginManager](https://blueprin-docs.vercel.app/api/plugin-manager) — プラグインライフサイクル
- [EventBus](https://blueprin-docs.vercel.app/api/events) — pub/sub イベント
- [HookRegistry](https://blueprin-docs.vercel.app/api/hooks) — ライフサイクルフック
- [Domain Clients](https://blueprin-docs.vercel.app/api/domain-clients) — Project、Material、RAB など

## コントリビューション

コントリビューションを歓迎します！詳細は [コントリビューションガイド](CONTRIBUTING.md) をご覧ください。

## コミュニティ

- [GitHub Discussions](https://github.com/qalvinahmad/blueprin-sdk/discussions) — 質問、アイデア共有、他の開発者との交流
- [Issue Tracker](https://github.com/qalvinahmad/blueprin-sdk/issues) — バグ報告と機能リクエスト

## ライセンス

MIT © [qalvinahmad](https://github.com/qalvinahmad)

---

> 翻訳は英語のドキュメントより遅れることがあります。英語の README が正典です。
