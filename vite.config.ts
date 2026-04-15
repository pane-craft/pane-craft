import react from '@vitejs/plugin-react';
import { existsSync, readdirSync } from 'fs';
import { resolve } from 'path';
import preserveDirectives from 'rollup-plugin-preserve-directives';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

function getComponentEntries(dir: string) {
  const dirs = readdirSync(dir, { withFileTypes: true }).filter((d) =>
    d.isDirectory(),
  );

  const missing = dirs.filter(
    (d) => !existsSync(resolve(dir, d.name, 'index.ts')),
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

  return Object.fromEntries(
    dirs.map((d) => [d.name, resolve(dir, d.name, 'index.ts')]),
  );
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      insertTypesEntry: true,
      rollupTypes: true,
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
        index: resolve(__dirname, 'src/index.ts'),
        ...getComponentEntries(resolve(__dirname, 'src/components')),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        entryName === 'index'
          ? `index.${format === 'es' ? 'esm' : 'cjs'}.js`
          : `components/${entryName}.${format === 'es' ? 'esm' : 'cjs'}.js`,
    },

    rollupOptions: {
      // Never bundle peer deps
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      plugins: [preserveDirectives()],
      output: {
        // Preserve module structure for better tree-shaking in consumer apps
        preserveModules: true,
        preserveModulesRoot: 'src',
        // Don't minify ESM — preserves /*#__PURE__*/ annotations for tree-shaking
        // CJS minification is handled by the consumer's bundler anyway
        sourcemap: mode !== 'production',
      },
    },

    // Don't clear the outDir between format builds
    emptyOutDir: true,
    sourcemap: mode !== 'production',
  },
}));
