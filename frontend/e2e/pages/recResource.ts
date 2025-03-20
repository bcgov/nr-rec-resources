import { expect } from '@playwright/test';
import { baseURL } from 'e2e/utils';
import type { Page } from 'playwright';

// constants
const MAP_CANVAS_SELECTOR = '#map-container';
const REC_DOC_LINKS = [
  {
    role: 'link',
    name: 'Blue Lake Trail Map [PDF]',
  },
  {
    role: 'link',
    name: 'Morchuea Lake Map [PDF]',
  },
];

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
  try {
    await page
      .locator(MAP_CANVAS_SELECTOR)
      .waitFor({ state: 'visible', timeout: 5000 });
    await page.evaluate((selector) => {
      document.querySelector(selector)?.remove();
    }, MAP_CANVAS_SELECTOR);
  } catch (error) {
    console.warn(`Map element not found: ${error}`);
  }
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

  // verify the doc links are valid pdf links
  for (const exp of REC_DOC_LINKS) {
    await expect(page.getByRole('link', { name: exp.name })).toHaveAttribute(
      'href',
      expect.stringMatching(/^https:\/\/.*\.pdf$/),
    );
  }
};
