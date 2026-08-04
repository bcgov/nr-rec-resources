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

// Microsoft Entra (Azure AD) one-time-code input on the TOTP challenge page.
// Used both to detect whether MFA was asked and, in submitMfaCode, to fill it.
// (Entra uses name="otc" / id="idTxtBx_SAOTCC_OTC" for the authenticator code.)
const otpFieldSelector = 'input[name="otc"]';

/**
 * Fills the MFA (TOTP) one-time code on the Microsoft Entra challenge page.
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
 *   await page.locator('#idSubmit_SAOTCC_Continue').click(); // "Verify"
 */
async function submitMfaCode(_page: Page) {
  // no-op until the IDIR account + E2E_ADMIN_TOTP_SECRET exist
}

/**
 * Deployed BC Gov flow: clicking "Login" hands off to the app's Keycloak, which
 * brokers straight to Microsoft Entra (Azure AD) — there is NO loginproxy "pick
 * IDIR" chooser; the browser lands directly on login.microsoftonline.com. This
 * drives the standard Entra sign-in: email → Next → password → Sign in, then an
 * OPTIONAL MFA challenge and an OPTIONAL "Stay signed in?" (KMSI) prompt, before
 * redirecting back to the app.
 *
 * NOTE: Entra's markup is stable but this hasn't been run green end-to-end yet —
 * if a step drifts, confirm with `npx playwright codegen <deployed-url> --headed`.
 * Federated/branded tenants can vary the email→password transition.
 */
async function loginViaIdir(page: Page, username: string, password: string) {
  // Email step
  await page.locator('input[type="email"]').fill(username);
  await page.locator('#idSIButton9').click(); // "Next"

  // Password step (Entra renders it as a separate view)
  const passwordField = page.locator('input[type="password"]');
  await passwordField.waitFor({ state: 'visible' });
  await passwordField.fill(password);
  await page.locator('#idSIButton9').click(); // "Sign in"

  const appUrl = `${BASE_URL}/**`;
  const otpField = page.locator(otpFieldSelector);
  // "Stay signed in?" prompt: the "No" button (#idBtn_Back) is unique to KMSI,
  // unlike the primary #idSIButton9 which Entra reuses across every view.
  const kmsiNo = page.locator('#idBtn_Back');

  // After the password, MFA is NOT guaranteed (Entra only challenges some origins,
  // e.g. non-Canadian IPs, and can skip it under trusted-device policies) and the
  // KMSI prompt may or may not appear. Race all outcomes so the same path works
  // whether or not either is shown.
  await Promise.race([
    otpField.waitFor({ state: 'visible' }).catch(() => {}),
    kmsiNo.waitFor({ state: 'visible' }).catch(() => {}),
    page.waitForURL(appUrl).catch(() => {}),
  ]);

  if (await otpField.isVisible().catch(() => false)) {
    await submitMfaCode(page);
    // KMSI can surface after MFA completes.
    await kmsiNo.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  }

  if (await kmsiNo.isVisible().catch(() => false)) {
    await kmsiNo.click(); // "No" — complete sign-in without a persistent cookie
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
