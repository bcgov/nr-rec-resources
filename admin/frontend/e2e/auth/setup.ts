import { test as setup, Page } from '@playwright/test';
import { ADMIN_STATE, VIEWER_STATE } from 'e2e/constants';
import { performLogin } from 'e2e/auth/loginFlow';

async function loginAs(
  page: Page,
  username: string,
  password: string,
  statePath: string,
) {
  await performLogin(page, username, password);

  await page
    .getByRole('heading', { name: 'Search', level: 1 })
    .waitFor({ state: 'visible', timeout: 30000 });

  await page.context().storageState({ path: statePath });
}

setup('authenticate as rst-admin', async ({ page }) => {
  const username = process.env.E2E_ADMIN_USERNAME;
  const password = process.env.E2E_ADMIN_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'E2E_ADMIN_USERNAME and E2E_ADMIN_PASSWORD must be set to run auth setup',
    );
  }

  await loginAs(page, username, password, ADMIN_STATE);
});

setup('authenticate as rst-viewer', async ({ page }) => {
  const username = process.env.E2E_VIEWER_USERNAME;
  const password = process.env.E2E_VIEWER_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'E2E_VIEWER_USERNAME and E2E_VIEWER_PASSWORD must be set to run auth setup',
    );
  }

  await loginAs(page, username, password, VIEWER_STATE);
});
