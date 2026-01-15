import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 10000, // Reduced for debugging (was 120000)
  expect: {
    timeout: 10000,
  },
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // Disabled for debugging (was: process.env.CI ? 2 : 0)
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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // Temporarily disabled for debugging:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'safari', use: { ...devices['Desktop Safari'] } },
    // {
    //   name: 'edge',
    //   use: {
    //     ...devices['Desktop Edge'],
    //     browserName: 'chromium',
    //     channel: 'msedge',
    //   },
    // },
  ],
});
