// https://playwright.dev/docs/pom

import { expect, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from '@shared/e2e/utils';

export class AlphabeticalListPOM {
  readonly page: Page;

  readonly url: string = `${BASE_URL}/search/a-z-list`;

  constructor(page: Page) {
    this.page = page;
  }

  async route() {
    await this.page.goto(this.url);
    await waitForImagesToLoad(this.page);
  }

  async verifyAlphabeticalListPageContent() {
    await expect(
      this.page.getByRole('heading', { name: 'A-Z list' }),
    ).toBeVisible();

    expect(this.page.url()).toContain('letter=%23');

    await expect(
      this.page.getByTestId('breadcrumbs').getByRole('link', { name: 'Home' }),
    ).toBeVisible();

    await expect(
      this.page
        .getByTestId('breadcrumbs')
        .getByRole('link', { name: 'Find a site or trail' }),
    ).toBeVisible();

    await expect(
      this.page
        .locator('[data-testid="alphabetical-navigation"]')
        .or(this.page.locator('.alphabetical-navigation').first()),
    ).toBeVisible();

    await expect(
      this.page
        .locator('.alphabetical-resource-list')
        .or(this.page.locator('[data-testid="alphabetical-list"]')),
    ).toBeVisible();
  }

  async verifyAlphabeticalNavigation() {
    const navigationContainer = this.page
      .locator('.alphabetical-navigation')
      .first();
    await expect(navigationContainer).toBeVisible();

    await expect(
      navigationContainer.getByRole('button', { name: '#' }),
    ).toBeVisible();
    await expect(
      navigationContainer.getByRole('button', { name: 'A' }),
    ).toBeVisible();
    await expect(
      navigationContainer.getByRole('button', { name: 'B' }),
    ).toBeVisible();
  }
}
