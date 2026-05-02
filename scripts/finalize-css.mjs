import {
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

// Vite + libInjectCss emit per-component CSS as `*.module.css` and a JS shim
// (`*.module.css.js`) holding the hashed class-name map. When that file lands
// in a consumer's `node_modules`, the consumer's bundler (Vite, webpack, etc)
// sees the `.module.css` extension and re-runs CSS Modules transformation —
// re-hashing the class names so they no longer match the strings already
// baked into the shim. The CSS loads, but no rules apply.
//
// This script flattens the layout so consumers see plain CSS:
//   1. Rename every `X.module.css` → `X.css` (so consumers treat it as global).
//   2. Strip the `import './X.module.css'` from each shim — the side-effect
//      moves to the consumer-facing file instead.
//   3. In each consumer-facing `X.js`/`X.cjs`, add `import './X.css'` for
//      every shim it references, and drop the `/* empty css */` markers
//      libInjectCss left behind.
//
// Shim filenames (`X.module.css.js`) are kept as-is — they're only imported
// internally by our own emitted JS, so the `.module.css` segment in their
// name is harmless to the consumer.

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = resolve(__dirname, '../dist');

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

const allFiles = [...walk(distDir)];

let renamed = 0;
for (const file of allFiles) {
  if (file.endsWith('.module.css')) {
    renameSync(file, file.replace(/\.module\.css$/, '.css'));
    renamed++;
  }
}

const shimImportEsm =
  /^[ \t]*import\s+['"][^'"]*\.module\.css['"]\s*;?\s*\r?\n?/m;
const shimRequireCjs =
  /^[ \t]*require\(\s*['"][^'"]*\.module\.css['"]\s*\)\s*;?\s*\r?\n?/m;

let strippedShims = 0;
for (const file of allFiles) {
  const isShimEsm = file.endsWith('.module.css.js');
  const isShimCjs = file.endsWith('.module.css.cjs');
  if (!isShimEsm && !isShimCjs) continue;

  const original = readFileSync(file, 'utf8');
  const updated = original.replace(
    isShimEsm ? shimImportEsm : shimRequireCjs,
    '',
  );
  if (updated !== original) {
    writeFileSync(file, updated);
    strippedShims++;
  }
}

const shimRefEsm = /from\s+['"](\.\/[^'"]+)\.module\.css\.js['"]/g;
const shimRefCjs =
  /require\(\s*[`'"](\.\/[^`'"]+)\.module\.css\.cjs[`'"]\s*\)/g;
const emptyCssMarker = /\/\*\s*empty css[^*]*\*\/\s*;?/g;

let updatedConsumers = 0;
for (const file of allFiles) {
  if (file.endsWith('.module.css.js') || file.endsWith('.module.css.cjs'))
    continue;
  if (!file.endsWith('.js') && !file.endsWith('.cjs')) continue;

  const isCjs = file.endsWith('.cjs');
  const re = isCjs ? shimRefCjs : shimRefEsm;
  const original = readFileSync(file, 'utf8');

  const stems = new Set();
  for (const match of original.matchAll(re)) stems.add(match[1]);
  if (stems.size === 0) continue;

  const cleaned = original.replace(emptyCssMarker, '');
  const importLines = [...stems]
    .map((stem) =>
      isCjs ? `require('${stem}.css');` : `import '${stem}.css';`,
    )
    .join('');

  writeFileSync(file, importLines + cleaned);
  updatedConsumers++;
}

console.log(
  `Renamed ${renamed} *.module.css → *.css; stripped CSS imports from ${strippedShims} shims; ` +
    `injected CSS imports into ${updatedConsumers} consumer modules.`,
);
