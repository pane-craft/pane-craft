import {
  copyFileSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = resolve(__dirname, '../dist');

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

// Add explicit .js extensions to relative import specifiers in a .d.ts file
// so the file resolves correctly under TypeScript's node16/nodenext module
// resolution, where extensionless relative imports fail.
function addJsExtensions(source) {
  return source.replace(
    /(\bfrom\s+|\bimport\s*\(\s*)(['"])(\.\.?\/[^'"]+)\2/g,
    (match, keyword, quote, specifier) => {
      // Skip specifiers that already have a known extension.
      if (/\.(js|mjs|cjs|json|css)$/.test(specifier)) return match;
      return `${keyword}${quote}${specifier}.js${quote}`;
    },
  );
}

let rewritten = 0;
let copied = 0;
for (const file of walk(distDir)) {
  if (!file.endsWith('.d.ts')) continue;

  const original = readFileSync(file, 'utf8');
  const fixed = addJsExtensions(original);
  if (fixed !== original) {
    writeFileSync(file, fixed);
    rewritten++;
  }

  copyFileSync(file, file.replace(/\.d\.ts$/, '.d.cts'));
  copied++;
}

console.log(
  `Rewrote import extensions in ${rewritten} .d.ts files; copied ${copied} to .d.cts`,
);
