// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { expect, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';
import { RecResource } from 'e2e/poms/pages/types';

const MAP_CANVAS_SELECTOR = '#map-container';
const REC_DOC_LINKS: { role: 'link'; name: string }[] = [
  {
    role: 'link',
    name: 'Blue Lake Trail Map [PDF]',
  },
  {
    role: 'link',
    name: 'Morchuea Lake Map [PDF]',
  },
];

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
    const headerText = await recResourceHeader.textContent();
    expect(await recResourceHeader.locator('h1').textContent()).toBe(
      rec_resource_name.toLowerCase(),
    );
    expect(headerText).toContain(rec_resource_type);
    expect(headerText).toContain(closest_community.toLowerCase());
    expect(headerText).toContain(status);
    expect(headerText).toContain(rec_resource_id);
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
    for (const exp of REC_DOC_LINKS) {
      expect(this.page.getByRole(exp.role, { name: exp.name })).toHaveAttribute(
        'href',
        expect.stringMatching(/^https:\/\/.*\.pdf$/),
      );
    }
  }
}
