// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';
import { FilterEnum } from 'e2e/enum/filter';
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

  async clickLoadMore(btnLabel?: string) {
    const loadMoreBtn = this.page.getByRole('button', {
      name: btnLabel ? btnLabel : SearchEnum.LOAD_MORE_LABEL,
    });
    const searchCardCount = await this.getRecResourceCardCount();
    await loadMoreBtn.click();
    await this.page.waitForResponse((response) => response.status() === 200);

    expect(await this.getRecResourceCardCount()).toBeGreaterThan(
      searchCardCount,
    );
  }

  async clickLoadPrevious() {
    await this.clickLoadMore(SearchEnum.LOAD_PREV_LABEL);
  }

  async resultsCount(results: number) {
    if (results === 0) {
      await expect(
        this.page.getByText(SearchEnum.NO_RESULTS_LABEL),
      ).toBeVisible();
    } else {
      await expect(
        this.page.getByText(`${results} Result${results > 1 ? 's' : ''}`),
      ).toBeVisible();
    }
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

  async verifyRecResourceCardCount(count: number) {
    await expect(this.page.locator('.rec-resource-card')).toHaveCount(count);
  }

  async verifyRecResourceCardContent({
    rec_resource_id,
    rec_resource_name,
    rec_resource_type,
    closest_community,
    status,
  }: RecResource) {
    const cardContainer = this.page.locator(`#${rec_resource_id} `);
    const cardText = await cardContainer.textContent();
    expect(cardText).toContain(rec_resource_name.toLowerCase());
    expect(cardText).toContain(rec_resource_type);
    expect(cardText).toContain(closest_community.toLowerCase());
    expect(cardText).toContain(status);
  }

  async searchFor(searchTerm: string) {
    const input = this.page.locator(
      `input[placeholder = "${SearchEnum.PLACEHOLDER}"]`,
    );
    await input.fill(searchTerm);
    await this.searchBtn.click();

    const searchingLabel = this.page.getByText(SearchEnum.SEARCHING_LABEL);

    await expect(searchingLabel).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: FilterEnum.CLEAR_FILTER_LABEL }),
    ).toBeVisible();
    await expect(searchingLabel).not.toBeVisible();
  }
}
