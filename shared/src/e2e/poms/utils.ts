import { expect, Locator, Page } from "@playwright/test";
import happoPlaywright from "happo-playwright";
import {
  analyzeAccessibility,
  waitForNetworkRequest,
  waitForNetworkResponse,
} from "@shared/e2e/utils";
import { MAP_CANVAS_SELECTOR } from "@shared/e2e/constants";

export class UtilsPOM {
  readonly page: Page;
  readonly pageContent: Locator;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = (page.context() as any)._options.baseURL ?? "";
    this.pageContent = page.locator("html");
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
      .filter({ hasText: text, hasNotText: "", visible: true });
    const href = await link.getAttribute("href");
    await link.click();

    await this.page.waitForURL(`${this.baseUrl}${href}`);
    expect(this.page.url()).toBe(`${this.baseUrl}${href}`);
  }

  async accessibility() {
    await analyzeAccessibility(this.page);
  }

  async screenshot(component: string, variant: string) {
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

  async removeVectorFeatureMap() {
    const canvas = this.page.locator(MAP_CANVAS_SELECTOR);
    if ((await canvas.count()) > 0) {
      await this.page.evaluate((selector) => {
        document.querySelector(selector)?.remove();
      }, MAP_CANVAS_SELECTOR);
    }
  }
}
