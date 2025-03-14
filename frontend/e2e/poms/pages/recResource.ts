// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { expect, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';
import { RecResource } from 'e2e/poms/pages/types';

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
    await this.page.waitForLoadState('networkidle');
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

  async VerifyRecResourceSections() {
    const sections = this.page.locator('.resource-section');
    await sections.waitFor({ state: 'visible' });
    expect(await sections.count()).toBe(3);
  }
}
