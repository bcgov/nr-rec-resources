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

export const analyzeAccessibility = async (
  page: Page,
  disabledRules: string[] = [],
) => {
  let builder = new AxeBuilder({ page });
  if (disabledRules.length) builder = builder.disableRules(disabledRules);
  const accessibilityScanResults = await builder.analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
};

export const waitForImagesToLoad = async (page: Page, timeoutMs = 5000) => {
  // Bounded poll: return once every image reports `complete`, but never hang the
  // whole test if an asset is lazy-loaded below the fold or its host is slow /
  // unreachable (broken images set `complete = true`, so this only waits on
  // genuinely in-flight loads).
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const allLoaded = await page.evaluate(() =>
      Array.from(document.images).every((img) => img.complete),
    );
    if (allLoaded) return;
    await page.waitForTimeout(100);
  }
};

export const waitForNetworkRequest = async (page: Page, url: string) => {
  await page.waitForRequest((request) => request.url().includes(url));
};

export const waitForNetworkResponse = async (page: Page, statusCode = 200) => {
  await page.waitForResponse((response) => response.status() === statusCode);
};
