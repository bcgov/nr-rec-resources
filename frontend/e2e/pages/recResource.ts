import { expect } from '@playwright/test';
import { baseURL } from 'e2e/utils';
import type { Page } from 'playwright';

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
const removeRecreationResourceFeatureMap = async (page: Page) => {
  const MAP_CANVAS_SELECTOR = '#map-container';

  await page.locator(MAP_CANVAS_SELECTOR).waitFor({ state: 'visible' });

  await page.evaluate((selector) => {
    const canvas = document.querySelector(selector) as HTMLCanvasElement;
    if (canvas) {
      canvas.remove();
    }
  }, MAP_CANVAS_SELECTOR);
};

export const recResourcePage = async (page: Page) => {
  const url = `${baseURL}/resource/REC160773/`;
  await page.goto(url);

  await removeRecreationResourceFeatureMap(page);

  // Verify dynamic content loads
  await expect(
    page.getByRole('heading', {
      name: '10k Cabin',
    }),
  ).toBeVisible();
};
