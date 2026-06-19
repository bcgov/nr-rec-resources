import { test, expect } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';

// Explicitly unauthenticated — drives the real login UI rather than restoring session state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication flow', () => {
  test('unauthenticated user sees login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText('Welcome to RecSpace')).toBeVisible();
    await expect(page.getByRole('button', { name: /log\s*in/i })).toBeVisible();
  });

  test('rst-admin can log in and reach the search page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /log\s*in/i }).click();

    const idirLink = page.getByRole('link', { name: /idir/i });
    const isIdirVisible = await idirLink
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isIdirVisible) {
      await idirLink.click();
      await page
        .locator('input[name="user"]')
        .fill(process.env.E2E_ADMIN_USERNAME!);
      await page
        .locator('input[name="password"]')
        .fill(process.env.E2E_ADMIN_PASSWORD!);
      await page.locator('input[type="submit"]').click();
    } else {
      await page.locator('#username').fill(process.env.E2E_ADMIN_USERNAME!);
      await page.locator('#password').fill(process.env.E2E_ADMIN_PASSWORD!);
      await page.locator('#kc-login').click();
    }

    await expect(
      page.getByRole('heading', { name: 'Search', level: 1 }),
    ).toBeVisible({ timeout: 30000 });
  });

  test('rst-viewer can log in and reach the search page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.getByRole('button', { name: /log\s*in/i }).click();

    const idirLink = page.getByRole('link', { name: /idir/i });
    const isIdirVisible = await idirLink
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (isIdirVisible) {
      await idirLink.click();
      await page
        .locator('input[name="user"]')
        .fill(process.env.E2E_VIEWER_USERNAME!);
      await page
        .locator('input[name="password"]')
        .fill(process.env.E2E_VIEWER_PASSWORD!);
      await page.locator('input[type="submit"]').click();
    } else {
      await page.locator('#username').fill(process.env.E2E_VIEWER_USERNAME!);
      await page.locator('#password').fill(process.env.E2E_VIEWER_PASSWORD!);
      await page.locator('#kc-login').click();
    }

    await expect(
      page.getByRole('heading', { name: 'Search', level: 1 }),
    ).toBeVisible({ timeout: 30000 });
  });
});
