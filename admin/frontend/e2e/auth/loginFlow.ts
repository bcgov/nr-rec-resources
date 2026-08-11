import { setTimeout as sleep } from 'node:timers/promises';
import { expect, Page } from '@playwright/test';
import { authenticator } from 'otplib';
import { BASE_URL, E2E_TARGET } from 'e2e/constants';

/**
 * The local setup (docker-compose) uses a simple test login page: just a username
 * and password box on Keycloak's own page. There's no extra security code here.
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

// The box where you type the 6-digit code on Microsoft's "enter a code" screen. We
// use this both to notice we've reached that screen and to type the code into it.
const otpFieldSelector = 'input[name="otc"]';

// The "I can't use my Microsoft Authenticator app right now" link. Microsoft first
// asks you to approve the sign-in from your phone; clicking this link lets us switch
// to typing a code instead, which is the only part we can do automatically.
const switchToOtherMethodName =
  /can.?t use my Microsoft Authenticator app right now/i;

// The last 6-digit code we typed in. Each code only works once, and a new one is
// generated every 30 seconds — so if two logins happen close together they'd try
// the same code and Microsoft rejects the second one ("Sorry, we're having trouble
// verifying your account"). We remember the last code so we never send it twice.
let lastSubmittedTotp = '';

/**
 * Gives back a 6-digit code that's different from the last one we used. If the
 * current 30-second code is still the same as last time, it waits for the next one.
 */
async function nextUnusedTotp(secret: string): Promise<string> {
  while (authenticator.generate(secret) === lastSubmittedTotp) {
    await sleep((authenticator.timeRemaining() + 1) * 1000);
  }
  lastSubmittedTotp = authenticator.generate(secret);
  return lastSubmittedTotp;
}

/**
 * Gets us to Microsoft's "enter a code" screen, wherever the sign-in currently is:
 *   - on the "approve from your phone" screen → click the link to switch methods
 *   - on the list of verification options → click "Use a verification code"
 *   - already on the code screen → nothing to do
 *
 * The "Use a verification code" click sometimes doesn't take the first time:
 * Microsoft's page can bounce you straight back to the list if it hasn't finished
 * loading yet. So we keep clicking until the code box actually shows up.
 */
async function ensureCodeScreen(page: Page) {
  const otpField = page.locator(otpFieldSelector);
  if (await otpField.isVisible().catch(() => false)) return;

  const switchLink = page.getByRole('link', { name: switchToOtherMethodName });
  if (await switchLink.isVisible().catch(() => false)) {
    await switchLink.click();
  }

  const useCode = page.getByText(/use a verification code/i).first();
  await expect(async () => {
    if (await useCode.isVisible().catch(() => false)) {
      await useCode.click();
    }
    await expect(otpField).toBeVisible({ timeout: 4000 });
    await expect(useCode).toBeHidden({ timeout: 1000 });
  }).toPass({ timeout: 30000 });
}

/**
 * Handles the extra security step of the deployed login. This account always gets
 * asked for it, and it defaults to approving from a phone (which we can't do), so we
 * walk through the screens to type a code instead:
 *
 *   1. "Approve a request" → "I can't use my Microsoft Authenticator app right now"
 *   2. the list of options → "Use a verification code"
 *   3. type the 6-digit code → "Verify"
 *
 * If a code gets rejected (for example, another login just used the same one),
 * Microsoft sends us back to an earlier screen or shows an error — so we try the
 * whole thing again with a fresh code until the sign-in actually moves forward.
 */
async function submitMfaCode(page: Page) {
  const secret = process.env.E2E_ADMIN_TOTP_SECRET;
  if (!secret) {
    throw new Error(
      'E2E_ADMIN_TOTP_SECRET must be set to complete MFA against a deployed env',
    );
  }

  // The app's plain web address (like https://staff.dev.sitesandtrailsbc.ca).
  const appOrigin = new URL(BASE_URL).origin;
  const otpField = page.locator(otpFieldSelector);
  const verifyBtn = page.locator('#idSubmit_SAOTCC_Continue'); // the "Verify" button
  const kmsiHeading = page.getByRole('heading', { name: /stay signed in/i });

  await expect(async () => {
    await ensureCodeScreen(page);

    await otpField.fill(await nextUnusedTotp(secret));
    await verifyBtn.click();

    // We've gotten past the security step once we either see the "Stay signed in?"
    // screen or land back on the app. Each check is wrapped so that if one of them
    // times out it doesn't throw an error on its own.
    const advanced = await Promise.race([
      kmsiHeading
        .waitFor({ state: 'visible', timeout: 15000 })
        .then(() => true)
        .catch(() => false),
      page
        .waitForURL((u) => u.origin === appOrigin, { timeout: 15000 })
        .then(() => true)
        .catch(() => false),
    ]);
    expect(advanced).toBe(true);
  }).toPass({ timeout: 90000 });
}

