import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-onboarding',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  async viteFinal(config, _options) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    return mergeConfig(config, {
      plugins: [],
      resolve: {
        alias: {
          ...config.resolve?.alias,
          '@/': path.resolve(__dirname, '../src/'),
          '@components/': path.resolve(__dirname, '../src/components/'),
          '@i18n': path.resolve(__dirname, '../src/i18n.ts'),
          'shared-constants': path.resolve(
            __dirname,
            '../../shared-constants/index.ts'
          ),
        },
      },
      optimizeDeps: {
        include: ['react/jsx-dev-runtime', '@mdx-js/react', 'markdown-to-jsx'],
      },
    });
  },
};

export default config;
