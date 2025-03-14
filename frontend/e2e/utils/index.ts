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
