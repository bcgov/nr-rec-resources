import { test as setup, Page } from '@playwright/test';
import { ADMIN_STATE, VIEWER_STATE, BASE_URL } from 'e2e/constants';

async function loginAs(
  page: Page,
  username: string,
  password: string,
  statePath: string,
) {
  await page.goto(BASE_URL);
  await page.getByRole('button', { name: /log\s*in/i }).click();

  // BCGov Keycloak shows an IDIR identity provider link.
  // Local Keycloak (docker-compose e2e) shows a plain username/password form.
  const idirLink = page.getByRole('link', { name: /idir/i });
  const isIdirVisible = await idirLink
    .isVisible({ timeout: 5000 })
    .catch(() => false);

  if (isIdirVisible) {
    await idirLink.click();
    await page.locator('input[name="user"]').fill(username);
    await page.locator('input[name="password"]').fill(password);
    await page.locator('input[type="submit"]').click();
  } else {
    await page.locator('#username').fill(username);
    await page.locator('#password').fill(password);
    await page.locator('#kc-login').click();
  }

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
