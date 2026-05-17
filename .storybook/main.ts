import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  // Set the asset base path when deploying under a subpath (i.e. GitHub
  // Pages at `/pane-craft/`). Only set `STORYBOOK_BASE_PATH` when deploying,
  // so local development using `pnpm storybook` is unaffected.
  viteFinal: async (viteConfig) => {
    if (process.env.STORYBOOK_BASE_PATH) {
      viteConfig.base = process.env.STORYBOOK_BASE_PATH;
    }
    return viteConfig;
  },

  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: path.resolve(__dirname, '../tsconfig.json'),
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        if (prop.declarations !== undefined && prop.declarations.length > 0) {
          return (
            prop.declarations.findIndex(
              (d) => !d.fileName.includes('node_modules'),
            ) !== -1
          );
        }
        return true;
      },
    },
  },
};

export default config;
