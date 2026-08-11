// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import {
  accessTypeFilterOptions,
  facilitiesFilterOptions,
  feesFilterOptions,
  statusFilterOptions,
  thingsToDoFilterOptions,
  typeFilterOptions,
} from 'e2e/data/filters';
import { FilterEnum, FilterGroup } from 'e2e/enum/filter';

export class FilterPOM {
  readonly page: Page;

  readonly districtFilters: Locator;

  readonly typeFilters: Locator;

  readonly thingsToDoFilters: Locator;

  readonly facilitiesFilters: Locator;

  readonly accessTypeFilters: Locator;

  readonly statusFilters: Locator;

  readonly feesFilters: Locator;

  constructor(page: Page) {
    this.page = page;

    this.districtFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.DISTRICT });

    this.typeFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.TYPE })
      .first();

    this.thingsToDoFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.THINGS_TO_DO });

    this.facilitiesFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.FACILITIES });

    this.accessTypeFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.ACCESS_TYPE })
      .first();

    this.statusFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.STATUS });

    this.feesFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.FEES })
      .first();
  }

  async clickClearFilters() {
    const clearFiltersButton = this.page.getByRole('button', {
      name: FilterEnum.CLEAR_FILTER_LABEL,
    });
    await clearFiltersButton.click();
  }

  async clickShowLessFilters(filterGroup: Locator) {
    const showLessButton = filterGroup.getByRole('button', {
      name: /Show less/,
    });
    await showLessButton.waitFor({ state: 'visible', timeout: 10000 });
    await showLessButton.click();
  }

  async clickShowAllFilters(filterGroup: Locator) {
    const showAllButton = filterGroup.getByRole('button', { name: /Show all/ });
    await showAllButton.waitFor({ state: 'visible', timeout: 10000 });
    await showAllButton.click();
  }

  /**
   * Resolve the checkbox input for a filter option by its label prefix.
   *
   * Single source of truth for the "label -> `for` -> input" lookup used by every
   * toggle/assert helper below, so the locator strategy stays consistent and the
   * intermediate waits live in one place.
   */
  private async getCheckboxByLabel(
    filterGroup: Locator,
    filterPrefix: string,
  ): Promise<Locator> {
    const label = filterGroup
      .locator('label')
      .filter({ hasText: new RegExp(`^${filterPrefix}`) });
    await label.waitFor({ state: 'visible', timeout: 10000 });
    const labelFor = await label.getAttribute('for');
    const checkbox = filterGroup.locator(`input[id="${labelFor}"]`);
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });
    return checkbox;
  }

  async toggleFilterOn(filterGroup: Locator, filterPrefix: string) {
    const checkbox = await this.getCheckboxByLabel(filterGroup, filterPrefix);
    await expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }

  async toggleFilterOff(filterGroup: Locator, filterPrefix: string) {
    const checkbox = await this.getCheckboxByLabel(filterGroup, filterPrefix);
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  }

  async checkIsFilterToggledOn(filterGroup: Locator, filterPrefix: string) {
    const checkbox = await this.getCheckboxByLabel(filterGroup, filterPrefix);
    await expect(checkbox).toBeChecked();
  }

  async checkIsFilterToggledOff(filterGroup: Locator, filterPrefix: string) {
    const checkbox = await this.getCheckboxByLabel(filterGroup, filterPrefix);
    await expect(checkbox).not.toBeChecked();
  }

  async verifyFilterGroup(
    filterGroup: Locator,
    filterOptions: { label: string }[],
  ) {
    const isShowMore = filterOptions.length > 5;
    if (isShowMore) {
      await this.clickShowAllFilters(filterGroup);
    }

    // Verify each expected option renders (same coverage as before), but resolve
    // the auto-retrying checks concurrently instead of as an O(n) sequence of
    // per-option `waitFor`s. Note: the data files aren't necessarily exhaustive
    // (e.g. the Type group renders more options than are listed), so this asserts
    // "these options are present", not an exact count.
    await Promise.all(
      filterOptions.map(({ label }) =>
        expect(
          filterGroup.locator('label', { hasText: label }).first(),
        ).toBeVisible(),
      ),
    );

    if (isShowMore) {
      await this.clickShowLessFilters(filterGroup);
    }
  }

  async verifyDistrictFilterGroup() {
    // Districts are data-driven, so assert "at least one option" with an
    // auto-retrying matcher rather than a one-shot count() snapshot.
    await expect(
      this.districtFilters.locator('.form-check label').first(),
    ).toBeVisible();
    await expect(
      this.districtFilters.locator('.form-check label'),
    ).not.toHaveCount(0);
  }

  async verifyTypeFilterGroup() {
    await this.verifyFilterGroup(this.typeFilters, typeFilterOptions);
  }

  async verifyThingsToDoFilterGroup() {
    await this.verifyFilterGroup(
      this.thingsToDoFilters,
      thingsToDoFilterOptions,
    );
  }

  async verifyFacilitiesFilterGroup() {
    await this.verifyFilterGroup(
      this.facilitiesFilters,
      facilitiesFilterOptions,
    );
  }

  async verifyAccessTypeFilterGroup() {
    await this.accessTypeFilters.waitFor({
      state: 'visible',
      timeout: 10000,
    });

    await this.verifyFilterGroup(
      this.accessTypeFilters,
      accessTypeFilterOptions,
    );
  }

  async verifyStatusFilterGroup() {
    await this.verifyFilterGroup(this.statusFilters, statusFilterOptions);
  }

  async verifyFeesFilterGroup() {
    await this.verifyFilterGroup(this.feesFilters, feesFilterOptions);
  }

  /**
   * Exhaustively verify every filter group renders with its expected options.
   *
   * This is the full rendering assertion and is intentionally heavy — it belongs
   * in the dedicated "filter menu renders" test only. Functional tests that merely
   * need the panel to be interactive should use {@link waitForFilterMenuReady}.
   */
  async verifyInitialFilterMenu() {
    await this.verifyDistrictFilterGroup();
    await this.verifyTypeFilterGroup();
    await this.verifyThingsToDoFilterGroup();
    await this.verifyStatusFilterGroup();
    await this.verifyFeesFilterGroup();
    await this.verifyFacilitiesFilterGroup();
    await this.verifyAccessTypeFilterGroup();
  }

  /**
   * Lightweight readiness gate for functional tests: waits only until the filter
   * panel is interactive (first group's first option visible). Replaces the heavy
   * {@link verifyInitialFilterMenu} prelude that most tests don't need — a single
   * environment blip in that prelude used to fail dozens of unrelated tests.
   */
  async waitForFilterMenuReady() {
    await expect(
      this.districtFilters.locator('.form-check label').first(),
    ).toBeVisible();
  }

  async openMobileFilterMenu() {
    const mobileFilterButton = this.page.getByRole('button', {
      name: FilterEnum.MOBILE_FILTER_LABEL,
    });
    await mobileFilterButton.click();
    await expect(this.page.locator('.modal-dialog')).toBeVisible();
  }

  async closeMobileFilterMenu() {
    const closeButton = this.page.getByRole('button', {
      name: /result/,
    });
    await closeButton.click();
    await expect(this.page.locator('.modal-dialog')).toBeHidden();
  }

  async toggleMobileFilterGroup(filterGroup: FilterGroup) {
    await this.page
      .getByRole('button', { name: new RegExp(`^${filterGroup}`) })
      .click();
  }

  async toggleMobileFilterOn(filterPrefix: string) {
    const modal = this.page.locator('.filter-modal-content');
    await modal.waitFor({ state: 'visible' });

    const label = modal.locator(`label:has-text("${filterPrefix}")`);
    await label.scrollIntoViewIfNeeded();
    await label.click();

    const checkboxId = await label.getAttribute('for');
    const checkbox = modal.locator(`#${checkboxId}`);

    await expect(checkbox).toBeChecked();
  }
}
