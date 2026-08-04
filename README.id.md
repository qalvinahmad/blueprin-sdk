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

**Platform:**  
![Windows](https://img.shields.io/badge/Windows-0078D6?style=flat&logo=windows&logoColor=white) ![macOS](https://img.shields.io/badge/macOS-000000?style=flat&logo=apple&logoColor=white) ![Android](https://img.shields.io/badge/Android-3DDC84?style=flat&logo=android&logoColor=white) ![iOS](https://img.shields.io/badge/iOS-000000?style=flat&logo=ios&logoColor=white)

**🌐 Bahasa:**  
[![English](https://img.shields.io/badge/English-0052CC?style=flat)](README.md)  
[![Bahasa Indonesia](https://img.shields.io/badge/Bahasa_Indonesia-FF0000?style=flat&label=Berada%20di%20sini)](README.id.md)  
[![العربية](https://img.shields.io/badge/العربية-000000?style=flat)](README.ar.md)  
[![日本語](https://img.shields.io/badge/日本語-BC002D?style=flat)](README.ja.md)  
[![한국어](https://img.shields.io/badge/한국어-003478?style=flat)](README.ko.md)  
[![中文](https://img.shields.io/badge/中文-DE2910?style=flat)](README.zh.md)

</div>

<br/>
<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1QKFSHyeVr75XTAiYaz7UYojd16srcj6R" alt="Blueprin App" width="100%" />
</div>
<br/>

SDK resmi untuk membangun **plugin**, **connector**, **ekstensi** dan **integrasi** untuk [Blueprin](blueprin-app.vercel.app) — platform perencanaan anggaran arsitektur profesional untuk konstruksi di Indonesia.

## Instalasi

```bash
npm install @alvinahmad/blueprin-sdk
# atau
pnpm add @alvinahmad/blueprin-sdk
# atau
yarn add @alvinahmad/blueprin-sdk
```

## Mulai Cepat

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

## Plugin Pertama

```javascript
import { definePlugin } from '@alvinahmad/blueprin-sdk';

export default definePlugin({
  id: 'my-first-plugin',
  name: 'Plugin Pertama Saya',
  version: '1.0.0',
  description: 'Plugin pertama saya untuk Blueprin',

  activate(ctx) {
    // Dengarkan event
    ctx.events.on('blueprin:project:created', (data) => {
      console.log('Proyek dibuat:', data.project.name);
    });

    // Daftarkan hook
    ctx.hooks.register('blueprin:after:rab:calculate', (data) => {
      console.log('Total RAB:', data.result.total);
      return data;
    });

    // Kembalikan API plugin
    return {
      api: {
        getVersion: () => '1.0.0',
      },
    };
  },

  deactivate(instance) {
    console.log('Plugin dinonaktifkan');
  },
});
```

## Buat Plugin Baru

Cara termudah untuk men-generate boilerplate plugin baru (dengan TypeScript, Vitest, dan struktur folder yang benar) adalah menggunakan CLI resmi kami:

```bash
npx create-blueprin-plugin my-plugin
cd my-plugin
npm install
npm run dev
```

CLI ini akan secara otomatis menyalin [blueprint_plugin_template](https://github.com/qalvinahmad/blueprint_plugin_template), mengatur ID dan nama plugin, serta menyiapkan segalanya untuk pengembangan.

## Fitur

- **Sistem Plugin** — Daftarkan, aktifkan, nonaktifkan, dan kelola plugin dengan lifecycle hook
- **Event Bus** — Sistem pub/sub untuk komunikasi antar plugin
- **Hook Registry** — Hook before/after lifecycle untuk memperluas fungsi
- **Storage Adapter** — Hybrid storage localStorage + Supabase dengan SSR guards
- **Domain Clients** — Modul Project, Material, RAB, Schedule, Marketplace, dan Auth
- **Komponen UI** — Komponen React untuk membangun antarmuka plugin
- **Connector SDK** — Bangun integrasi dengan layanan eksternal
- **Dukungan TypeScript** — Definisi tipe lengkap disertakan

## Referensi API

### BlueprinSDK

| Properti | Tipe | Deskripsi |
|----------|------|-----------|
| `plugins` | `PluginManager` | Manajemen lifecycle plugin |
| `events` | `EventBus` | Sistem event pub/sub |
| `hooks` | `HookRegistry` | Hook before/after lifecycle |
| `storage` | `StorageAdapter` | Storage localStorage + Supabase |
| `config` | `ConfigManager` | Konfigurasi plugin |
| `logger` | `Logger` | Logging debug |

### PluginManager

| Metode | Deskripsi |
|--------|-----------|
| `register(manifest)` | Daftarkan plugin baru |
| `activate(pluginId)` | Aktifkan plugin |
| `deactivate(pluginId)` | Nonaktifkan plugin |
| `remove(pluginId)` | Hapus plugin |
| `activateAll()` | Aktifkan semua plugin |
| `list()` | Daftar semua plugin terdaftar |
| `get(pluginId)` | Ambil plugin berdasarkan ID |

### Modul Domain

| Modul | Deskripsi |
| :--- | :--- |
| `ProjectClient` | Info utama proyek, status, anggota tim |
| `MaterialClient` | Manajemen BOM, katalog material, alat |
| `RabClient` | Budgeting, quantity surveying, cost pipelines |
| `ScheduleClient` | Penjadwalan, lini masa, tahapan/fase proyek |
| `MarketplaceClient` | Pengadaan, RFQ, integrasi dengan Supplier |
| `WorkforceClient` | Manajemen Tukang/Mandor, Kehadiran, Upah/Payroll |

### EventBus

| Metode | Deskripsi |
|--------|-----------|
| `on(event, callback)` | Berlangganan ke event |
| `once(event, callback)` | Berlangganan sekali |
| `off(event, callback)` | Berhenti berlangganan |
| `emit(event, data)` | Emit event |

### HookRegistry

| Metode | Deskripsi |
|--------|-----------|
| `register(hook, callback)` | Daftarkan hook |
| `unregister(hook, callback)` | Hapus pendaftaran hook |
| `execute(hook, context)` | Eksekusi semua callback hook |

## Nama Event

| Event | Deskripsi |
|-------|-----------|
| `blueprin:project:created` | Proyek dibuat |
| `blueprin:project:updated` | Proyek diperbarui |
| `blueprin:project:deleted` | Proyek dihapus |
| `blueprin:material:created` | Material dibuat |
| `blueprin:material:updated` | Material diperbarui |
| `blueprin:rab:calculated` | RAB dihitung |
| `blueprin:rab:expanded` | RAB diperluas ke material/tenaga kerja |
| `blueprin:schedule:generated` | Jadwal digenerate |
| `blueprin:task:completed` | Tugas selesai |
| `blueprin:marketplace:order:created` | Pesanan marketplace dibuat |
| `blueprin:marketplace:rfq:received` | RFQ diterima |
| `blueprin:marketplace:partner:registered` | Mitra terdaftar |
| `blueprin:auth:signed:in` | Pengguna masuk |
| `blueprin:auth:signed:out` | Pengguna keluar |

## Nama Hook

| Hook | Kapan |
|------|-------|
| `blueprin:before:project:create` | Sebelum pembuatan proyek |
| `blueprin:after:project:create` | Setelah pembuatan proyek |
| `blueprin:before:rab:calculate` | Sebelum perhitungan RAB |
| `blueprin:after:rab:calculate` | Setelah perhitungan RAB |
| `blueprin:before:material:create` | Sebelum pembuatan material |
| `blueprin:after:material:create` | Setelah pembuatan material |
| `blueprin:before:order:create` | Sebelum pembuatan pesanan |
| `blueprin:after:order:create` | Setelah pembuatan pesanan |
| `blueprin:before:export` | Sebelum ekspor laporan |
| `blueprin:after:export` | Setelah ekspor laporan |

## Formula Engine (Mesin Formula)

Blueprin menyediakan mesin perhitungan (*calculation engine*) yang sangat fleksibel (*extensible*) di dalam modul RAB. Ini memungkinkan developer untuk menyuntikkan rumus matematika kustom di berbagai tahapan kalkulasi anggaran.

```javascript
// Daftarkan rumus Margin Profit kustom sebesar 10%
sdk.rab.formulas.registerProfit('standard-margin', async (context) => {
  return context.baseTotal * 0.10; // profit 10%
});

// Daftarkan rumus Pajak (PPN) sebesar 11%
sdk.rab.formulas.registerTax('ppn', async (context) => {
  return context.currentTotal * 0.11;
});
```

*Pipeline* yang tersedia: `coefficient`, `escalation`, `allowance`, `overhead`, `profit`, `tax`.

## Workforce & Payroll (Tenaga Kerja & Pengupahan)

Modul khusus untuk mengelola data pekerja konstruksi dan menghitung upah.

```javascript
// 1. Tambahkan pekerja (contoh: Tukang)
const worker = await sdk.workforce.addWorker(projectId, {
  name: 'Budi Tukang',
  role: 'TUKANG',
  daily_rate: 150000,
  overtime_rate: 20000
});

// 2. Catat absensi harian
await sdk.workforce.logAttendance(projectId, worker.id, '2026-08-04', 'PRESENT', 2); // 2 jam lembur

// 3. Kalkulasi Gaji untuk periode tertentu
const wages = await sdk.workforce.calculateWages(projectId, '2026-08-01', '2026-08-31');
```

## Connector SDK

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

## Komponen UI

> **Catatan:** Blueprin adalah platform berbasis React. Plugin UI dan komponen yang diinjeksi melalui SDK harus dibangun menggunakan **React 18+**. Jika suatu saat Anda berencana mendukung Vue atau Svelte, Anda perlu membungkus komponen antarmuka sebagai Web Components (Custom Elements) atau menyediakan *binding* terpisah.

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

// Gunakan di UI plugin Anda
export default function MyPluginUI() {
  return (
    <BlueprintCard>
      <BlueprintBadge variant="success">Aktif</BlueprintBadge>
      <BlueprintButton variant="primary">Klik Saya</BlueprintButton>
    </BlueprintCard>
  );
}
```

## Keamanan & Sandboxing Runtime

Blueprin SDK menerapkan standar keamanan runtime (sandboxing) untuk melindungi Host App:
- **Batasan Waktu Hook (Timeout)**: Eksekusi setiap hook di dalam plugin dibatasi maksimal `200ms` untuk mencegah *infinite loop* atau proses *blocking* pada antarmuka pengguna.
- **Permintaan Jaringan (Network Requests)**: Plugin **tidak diizinkan** melakukan *fetch* atau permintaan HTTP ke domain eksternal manapun kecuali domain tersebut telah dimasukkan ke dalam daftar putih (*whitelist*) oleh host app melalui *manifest permissions*.

Untuk celah keamanan lainnya, silakan lihat [Kebijakan Keamanan](SECURITY.md).

## Berkontribusi

Kami menyambut kontribusi! Silakan lihat [Panduan Kontribusi](CONTRIBUTING.md) untuk detail.

## Dokumentasi

- [Memulai](docs/getting-started/)
- [Pengembangan Plugin](docs/plugin-development/)
- [Hook & Event](docs/hooks/)
- [Komponen UI](docs/ui-components/)
- [Penyimpanan](docs/storage/)
- [Connector](docs/connectors/)
- [Pengujian](docs/testing/)
- [Penerbitan](docs/publishing/)

## Contoh

- [Hello Plugin](example/hello_plugin/) - Plugin paling sederhana
- [RAB Generator](example/rab_generator/) - Generate RAB dengan AI
- [WhatsApp Sync](example/whatsapp_sync/) - Notifikasi WhatsApp
- [Material Connector](example/material_connector/) - Sinkronisasi supplier
- [Custom Report](example/custom_report/) - Generate laporan

## Lisensi

MIT © [qalvinahmad](https://github.com/qalvinahmad)
