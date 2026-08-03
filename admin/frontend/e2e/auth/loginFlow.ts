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

// Locator for the MFA one-time-code input on the IDIR/Azure AD challenge page.
// Used both to detect whether MFA was asked and, in submitMfaCode, to fill it.
// TODO: validate the selector against the real MFA page via `npx playwright codegen`.
const otpFieldSelector = 'input[name="otp"]';

/**
 * Fills the MFA (TOTP) one-time code on the IDIR/Azure AD challenge page.
 *
 * STUB: intentionally a no-op until the dedicated test IDIR account is created and
 * its TOTP secret is captured (stored as the E2E_ADMIN_TOTP_SECRET GitHub secret).
 * It is only ever called when the MFA prompt is actually shown (see loginViaIdir),
 * so running from a location that isn't challenged for MFA — e.g. Canada — never
 * reaches this and the empty body is harmless.
 *
 * The intended implementation (per Ayesha's note) generates the 6-digit code on
 * the fly with otplib and fills the form:
 *
 *   import { authenticator } from 'otplib';
 *   const code = authenticator.generate(process.env.E2E_ADMIN_TOTP_SECRET!);
 *   await page.locator(otpFieldSelector).fill(code);
 *   await page.locator('input[type="submit"]').click();
 */
async function submitMfaCode(_page: Page) {
  // no-op until the IDIR account + E2E_ADMIN_TOTP_SECRET exist
}

/**
 * Deployed BC Gov flow: clicking "Login" redirects to the loginproxy IDP chooser,
 * then to the IDIR sign-in page on a separate domain, and — depending on the origin
 * IP / device-trust policy — an optional Azure AD MFA challenge, before returning
 * to the app.
 *
 * NOTE: the selectors below still need to be validated against the real IDIR page
 * (e.g. via `npx playwright codegen <deployed-url>`) once a test account exists.
 */
async function loginViaIdir(page: Page, username: string, password: string) {
  // loginproxy IDP chooser → pick IDIR
  await page.getByRole('link', { name: /idir/i }).click();

  // IDIR sign-in page (separate domain). Rely on the field's auto-wait rather than
  // asserting an intermediate URL, so the flow is resilient to redirect-host changes.
  await page.locator('input[name="user"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[type="submit"]').click();

  // MFA is NOT guaranteed: Azure AD only challenges some origins (e.g. non-Canadian
  // IPs) and can skip it under "remember this device" / trusted-network policies.
  // Race the two possible outcomes and only handle MFA if the prompt actually shows,
  // so the same path works whether or not MFA is asked.
  const appUrl = `${BASE_URL}/**`;
  const otpField = page.locator(otpFieldSelector);
  await Promise.race([
    otpField.waitFor({ state: 'visible' }).catch(() => {}),
    page.waitForURL(appUrl).catch(() => {}),
  ]);

  if (await otpField.isVisible().catch(() => false)) {
    await submitMfaCode(page);
  }

  // Back to the app origin once auth completes.
  await page.waitForURL(appUrl);
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
