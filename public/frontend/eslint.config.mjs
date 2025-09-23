import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import { fixupPluginRules } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
// eslint-disable-next-line import/no-relative-parent-imports
import baseConfig from '../../eslint.config.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...baseConfig,
  {
    ignores: [
      '**/.vscode/',
      '**/coverage/',
      '**/dist/',
      'public/assets/',
      '**/tsconfig.*.json',
    ],
  },
  ...compat.extends('plugin:react/recommended'),
  ...compat.extends('plugin:storybook/recommended'),
  {
    plugins: {
      react,
      'react-hooks': fixupPluginRules(reactHooks),
    },

    languageOptions: {
      ecmaVersion: 12,
      sourceType: 'module',

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        project: ['./tsconfig.json'],
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react',
              importNames: ['default'],
              message: "Please import from 'react/jsx-runtime' instead.",
            },
          ],
        },
      ],

      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
