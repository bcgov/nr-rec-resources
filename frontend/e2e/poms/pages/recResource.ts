// https://playwright.dev/docs/pom

import { expect, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';
import { RecResource } from 'e2e/poms/pages/types';

const MAP_CANVAS_SELECTOR = '#map-container';

export class RecreationResourcePOM {
  readonly page: Page;

  readonly baseUrl: string = `${BASE_URL}/resource`;

  constructor(page: Page) {
    this.page = page;
  }

  async route(resourceId: string = 'REC203239') {
    await this.page.goto(`${this.baseUrl}/${resourceId}`);
    await waitForImagesToLoad(this.page);
  }

  async verifyRecResourceHeaderContent({
    rec_resource_id,
    rec_resource_name,
    rec_resource_type,
    closest_community,
    status,
  }: RecResource) {
    const recResourceHeader = this.page
      .locator('h1')
      .locator('..')
      .locator('..');

    const headerTitle = recResourceHeader.locator('h1');
    await recResourceHeader.waitFor({ state: 'visible' });
    await headerTitle.waitFor({ state: 'visible' });
    await expect(headerTitle).toHaveText(rec_resource_name);
    await expect(recResourceHeader).toContainText(rec_resource_type);
    await expect(recResourceHeader).toContainText(
      closest_community.toLowerCase(),
    );
    await expect(recResourceHeader).toContainText(rec_resource_id);

    if (status) {
      await expect(recResourceHeader).toContainText(status);
    }
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
  async removeRecreationResourceFeatureMap() {
    try {
      await this.page
        .locator(MAP_CANVAS_SELECTOR)
        .waitFor({ state: 'visible', timeout: 5000 });
      await this.page.evaluate((selector) => {
        document.querySelector(selector)?.remove();
      }, MAP_CANVAS_SELECTOR);
    } catch (error) {
      console.warn(`Map element not found: ${error}`);
    }
  }

  async verifyPdfDocLinks() {
    const pdfLink = this.page.getByRole('link', { name: /\[PDF\]/ });
    await expect(pdfLink).toHaveAttribute('href', /.*\.pdf$/);
  }
}
