// https://playwright.dev/docs/pom

import { expect, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';

export class LayoutPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyHeaderContent() {
    const header = this.page.locator('header');
    const nav = header.locator('nav');
    await expect(
      nav.getByRole('link', { name: 'Find a site or trail' }),
    ).toBeVisible();
  }

  async verifyFooterContent() {
    const footer = this.page.locator('footer');
    [
      'Disclaimer',
      'Privacy',
      'Accessibility',
      'Copyright',
      'Closures',
      'Rules and etiquette',
      'Authorizations',
      'Partnering and volunteering',
      'Research opportunities',
      'ORV Trail Fund',
      'Contact us',
    ].forEach((link) => {
      expect(footer.getByRole('link', { name: link })).toBeVisible();
    });
  }

  async clickFindARecreationSiteOrTrail() {
    await this.page.click('header a[href="/search"]');
    expect(this.page.url()).toBe(`${BASE_URL}/search`);
  }
}
