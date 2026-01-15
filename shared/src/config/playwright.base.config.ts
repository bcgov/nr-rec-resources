import { config } from 'dotenv';
import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

// Load .env file from cwd (where playwright is run from)
config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Read storageState from file.
 * Returns undefined if file doesn't exist, allowing fallback to manual login.
 */
export const getAdminStorageState = () => {
  const filePath = path.resolve(
    process.cwd(),
    'e2e/.auth/admin-storage-state.json',
  );
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return undefined;
};

export const getViewerStorageState = () => {
  const filePath = path.resolve(
    process.cwd(),
    'e2e/.auth/viewer-storage-state.json',
  );
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  return undefined;
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
