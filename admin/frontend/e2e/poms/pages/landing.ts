// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { SearchEnum } from 'e2e/enum/search';
import { waitForImagesToLoad } from '@shared/e2e/utils';

export class LandingPOM {
  readonly page: Page;

  readonly url: string = BASE_URL;

  readonly searchInput: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchInput = page.getByPlaceholder(SearchEnum.PLACEHOLDER);
  }

  async route() {
    await this.page.goto(this.url);
    await waitForImagesToLoad(this.page);
  }

  async verifyLandingPageContent() {
    await expect(
      this.page.getByText('Search by resource name or number'),
    ).toBeVisible();
  }

  async verifyLandingPageContentMobile() {
    await expect(this.page.getByText('Search by name or number')).toBeVisible();
  }

  async searchFor(searchTerm?: string) {
    const input = this.page.getByPlaceholder(SearchEnum.PLACEHOLDER);
    if (searchTerm) {
      await input.fill(searchTerm);
    }
  }
}
