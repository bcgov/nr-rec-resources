import { Page } from '@playwright/test';
import { BASE_URL, E2E_TARGET } from 'e2e/constants';

/**
 * Local docker-compose Keycloak shows a plain username/password form on the same
 * Keycloak origin.
 */
async function loginViaLocalForm(
  page: Page,
  username: string,
  password: string,
) {
  await page.locator('#username').fill(username);
  await page.locator('#password').fill(password);
  await page.locator('#kc-login').click();
}

/**
 * Deployed BC Gov flow: clicking "Login" redirects to the loginproxy IDP chooser,
 * then to the IDIR sign-in page on a separate domain, then back to the app.
 *
 * NOTE: this is a STARTING POINT only. The selectors below have NOT been validated
 * against the real IDIR page, and MFA / "stay signed in" interstitials are not
 * handled. The deployed-env branch must verify the selectors (e.g. via
 * `npx playwright codegen <deployed-url>`), add explicit `waitForURL` hops, and
 * decide an MFA strategy before enabling admin e2e against a deployed environment.
 */
async function loginViaIdir(page: Page, username: string, password: string) {
  await page.getByRole('link', { name: /idir/i }).click();
  await page.locator('input[name="user"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[type="submit"]').click();
}

/**
 * Navigates to the app and drives the login UI up to the point where the
 * authenticated app loads. Branches on E2E_TARGET so the deployed flow can be
 * implemented entirely inside `loginViaIdir` without touching the local path or
 * any call site.
 *
 * Callers are responsible for asserting/waiting on the post-login state
 * (e.g. the Search heading).
 */
export async function performLogin(
  page: Page,
  username: string,
  password: string,
) {
  await page.goto(BASE_URL);
  await page.getByRole('button', { name: /log\s*in/i }).click();

  if (E2E_TARGET === 'deployed') {
    await loginViaIdir(page, username, password);
  } else {
    await loginViaLocalForm(page, username, password);
  }
}
