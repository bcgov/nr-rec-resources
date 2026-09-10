import { test, expect } from '@playwright/test';
import { BASE_URL, E2E_TARGET } from 'e2e/constants';
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
    // Local only. On deployed, auth/setup.ts already performs this exact login
    // (incl. MFA) as the suite's single real login; re-driving it here once per
    // browser project would reuse TOTP codes within the same 30s window and be
    // rejected. Local Keycloak has no MFA, so per-browser logins are cheap and safe.
    test.skip(
      E2E_TARGET === 'deployed',
      'deployed login is covered once by auth/setup.ts to avoid TOTP reuse',
    );

    await performLogin(
      page,
      process.env.E2E_ADMIN_USERNAME!,
      process.env.E2E_ADMIN_PASSWORD!,
    );

    await expect(
      page.getByRole('heading', { name: 'Search', level: 1 }),
    ).toBeVisible({ timeout: 30000 });
  });
});
