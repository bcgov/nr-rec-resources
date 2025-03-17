// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad, waitForNetworkResponse } from 'e2e/utils';
import { SearchEnum } from 'e2e/enum/search';
import { RecResource } from 'e2e/poms/pages/types';

export class SearchPOM {
  readonly page: Page;

  readonly url: string = `${BASE_URL}/search`;

  readonly initialResults: number = 38;

  readonly searchBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchBtn = page.getByRole('button', {
      name: SearchEnum.SEARCH_BTN_LABEL,
    });
  }

  async route(params?: string) {
    await this.page.goto(`${this.url}${params ? params : ''}`);
    await waitForImagesToLoad(this.page);
  }

  async getRecResourceCardCount() {
    return await this.page.locator('.rec-resource-card').count();
  }

  async resultsCount(results: number) {
    if (results === 0) {
      await this.page
        .getByText(SearchEnum.NO_RESULTS_LABEL)
        .waitFor({ state: 'visible' });
    } else {
      await this.page
        .getByText(`${results} Result${results > 1 ? 's' : ''}`)
        .waitFor({ state: 'visible' });
    }
  }

  async clickLoadMore(btnLabel?: string) {
    const loadMoreBtn = this.page.getByRole('button', {
      name: btnLabel ? btnLabel : SearchEnum.LOAD_MORE_LABEL,
    });
    await loadMoreBtn.waitFor({ state: 'visible' });
    const searchCardCount = await this.getRecResourceCardCount();
    await loadMoreBtn.click();
    await waitForNetworkResponse(this.page);
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.rec-resource-card');
    await this.page.waitForFunction((prevCount) => {
      const newCount = document.querySelectorAll('.rec-resource-card').length;
      return newCount > prevCount;
    }, searchCardCount);
  }

  async clickLoadPrevious() {
    await this.clickLoadMore(SearchEnum.LOAD_PREV_LABEL);
  }

  async verifyInitialResults() {
    await this.resultsCount(this.initialResults);
    await this.page
      .getByRole('heading', {
        name: '10 K Snowmobile Parking Lot',
      })
      .waitFor({ state: 'visible' });
    await this.page
      .getByRole('heading', {
        name: '10k Cabin',
      })
      .waitFor({ state: 'visible' });
  }

  async recResourceCardCount(count: number) {
    await expect(this.page.locator('.rec-resource-card')).toHaveCount(count);
  }

  async verifyRecResourceCardContent({
    rec_resource_id,
    rec_resource_name,
    rec_resource_type,
    closest_community,
    status,
  }: RecResource) {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('.rec-resource-card');
    const cardContainer = this.page.locator(`#${rec_resource_id}`);
    await cardContainer.waitFor({ state: 'attached' });
    await cardContainer.waitFor({ state: 'visible' });
    await cardContainer
      .getByText(rec_resource_name.toLowerCase())
      .waitFor({ state: 'visible' });
    await cardContainer
      .getByText(rec_resource_type)
      .waitFor({ state: 'visible' });
    await cardContainer
      .getByText(closest_community.toLowerCase())
      .waitFor({ state: 'visible' });
    await cardContainer.getByText(status).waitFor({ state: 'visible' });
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
}
