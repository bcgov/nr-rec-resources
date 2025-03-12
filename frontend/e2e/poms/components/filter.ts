// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

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
    expect(
      filterGroup.getByRole('checkbox', { name: filterOption }),
    ).not.toBeChecked();
    await filterGroup
      .getByRole('checkbox', { name: filterOption })
      .check({ force: true });
    expect(
      filterGroup.getByRole('checkbox', { name: filterOption }),
    ).toBeChecked();
  }

  async toggleFilterOff(filterGroup: Locator, filterOption: string) {
    expect(
      filterGroup.getByRole('checkbox', { name: filterOption }),
    ).toBeChecked();
    await filterGroup
      .getByRole('checkbox', { name: filterOption })
      .uncheck({ force: true });
    expect(
      filterGroup.getByRole('checkbox', { name: filterOption }),
    ).not.toBeChecked();
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
      expect(filterGroup.getByLabel(`${label} (${count})`)).toBeVisible();
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
