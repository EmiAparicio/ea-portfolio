import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import path from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';

import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';
import storybookPlugin from 'eslint-plugin-storybook';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/storybook-static/**',
      '**/public/storybook/**',
      '**/public/uvegame/**',
      '**/*.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    ...nextPlugin.configs['core-web-vitals'],
    settings: {
      next: {
        rootDir: 'packages/portfolio',
      },
    },
  },

  ...storybookPlugin.configs['flat/recommended'],

  ...compat.extends('plugin:react/recommended').map((config) => ({
    ...config,
    files: ['packages/ui-pkg/**/*.{ts,tsx}'],
    plugins: {
      ...config.plugins,
      'react-hooks': reactHooks,
    },

    rules: {
      ...config.rules,
      ...reactHooks.configs.recommended.rules,

      'react/react-in-jsx-scope': 'off',
    },

    settings: {
      react: {
        version: 'detect',
        runtime: 'automatic',
      },
    },
  })),
];

export default eslintConfig;
