#!/usr/bin/env node

/**
 * Build script for @blueprin/sdk
 * Generates CommonJS and ESM bundles from source
 */

const { build } = require('esbuild');
const { mkdirSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'lib', 'src');
const OUT = join(ROOT, 'lib');

async function buildModule(name) {
  const entry = join(SRC, name, 'index.js');
  const outdir = join(OUT, name);

  mkdirSync(outdir, { recursive: true });

  // CommonJS
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'cjs',
    outfile: join(outdir, 'index.js'),
    platform: 'neutral',
    target: 'node18',
    external: ['react', 'react-dom'],
  });

  // ESM
  await build({
    entryPoints: [entry],
    bundle: true,
    format: 'esm',
    outfile: join(outdir, 'index.mjs'),
    platform: 'neutral',
    target: 'node18',
    external: ['react', 'react-dom'],
  });

  console.log(`  ✔ ${name}`);
}

async function buildAll() {
  console.log('Building @blueprin/sdk...\n');

  // Build main entry
  await build({
    entryPoints: [join(ROOT, 'lib', 'index.js')],
    bundle: true,
    format: 'cjs',
    outfile: join(OUT, 'index.js'),
    platform: 'neutral',
    target: 'node18',
    external: ['react', 'react-dom'],
  });

  await build({
    entryPoints: [join(ROOT, 'lib', 'index.js')],
    bundle: true,
    format: 'esm',
    outfile: join(OUT, 'index.mjs'),
    platform: 'neutral',
    target: 'node18',
    external: ['react', 'react-dom'],
  });

  console.log('  ✔ index (main)');

  // Build each module
  const modules = readdirSync(SRC).filter((dir) => {
    return statSync(join(SRC, dir)).isDirectory() && dir !== '.DS_Store';
  });

  for (const mod of modules) {
    await buildModule(mod);
  }

  console.log('\n✅ Build complete!');
}

buildAll().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
