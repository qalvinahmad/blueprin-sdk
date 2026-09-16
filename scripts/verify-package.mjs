import { createRequire } from 'node:module';
import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pkg = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
const requireFromRoot = createRequire(resolve(root, 'package.json'));

for (const [specifier, target] of Object.entries(pkg.exports)) {
  if (specifier === './package.json') continue;

  const requireTarget = resolve(root, target.require.replace(/^\.\//, ''));
  const importTarget = resolve(root, target.import.replace(/^\.\//, ''));
  await access(resolve(root, target.types.replace(/^\.\//, '')));
  await import(importTarget);
  requireFromRoot(requireTarget);
}

console.log(`Package consumer smoke test passed for ${Object.keys(pkg.exports).length} exports.`);
