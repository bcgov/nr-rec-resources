import { expect, Page, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import happoPlaywright from 'happo-playwright';

export const initHappo = async () => {
  test.beforeAll(async () => {
    await happoPlaywright.init();
  });

  test.afterAll(async () => {
    await happoPlaywright.finish();
  });
};

export const analyzeAccessibility = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({
    page,
  }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
};

export const waitForImagesToLoad = async (page: Page) => {
  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every((img) => img.complete);
  });
};

export const waitForNetworkRequest = async (page: Page, url: string) => {
  await page.waitForRequest((request) => request.url().includes(url));
};

export const waitForNetworkResponse = async (page: Page, statusCode = 200) => {
  await page.waitForResponse((response) => response.status() === statusCode);
};

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
export const removeVectorFeatureMap = async () => {
  const canvas = this.page.locator(MAP_CANVAS_SELECTOR);
  if ((await canvas.count()) > 0) {
    await this.page.evaluate((selector) => {
      document.querySelector(selector)?.remove();
    }, MAP_CANVAS_SELECTOR);
  }
};
