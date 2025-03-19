// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { MAX_VISIBLE_FILTERS } from 'e2e/constants';
import {
  accessTypeFilterOptions,
  districtFilterOptions,
  facilitiesFilterOptions,
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

  constructor(page: Page) {
    this.page = page;

    this.districtFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.DISTRICT });

    this.typeFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.TYPE });

    this.thingsToDoFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.THINGS_TO_DO });

    this.facilitiesFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.FACILITIES });

    this.accessTypeFilters = page
      .locator('fieldset')
      .filter({ hasText: FilterGroup.ACCESS_TYPE });
  }

  async clickClearFilters() {
    const clearFiltersButton = this.page.getByRole('button', {
      name: FilterEnum.CLEAR_FILTER_LABEL,
    });
    await clearFiltersButton.click();
  }

  async clickShowLessFilters(filterGroup: Locator) {
    await filterGroup.getByRole('button', { name: /Show less/ }).click();
  }

  async clickShowAllFilters(filterGroup: Locator) {
    await filterGroup.getByRole('button', { name: /Show all/ }).click();
  }

  async toggleFilterOn(filterGroup: Locator, filterOption: string) {
    const checkbox = filterGroup.getByRole('checkbox', { name: filterOption });
    await checkbox.waitFor({ state: 'visible' });
    expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }

  async toggleFilterOff(filterGroup: Locator, filterOption: string) {
    const checkbox = filterGroup.getByRole('checkbox', { name: filterOption });
    await checkbox.waitFor({ state: 'visible' });
    expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    expect(checkbox).not.toBeChecked();
  }

  async checkIsFilterToggledOn(filterGroup: Locator, filterOption: string) {
    const checkbox = filterGroup.getByRole('checkbox', { name: filterOption });
    await checkbox.waitFor({ state: 'visible' });
    await expect(checkbox).toBeChecked({ checked: true });
  }

  async checkIsFilterToggledOff(filterGroup: Locator, filterOption: string) {
    const checkbox = filterGroup.getByRole('checkbox', { name: filterOption });
    await checkbox.waitFor({ state: 'visible' });
    await expect(checkbox).toBeChecked({ checked: false });
  }

  async verifyFilterGroup(
    filterGroup: Locator,
    filterOptions: { label: string; count: number }[],
  ) {
    const showLessButton = filterGroup.getByRole('button', {
      name: /Show less/,
    });
    const visibleFilters =
      (await showLessButton.count()) > 0
        ? filterOptions
        : filterOptions.slice(0, MAX_VISIBLE_FILTERS);

    for (const filter of visibleFilters) {
      const { label, count } = filter;
      await filterGroup
        .getByLabel(`${label} (${count})`)
        .waitFor({ state: 'visible' });
    }
  }

  async verifyDistrictFilterGroup() {
    await this.verifyFilterGroup(this.districtFilters, districtFilterOptions);
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
    await this.verifyFilterGroup(
      this.accessTypeFilters,
      accessTypeFilterOptions,
    );
  }

  async verifyInitialFilterMenu() {
    await this.verifyDistrictFilterGroup();
    await this.verifyTypeFilterGroup();
    await this.verifyThingsToDoFilterGroup();
    await this.verifyFacilitiesFilterGroup();
    await this.verifyAccessTypeFilterGroup();
  }
}
