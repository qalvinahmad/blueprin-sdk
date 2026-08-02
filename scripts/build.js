#!/usr/bin/env node

/**
 * Build script for @blueprin/sdk
 * Generates CommonJS, ESM bundles, and copies source for subpath imports
 */

const { build } = require('esbuild');
const { mkdirSync, readdirSync, statSync, cpSync, writeFileSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'lib', 'src');
const OUT = join(ROOT, 'lib');

const EXTERNALS = ['react', 'react-dom', 'react/jsx-runtime'];

const COMMON_OPTIONS = {
  bundle: true,
  platform: 'neutral',
  target: 'node18',
  external: EXTERNALS,
  sourcemap: true,
  logLevel: 'info',
  allowOverwrite: true,
};

async function buildModule(name) {
  const entry = join(SRC, name, 'index.js');
  const outDir = join(OUT, name);

  mkdirSync(outDir, { recursive: true });

  await build({
    ...COMMON_OPTIONS,
    entryPoints: [entry],
    format: 'cjs',
    outfile: join(outDir, 'index.js'),
  });

  await build({
    ...COMMON_OPTIONS,
    entryPoints: [entry],
    format: 'esm',
    outfile: join(outDir, 'index.mjs'),
  });

  console.log(`  ✔ ${name}`);
}

function generateTypeDeclarations(name) {
  const outDir = join(OUT, name);
  const srcDir = join(SRC, name);
  const indexFile = join(srcDir, 'index.js');

  if (!statSync(indexFile, { throw: false })) return;

  const content = statSync(indexFile).toString();
  const exports = [];

  const exportRegex = /export\s+(?:class|function|const|async function)\s+(\w+)/g;
  let match;
  while ((match = exportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  const dts = `// Auto-generated type declarations for @blueprin/sdk/${name}
${exports.map((e) => `export { ${e} } from './${e}';`).join('\n')}
`;

  writeFileSync(join(outDir, 'index.d.ts'), dts);

  for (const exp of exports) {
    const srcFile = join(srcDir, `${exp}.js`);
    if (statSync(srcFile, { throw: false })) {
      writeFileSync(
        join(outDir, `${exp}.d.ts`),
        `// Auto-generated type declaration
export {};
`
      );
    }
  }
}

async function buildAll() {
  console.log('Building @blueprin/sdk...\n');

  mkdirSync(OUT, { recursive: true });

  // Build main entry
  await build({
    ...COMMON_OPTIONS,
    entryPoints: [join(SRC, 'index.js')],
    format: 'cjs',
    outfile: join(OUT, 'index.js'),
  });

  await build({
    ...COMMON_OPTIONS,
    entryPoints: [join(SRC, 'index.js')],
    format: 'esm',
    outfile: join(OUT, 'index.mjs'),
  });

  console.log('  ✔ index (main)');

  // Build each module from src/
  const modules = readdirSync(SRC).filter((dir) => {
    try {
      return statSync(join(SRC, dir)).isDirectory();
    } catch {
      return false;
    }
  });

  for (const mod of modules) {
    await buildModule(mod);
    generateTypeDeclarations(mod);
  }

  // Generate main index.d.ts
  const mainDts = `// Auto-generated type declarations for @blueprin/sdk
export { BlueprinSDK } from './src/core/sdk';
export { PluginManager } from './src/core/plugin-manager';
export { EventBus } from './src/core/event-bus';
export { HookRegistry } from './src/core/hook-registry';
export { StorageAdapter } from './src/core/storage-adapter';
export { Logger } from './src/core/logger';
export { ConfigManager } from './src/core/config-manager';
export { definePlugin, defineConnector, defineExtension } from './src/core/plugin-def';
export { PLUGIN_LIFECYCLE, PLUGIN_STATUS, CONNECTOR_STATUS, EVENT_NAMES, HOOK_NAMES } from './src/core/constants';
export { ProjectClient } from './src/project/index';
export { MaterialClient } from './src/material/index';
export { RabClient } from './src/rab/index';
export { ScheduleClient } from './src/schedule/index';
export { MarketplaceClient } from './src/marketplace/index';
export { AuthClient } from './src/auth/index';
export { BaseConnector, ConnectorRegistry } from './src/connector/index';
export { createHook, HookPatterns } from './src/hooks/index';
export { BlueprintButton, BlueprintCard, BlueprintBadge, BlueprintInput, BlueprintSelect, BlueprintTable, BlueprintModal, BlueprintToast, BlueprintSkeleton } from './src/ui/index';
export { formatIDR, formatDate, formatRelativeTime, cn, generateId, debounce, deepClone, pick, omit } from './src/utils/index';
`;

  writeFileSync(join(OUT, 'index.d.ts'), mainDts);

  // Generate per-module index.d.ts
  for (const mod of modules) {
    const srcDir = join(SRC, mod);
    const indexFile = join(srcDir, 'index.js');
    if (!statSync(indexFile, { throw: false })) continue;

    const content = require('fs').readFileSync(indexFile, 'utf8');
    const exports = [];
    const exportRegex = /export\s+(?:class|function|const|async function)\s+(\w+)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }

    if (exports.length > 0) {
      const dts = `// Auto-generated type declarations for @blueprin/sdk/${mod}
${exports.map((e) => `export { ${e} } from '../../src/${mod}/${e}';`).join('\n')}
`;
      writeFileSync(join(OUT, mod, 'index.d.ts'), dts);
    }
  }

  console.log('\n✅ Build complete!');
}

buildAll().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
