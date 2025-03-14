// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { expect, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';

export class LayoutPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyHeaderContent() {
    const header = this.page.locator('header');
    await expect(
      header.getByRole('link', { name: 'Find a recreation site or trail' }),
    ).toBeVisible();

    await expect(header.getByRole('link', { name: 'Contact' })).toBeVisible();
  }

  async verifyFooterContent() {
    const footer = this.page.locator('footer');
    await expect(
      footer.getByRole('link', { name: 'Disclaimer' }),
    ).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible();
    await expect(
      footer.getByRole('link', { name: 'Accessibility' }),
    ).toBeVisible();
    await expect(footer.getByRole('link', { name: 'Copyright' })).toBeVisible();
    await expect(
      footer.getByRole('link', { name: 'Contact us' }),
    ).toBeVisible();
  }

  async clickFindARecreationSiteOrTrail() {
    await this.page.click('header a[href="/search"]');

    await this.page.waitForNavigation();

    expect(this.page.url()).toBe(`${BASE_URL}/search`);
  }
}
