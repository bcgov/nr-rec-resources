// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { SearchEnum } from 'e2e/enum/search';
import { waitForImagesToLoad } from 'e2e/utils';

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
      'Welcome to the new Recreation Sites and Trails BC beta site',
      'Find a recreation site or trail',
      'Human-centred, research-driven',
      'New interactive map coming soon',
      'About Recreation Sites and Trails BC',
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

    expect(this.page.url()).toBe(
      `${BASE_URL}/search${searchTerm ? `?filter=${searchTerm}` : ''}`,
    );
  }
}
