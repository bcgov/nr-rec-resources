// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { expect, Locator, Page } from '@playwright/test';
import happoPlaywright from 'happo-playwright';
import { analyzeAccessibility } from 'e2e/utils';
import { BASE_URL } from 'e2e/constants';

export class UtilsPOM {
  readonly page: Page;

  readonly pageContent: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageContent = page.locator('html');
  }

  async clickLinkByText(text: string) {
    const link = this.page.locator(`a:has-text("${text}")`);
    const href = await link.getAttribute('href');
    await link.click();

    await this.page.waitForNavigation();
    expect(this.page.url()).toBe(`${BASE_URL}${href}`);
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
}
