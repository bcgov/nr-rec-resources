// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import happoPlaywright from 'happo-playwright';
import {
  analyzeAccessibility,
  waitForNetworkRequest,
  waitForNetworkResponse,
} from 'e2e/utils';
import { BASE_URL, MAP_CANVAS_SELECTOR } from 'e2e/constants';

export class UtilsPOM {
  readonly page: Page;

  readonly pageContent: Locator;

  constructor(page: Page) {
    this.page = page;

    this.pageContent = page.locator('html');
  }

  async checkExpectedUrlParams(expectedParams: string) {
    await this.page.waitForFunction(
      (expected) =>
        new URL(window.location.href).searchParams
          .toString()
          .includes(expected),
      expectedParams,
    );
  }

  async clickLinkByText(text: string) {
    const link = this.page
      .locator(`a:has-text("${text}")`)
      .filter({ hasText: text, hasNotText: '', visible: true });
    const href = await link.getAttribute('href');
    await link.click();

    await this.page.waitForURL(`${BASE_URL}${href}`);
    expect(this.page.url()).toBe(`${BASE_URL}${href}`);
  }

  async accessibility() {
    await analyzeAccessibility(this.page);
  }

  async screenshot(component: string, variant: string) {
    // Remove the map canvas element if it exists as it breaks Happo
    await this.removeVectorFeatureMap();
    await happoPlaywright.screenshot(this.page, this.pageContent, {
      component,
      variant,
    });
  }

  async waitForNetworkRequest(url: string) {
    await waitForNetworkRequest(this.page, url);
  }

  async waitForNetworkResponse(statusCode?: number) {
    await waitForNetworkResponse(this.page, statusCode);
  }

  async waitForNetwork(url: string, statusCode?: number) {
    await this.waitForNetworkRequest(url);
    await this.waitForNetworkResponse(statusCode);
  }

  /**
   * Remove the map canvas element
   *
   * @remarks
   * Happo e2e automatically converts canvas elements to inline img elements
   * with a URL that looks like  "_inlined/...png" without actually creating
   * the file in the directory. When the tests are done, it then tries to
   * package every URL in the asset bundle for the test review page and tries to
   * resolve this non-existent url which ends up throwing the error.
   */
  async removeVectorFeatureMap() {
    const canvas = this.page.locator(MAP_CANVAS_SELECTOR);
    if ((await canvas.count()) > 0) {
      await this.page.evaluate((selector) => {
        document.querySelector(selector)?.remove();
      }, MAP_CANVAS_SELECTOR);
    }
  }
}
