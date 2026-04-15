import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
} from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

type PackageJson = {
  name: string;
  version: string;
  license: string;
  peerDependencies: Record<string, string>;
  sideEffects: string[];
  [key: string]: unknown;
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(__dirname, '../src/components');
const rootPkgPath = resolve(__dirname, '../package.json');
const distDir = resolve(__dirname, '../dist');
const distPkgPath = resolve(distDir, 'package.json');

const dirList = readdirSync(componentsDir, { withFileTypes: true }).filter(
  (d) => d.isDirectory(),
);

const missing = dirList.filter(
  (d) => !existsSync(resolve(componentsDir, d.name, 'index.ts')),
);

if (missing.length > 0) {
  const names = missing
    .map((d) => `  - src/components/${d.name}/index.ts`)
    .join('\n');
  throw new Error(
    `The following components are missing an index.ts entry point:\n${names}\n\n` +
      `Each component directory must have an index.ts that re-exports its public API.\n` +
      `See src/components/Tab/index.ts for an example.`,
  );
}

const componentExports = Object.fromEntries(
  dirList.map((d) => [
    `./${d.name.toLowerCase()}`,
    {
      import: `./components/${d.name}.esm.js`,
      require: `./components/${d.name}.cjs.js`,
      types: `./components/${d.name}/index.d.ts`,
    },
  ]),
);

const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf-8')) as PackageJson;

const distPkg = {
  name: rootPkg.name,
  version: rootPkg.version,
  license: rootPkg.license,
  peerDependencies: rootPkg.peerDependencies,
  sideEffects: rootPkg.sideEffects,
  exports: {
    '.': {
      import: './index.esm.js',
      require: './index.cjs.js',
      types: './index.d.ts',
    },
    './styles': './style.css',
    ...componentExports,
  },
};

mkdirSync(distDir, { recursive: true });
writeFileSync(distPkgPath, JSON.stringify(distPkg, null, 2) + '\n');
console.log(
  `Generated dist/package.json with exports for: ${dirList.map((d) => d.name).join(', ')}`,
);
