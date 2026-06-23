import { test, expect } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { performLogin } from 'e2e/auth/loginFlow';

// Explicitly unauthenticated — drives the real login UI rather than restoring session state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication flow', () => {
  test('unauthenticated user sees login page', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByText('Welcome to RecSpace')).toBeVisible();
    await expect(page.getByRole('button', { name: /log\s*in/i })).toBeVisible();
  });

  test('rst-admin can log in and reach the search page', async ({ page }) => {
    await performLogin(
      page,
      process.env.E2E_ADMIN_USERNAME!,
      process.env.E2E_ADMIN_PASSWORD!,
    );

    await expect(
      page.getByRole('heading', { name: 'Search', level: 1 }),
    ).toBeVisible({ timeout: 30000 });
  });

  test('rst-viewer can log in and reach the search page', async ({ page }) => {
    await performLogin(
      page,
      process.env.E2E_VIEWER_USERNAME!,
      process.env.E2E_VIEWER_PASSWORD!,
    );

    await expect(
      page.getByRole('heading', { name: 'Search', level: 1 }),
    ).toBeVisible({ timeout: 30000 });
  });
});
