// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';

export class RecreationResourcePOM {
  readonly page: Page;

  readonly baseUrl: string = `${BASE_URL}/resource`;

  constructor(page: Page) {
    this.page = page;
  }

  async route(resourceId: string = 'REC204117') {
    await this.page.goto(`${this.baseUrl}/${resourceId}`);
    await waitForImagesToLoad(this.page);
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
    const MAP_CANVAS_SELECTOR = '#map-container';

    await this.page.locator(MAP_CANVAS_SELECTOR).waitFor({ state: 'visible' });

    await this.page.evaluate((selector) => {
      const canvas = document.querySelector(selector) as HTMLCanvasElement;
      if (canvas) {
        canvas.remove();
      }
    }, MAP_CANVAS_SELECTOR);
  }
}
