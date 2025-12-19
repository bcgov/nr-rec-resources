// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { SearchEnum } from 'e2e/enum/search';
import { waitForImagesToLoad } from '@shared/e2e/utils';

export class LandingPOM {
  readonly page: Page;

  readonly url: string = BASE_URL;

  readonly searchBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchBtn = page.getByRole('button', {
      name: SearchEnum.SEARCH_BTN_LABEL,
      exact: true,
    });
  }

  async route() {
    await this.page.goto(this.url);
    await waitForImagesToLoad(this.page);
  }

  async verifyLandingPageContent() {
    [
      'Enjoy BC outdoor recreation',
      'Find sites and trails by activity',
      'Partnering and volunteering',
    ].forEach(async (heading) => {
      await expect(
        this.page.getByRole('heading', { name: heading }),
      ).toBeVisible();
    });
  }

  async searchFor(searchTerm?: string) {
    const input = this.page.getByPlaceholder(SearchEnum.PLACEHOLDER);

    if (searchTerm) {
      await input.fill(searchTerm);
    }

    await this.searchBtn.click();

    const url = new URL(this.page.url());
    if (searchTerm) {
      expect(url.searchParams.get('filter')).toBe(searchTerm);
    } else {
      expect(url.searchParams.has('filter')).toBe(false);
    }
  }
}
