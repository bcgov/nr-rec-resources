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
];
