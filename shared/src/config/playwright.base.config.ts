import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Load .env file from cwd (where playwright is run from)
config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Parse storageState from environment variable (JSON string).
 * Returns undefined if not set, allowing fallback to manual login.
 */
export const getAdminStorageState = () => {
  const state = process.env.E2E_ADMIN_STORAGE_STATE;
  return state ? JSON.parse(state) : undefined;
};

export const getViewerStorageState = () => {
  const state = process.env.E2E_VIEWER_STORAGE_STATE;
  return state ? JSON.parse(state) : undefined;
};

export default defineConfig({
  timeout: 10000, // Reduced for debugging (was 120000)
  expect: {
    timeout: 10000,
  },
  testDir: './e2e',
  testMatch: process.env.E2E_CAPTURE_AUTH
    ? '**/capture-auth.ts'
    : '**/*.spec.ts',
  testIgnore: process.env.E2E_CAPTURE_AUTH ? undefined : '**/scripts/**',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['line'],
    ['list', { printSteps: true }],
    ['html', { open: 'always' }],
  ],
  use: {
    bypassCSP: true,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Temporarily disabled for debugging:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'safari', use: { ...devices['Desktop Safari'] } },
  ],
});
