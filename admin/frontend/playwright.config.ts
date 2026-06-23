import 'dotenv/config';
import baseConfig from '@shared/config/playwright.base.config';
import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, ADMIN_STATE } from './e2e/constants';

const SETUP_PROJECT = 'setup';

// Convert localhost to 127.0.0.1 to avoid DNS resolution issues
const normalizedBaseURL = BASE_URL.replace('localhost', '127.0.0.1');

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: normalizedBaseURL,
  },
  projects: [
    // Auth setup — logs in as both roles and saves storageState files
    {
      name: SETUP_PROJECT,
      testMatch: /auth\/setup\.ts/,
    },

    // Unauthenticated tests — LoginPage a11y and content (no setup dependency)
    {
      name: 'chromium-unauth',
      use: { ...devices['Desktop Chrome'], baseURL: normalizedBaseURL },
      testMatch: '**/pages/login.spec.ts',
    },

    // Authenticated tests — all browsers, depend on setup, storageState = rst-admin
    ...(baseConfig.projects ?? []).map((project) => ({
      ...project,
      use: {
        ...project.use,
        baseURL: normalizedBaseURL,
        storageState: ADMIN_STATE,
      },
      testIgnore: '**/pages/login.spec.ts',
      dependencies: [SETUP_PROJECT],
    })),
  ],
});
