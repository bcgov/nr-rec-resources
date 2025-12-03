// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';
// eslint-disable-next-line import/no-relative-parent-imports
import baseConfig from '../../eslint.config.mjs';
// eslint-disable-next-line import/no-relative-parent-imports
import reactConfig from '../../shared/src/config/eslint.config.react.mjs';

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
  ...reactConfig,
  ...storybook.configs['flat/recommended'],
];
