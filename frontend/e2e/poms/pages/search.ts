// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';
import { SearchEnum } from 'e2e/enum/search';
import { RecResource } from 'e2e/poms/pages/types';

export class SearchPOM {
  readonly page: Page;

  readonly url: string = `${BASE_URL}/search`;

  readonly searchBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchBtn = page.getByRole('button', {
      name: SearchEnum.SEARCH_BTN_LABEL,
      exact: true,
    });
  }

  async route(params?: string) {
    await this.page.goto(`${this.url}${params ? params : ''}`);
    await waitForImagesToLoad(this.page);
  }

  async getRecResourceCardCount() {
    return await this.page.locator('.rec-resource-card').count();
  }

  async clickLoadMore(btnLabel?: string) {
    const loadMoreBtn = this.page.getByRole('button', {
      name: btnLabel ? btnLabel : SearchEnum.LOAD_MORE_LABEL,
    });
    await loadMoreBtn.waitFor({ state: 'visible' });
    const searchCardCount = await this.getRecResourceCardCount();
    await loadMoreBtn.click();
    // await this.page.waitForResponse((response) => {
    //   return response.status() === 200;
    // });
    await this.page.waitForSelector('.rec-resource-card');
    await this.page.waitForFunction((prevCount) => {
      const newCount = document.querySelectorAll('.rec-resource-card').length;
      return newCount > prevCount;
    }, searchCardCount);
  }

  async clickLoadPrevious() {
    await this.clickLoadMore(SearchEnum.LOAD_PREV_LABEL);
  }

  async recResourceCardCount(count: number) {
    await expect(this.page.locator('.rec-resource-card')).toHaveCount(count);
  }

  async waitForResults() {
    await this.page.getByText(/result/i).waitFor({ state: 'visible' });

    const cards = this.page.locator('.rec-resource-card');
    expect(await cards.count()).toBeGreaterThan(0);
  }

  async waitForNoResults() {
    await this.page
      .getByText(SearchEnum.NO_RESULTS_LABEL)
      .waitFor({ state: 'visible' });
    await expect(this.page.locator('.rec-resource-card')).not.toBeVisible();
  }

  async verifyInitialResults() {
    await this.waitForResults();
    await this.recResourceCardCount(10);
  }

  async verifyRecResourceCardContent({
    rec_resource_id,
    rec_resource_name,
    rec_resource_type,
    closest_community,
    status,
  }: RecResource) {
    // await this.page.waitForResponse((response) => {
    //   return response.status() === 200;
    // });
    await this.page.waitForSelector('.rec-resource-card');
    const cardContainer = this.page.locator(`#${rec_resource_id}`);
    await cardContainer.waitFor({ state: 'attached' });
    await cardContainer.waitFor({ state: 'visible' });
    await cardContainer
      .getByText(rec_resource_name)
      .waitFor({ state: 'visible' });
    await cardContainer
      .getByText(rec_resource_type)
      .waitFor({ state: 'visible' });
    await cardContainer
      .getByText(closest_community.toLowerCase())
      .waitFor({ state: 'visible' });
    if (status) {
      await cardContainer.getByText(status).waitFor({ state: 'visible' });
    }
  }

  // Pass false to expectResults if testing for no results
  async searchFor(searchTerm: string, expectResults: boolean = true) {
    const input = this.page.locator(
      `input[placeholder = "${SearchEnum.PLACEHOLDER}"]`,
    );
    await expect(input).toBeVisible();
    await input.fill(searchTerm);
    await input.press('Enter');
    await this.searchBtn.waitFor({ state: 'visible' });
    await this.searchBtn.click();
    if (expectResults) {
      await this.page.waitForSelector('.rec-resource-card');
    }
  }

  async verifySearchResults(searchTerm: string) {
    const searchResults = this.page.locator('.rec-resource-card');
    await searchResults.first().waitFor({ state: 'visible' });

    const count = await searchResults.count();
    for (let i = 0; i < count; i++) {
      const card = searchResults.nth(i);
      const cardText = await card.textContent();
      expect(cardText).toContain(searchTerm);
    }
  }
}
