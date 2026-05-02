import react from '@vitejs/plugin-react';
import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

const root = __dirname;

function getComponentBarrelEntries(componentsDir: string) {
  const dirs = readdirSync(componentsDir, { withFileTypes: true }).filter((d) =>
    d.isDirectory(),
  );

  const missing = dirs.filter(
    (d) => !existsSync(resolve(componentsDir, d.name, 'index.ts')),
  );
  if (missing.length > 0) {
    const names = missing
      .map((d) => `  - src/components/${d.name}/index.ts`)
      .join('\n');
    throw new Error(
      `The following components are missing an index.ts entry point:\n${names}\n\n` +
        `Each component directory must have an index.ts that re-exports its public API.`,
    );
  }

  return Object.fromEntries(
    dirs.map((d) => [
      `components/${d.name}/index`,
      resolve(componentsDir, d.name, 'index.ts'),
    ]),
  );
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      insertTypesEntry: true,
    }),
  ],

  css: {
    modules: {
      generateScopedName:
        mode === 'development'
          ? 'pc_[name]__[local]'
          : 'pc_[local]_[hash:base64:6]',
    },
    postcss: './postcss.config.js',
  },

  build: {
    lib: {
      entry: {
        index: resolve(root, 'src/index.ts'),
        ...getComponentBarrelEntries(resolve(root, 'src/components')),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },

    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      plugins: [preserveDirectives()],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },

    sourcemap: true,
  },
}));
