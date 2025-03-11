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
}
