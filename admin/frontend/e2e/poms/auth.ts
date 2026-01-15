// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';

export class AuthPOM {
  private readonly EMAIL_DOMAIN = '@gov.bc.ca';

  readonly page: Page;

  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.loginButton = page.getByRole('button', { name: 'Login' });
  }

  private getAdminCredentials() {
    const user = process.env.E2E_TEST_ADMIN_USER;
    const password = process.env.E2E_TEST_ADMIN_PASSWORD;
    const email = user ? `${user}${this.EMAIL_DOMAIN}` : undefined;
    return { email, password };
  }

  private getViewerCredentials() {
    const user = process.env.E2E_TEST_VIEWER_USER;
    const password = process.env.E2E_TEST_VIEWER_PASSWORD;
    const email = user ? `${user}${this.EMAIL_DOMAIN}` : undefined;
    return { email, password };
  }

  private getEmailInput() {
    return this.page.getByPlaceholder('Email, phone, or Skype');
  }

  private getPasswordInput() {
    return this.page.getByPlaceholder('Password');
  }

  async clickLoginButton() {
    await this.loginButton.waitFor({ state: 'visible' });
    await this.loginButton.click();
  }

  async enterEmail(email: string) {
    const emailInput = this.getEmailInput();
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.fill(email);
  }

  async clickNextButton() {
    await this.page.getByRole('button', { name: 'Next' }).click();
  }

  async enterPassword(password: string) {
    const passwordInput = this.getPasswordInput();
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);
  }

  async clickSignInButton() {
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async handleStaySignedInPrompt() {
    const noButton = this.page.getByRole('button', { name: 'No' });
    // Wait briefly for the prompt to appear, but don't fail if it doesn't
    try {
      await noButton.waitFor({ state: 'visible', timeout: 5000 });
      await noButton.click();
    } catch {
      // Prompt didn't appear, continue
    }
  }

  async performMicrosoftLogin(email: string, password: string) {
    await this.enterEmail(email);
    await this.clickNextButton();

    await this.enterPassword(password);
    await this.clickSignInButton();

    await this.handleStaySignedInPrompt();

    await this.page.waitForURL(
      (url) => !url.hostname.includes('login.microsoftonline.com'),
      {
        timeout: 30000,
      },
    );
  }

  async loginAsAdmin() {
    const { email, password } = this.getAdminCredentials();

    if (!email || !password) {
      throw new Error(
        'E2E_TEST_ADMIN_USER and E2E_TEST_ADMIN_PASSWORD environment variables must be set',
      );
    }

    await this.clickLoginButton();
    await this.performMicrosoftLogin(email, password);
  }

  async loginAsViewer() {
    const { email, password } = this.getViewerCredentials();

    if (!email || !password) {
      throw new Error(
        'E2E_TEST_VIEWER_USER and E2E_TEST_VIEWER_PASSWORD environment variables must be set',
      );
    }

    await this.clickLoginButton();
    await this.performMicrosoftLogin(email, password);
  }

  async verifyLoggedIn() {
    await expect(this.loginButton).not.toBeVisible();
  }

  async verifyLoggedOut() {
    await expect(this.loginButton).toBeVisible();
  }
}