/**
 * The deployed login. Clicking "Login" in our app hands straight off to Microsoft's
 * sign-in pages (there's no "pick your login type" screen in between). From there
 * it's the normal Microsoft flow: type email → Next → type password → Sign in, then
 * the extra security code (handled by submitMfaCode), then a "Stay signed in?"
 * screen, and finally back to our app.
 *
 * If Microsoft ever changes one of these screens and a step stops working, the
 * easiest way to see the real buttons is to record the flow with:
 *   npx playwright codegen <deployed-url> --headed
 */
async function loginViaIdir(page: Page, username: string, password: string) {
  // Type the email, then click Next.
  await page.locator('input[type="email"]').fill(username);
  await page.locator('#idSIButton9').click();

  // Type the password (Microsoft shows this on its own screen), then click Sign in.
  const passwordField = page.locator('input[type="password"]');
  await passwordField.waitFor({ state: 'visible' });
  await passwordField.fill(password);
  await page.locator('#idSIButton9').click();

  // We know we're back in our app when the page's web address matches the app's. We
  // compare just the base address because the login first tacks a bunch of extra
  // text onto the end of the URL and then cleans it up a moment later — comparing
  // the base address ignores all of that (and any trailing-slash differences).
  const appOrigin = new URL(BASE_URL).origin;
  const atApp = (url: URL) => url.origin === appOrigin;
  // The security step starts on the "approve from your phone" screen, so we look for
  // its switch link — the code box isn't on the page yet at this point.
  const mfaSwitchLink = page.getByRole('link', {
    name: switchToOtherMethodName,
  });
  const otpField = page.locator(otpFieldSelector);
  // The "Stay signed in?" screen. We find it by its heading text on purpose:
  // Microsoft reuses the same button names ("Back", and the main blue button) across
  // several screens, so matching a button directly could accidentally click "Back"
  // on an earlier screen and send us backwards.
  const kmsiHeading = page.getByRole('heading', { name: /stay signed in/i });

  // The deployed login always asks for the security code. Wait until we can tell
  // which screen we're on: the security screen, the code box, the "Stay signed in?"
  // screen, or straight back at the app (in case the security step ever gets turned
  // off) — so the test never just hangs.
  await Promise.race([
    mfaSwitchLink.waitFor({ state: 'visible' }).catch(() => {}),
    otpField.waitFor({ state: 'visible' }).catch(() => {}),
    kmsiHeading.waitFor({ state: 'visible' }).catch(() => {}),
    page.waitForURL(atApp).catch(() => {}),
  ]);

  const mfaShown =
    (await mfaSwitchLink.isVisible().catch(() => false)) ||
    (await otpField.isVisible().catch(() => false));
  if (mfaShown) {
    await submitMfaCode(page);
    // The "Stay signed in?" screen can show up after the security step.
    await kmsiHeading
      .waitFor({ state: 'visible', timeout: 15000 })
      .catch(() => {});
  }

  if (await kmsiHeading.isVisible().catch(() => false)) {
    // Click "Yes" (the main button on this screen) to continue to the app. We only
    // reach this when the "Stay signed in?" heading is showing, so it's safe.
    await page.locator('#idSIButton9').click();
  }

  // We're done once we're back on the app.
  await page.waitForURL(atApp);
}

/**
 * Opens the app and clicks "Login", then runs whichever sign-in flow applies: the
 * real Microsoft one when testing a deployed environment, or the simple local test
 * login otherwise. The caller is responsible for checking we actually landed in the
 * app afterwards (for example, by waiting for the "Search" heading).
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
