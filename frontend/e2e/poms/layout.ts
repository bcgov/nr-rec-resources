// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { expect, Locator, Page } from '@playwright/test';
import happoPlaywright from 'happo-playwright';
import { analyzeAccessibility } from 'e2e/utils';
import { BASE_URL } from 'e2e/constants';

export class LayoutPOM {
  readonly page: Page;

  readonly pageContent: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageContent = page.locator('html');
  }

  async accessibility() {
    await analyzeAccessibility(this.page);
  }

  async screenshot(component: string, variant: string) {
    await happoPlaywright.screenshot(this.page, this.pageContent, {
      component,
      variant,
    });
  }

  async verifyHeader() {
    const header = this.page.locator('header');
    await expect(
      header.getByRole('link', { name: 'Find a recreation site or trail' }),
    ).toBeVisible();

    await expect(header.getByRole('link', { name: 'Contact' })).toBeVisible();
  }

  async verifyFooter() {
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
