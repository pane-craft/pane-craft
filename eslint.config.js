import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import hooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

// tsestling.config is intentionally chosen over ESLint's defineConfig due to
// defineConfig's current known incompatibilities with typescript-eslint's
// strictTypeChecked configs.
//
// More information:
// https://github.com/typescript-eslint/typescript-eslint/issues/11313
//
// eslint-disable-next-line @typescript-eslint/no-deprecated
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'storybook-static/**',
      '*.config.js',
    ],
  },

  // Source ///////////////////////////////////////////////////////////////////
  {
    files: ['src/**/*.{ts,tsx}'],

    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      jsxA11y.flatConfigs.recommended,
      prettierConfig,
    ],

    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },

    plugins: {
      'react-hooks': hooksPlugin,
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...hooksPlugin.configs.recommended.rules,
      'react-hooks/exhaustive-deps': 'error',

      'react/prop-types': 'off',

      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        { allowNumber: true },
      ],

      'no-console': 'warn',
    },
  },

  // Config ///////////////////////////////////////////////////////////////////
  {
    files: ['*.config.ts', '*.config.*.ts', 'src/test-setup.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
