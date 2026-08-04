#!/usr/bin/env node

/**
 * Build script for @alvinahmad/blueprin-sdk
 * Generates CommonJS, ESM bundles, and copies source for subpath imports
 */

const { build } = require('esbuild');
const { mkdirSync, readdirSync, statSync, cpSync, writeFileSync } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

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
  let entry = join(SRC, name, 'index.ts');
  if (!require('fs').existsSync(entry)) {
    entry = join(SRC, name, 'index.tsx');
  }
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


async function buildAll() {
  console.log('Building @alvinahmad/blueprin-sdk...\n');

  mkdirSync(OUT, { recursive: true });

  // Build main entry
  await build({
    ...COMMON_OPTIONS,
    entryPoints: [join(SRC, 'index.ts')],
    format: 'cjs',
    outfile: join(OUT, 'index.js'),
  });

  await build({
    ...COMMON_OPTIONS,
    entryPoints: [join(SRC, 'index.ts')],
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
  }

  console.log('  Generating Type Declarations (tsc)...');
  try {
    execSync('npx tsc --emitDeclarationOnly', { stdio: 'inherit', cwd: ROOT });
  } catch (err) {
    console.warn('  ⚠️ tsc generated errors, but continuing build...');
  }

  console.log('\n✅ Build complete!');
}

buildAll().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
