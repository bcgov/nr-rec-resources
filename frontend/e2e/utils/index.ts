import { expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

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
