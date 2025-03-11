// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { Page, expect } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';

export class SearchPOM {
  readonly page: Page;

  readonly url: string = `${BASE_URL}/search/`;

  readonly initialResults: number = 38;

  constructor(page: Page) {
    this.page = page;
  }

  async route() {
    await this.page.goto(this.url);
    await waitForImagesToLoad(this.page);
  }

  async resultsCount(results: number) {
    await expect(this.page.getByText(`${results} Results`)).toBeVisible();
  }

  async verifyInitialResults() {
    await this.resultsCount(this.initialResults);
    await expect(
      this.page.getByRole('heading', {
        name: '10 K Snowmobile Parking Lot',
      }),
    ).toBeVisible();

    await expect(
      this.page.getByRole('heading', {
        name: '10k Cabin',
      }),
    ).toBeVisible();
  }

  async verifyInitialFilterMenu() {
    await expect(this.page.getByText('Filter')).toBeVisible();
    await expect(this.page.getByText('District')).toBeVisible();
  }
}
