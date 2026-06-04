import baseConfig from '@shared/config/playwright.base.config';
import { defineConfig } from '@playwright/test';
import { BASE_URL } from './e2e/constants';

// Convert localhost to 127.0.0.1 to avoid DNS resolution issues
const normalizedBaseURL = BASE_URL.replace('localhost', '127.0.0.1');

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: normalizedBaseURL,
  },
  projects: (baseConfig.projects ?? []).map((project) => ({
    ...project,
    use: {
      ...project.use,
      baseURL: normalizedBaseURL,
    },
  })),
});
