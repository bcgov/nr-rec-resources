/**
 * Helper script to capture storageState for GitHub secrets.
 *
 * Run manually with: npm run e2e:capture-auth
 */

import { config } from 'dotenv';
import { test as setup } from '@playwright/test';
import { AuthPOM } from '../poms/auth';
import * as fs from 'fs';

config();

setup('Capture admin auth state', async ({ page }) => {
  await page.goto('/');
  const auth = new AuthPOM(page);

  await auth.clickLoginButton();

  const user = process.env.E2E_TEST_ADMIN_USER;
  const password = process.env.E2E_TEST_ADMIN_PASSWORD;
  const email = user ? `${user}@gov.bc.ca` : undefined;

  if (!email || !password) {
    throw new Error('Set E2E_TEST_ADMIN_USER and E2E_TEST_ADMIN_PASSWORD');
  }

  await auth.performMicrosoftLogin(email, password);
  await auth.verifyLoggedIn();

  const state = await page.context().storageState();
  const json = JSON.stringify(state, null, 2);

  fs.mkdirSync('.auth', { recursive: true });
  fs.writeFileSync('.auth/admin-storage-state.json', json);
  console.log('\n✓ Saved to .auth/admin-storage-state.json\n');
});

setup('Capture viewer auth state', async ({ page }) => {
  await page.goto('/');
  const auth = new AuthPOM(page);

  await auth.clickLoginButton();

  const user = process.env.E2E_TEST_VIEWER_USER;
  const password = process.env.E2E_TEST_VIEWER_PASSWORD;
  const email = user ? `${user}@gov.bc.ca` : undefined;

  if (!email || !password) {
    throw new Error('Set E2E_TEST_VIEWER_USER and E2E_TEST_VIEWER_PASSWORD');
  }

  await auth.performMicrosoftLogin(email, password);
  await auth.verifyLoggedIn();

  const state = await page.context().storageState();
  const json = JSON.stringify(state, null, 2);

  fs.mkdirSync('.auth', { recursive: true });
  fs.writeFileSync('.auth/viewer-storage-state.json', json);
  console.log('\n✓ Saved to .auth/viewer-storage-state.json\n');
});
