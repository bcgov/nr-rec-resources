// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
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

  async toggleFilterOn(filterGroup: Locator, filterPrefix: string) {
    const checkbox = filterGroup.getByRole('checkbox', {
      name: new RegExp(`^${filterPrefix}`),
    });
    await checkbox.waitFor({ state: 'visible' });
    expect(checkbox).not.toBeChecked();
    await checkbox.check();
    await expect(checkbox).toBeChecked();
  }

  async toggleFilterOff(filterGroup: Locator, filterPrefix: string) {
    const checkbox = filterGroup.getByRole('checkbox', {
      name: new RegExp(`^${filterPrefix}`),
    });
    await checkbox.waitFor({ state: 'visible' });
    expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  }

  async checkIsFilterToggledOn(filterGroup: Locator, filterPrefix: string) {
    const checkbox = filterGroup.getByRole('checkbox', {
      name: new RegExp(`^${filterPrefix}`),
    });
    await checkbox.waitFor({ state: 'visible' });
    await expect(checkbox).toBeChecked();
  }

  async checkIsFilterToggledOff(filterGroup: Locator, filterPrefix: string) {
    const checkbox = filterGroup.getByRole('checkbox', {
      name: new RegExp(`^${filterPrefix}`),
    });
    await checkbox.waitFor({ state: 'visible' });
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

    for (const filter of filterOptions) {
      const { label } = filter;

      await filterGroup
        .locator('label', { hasText: label })
        .first()
        .waitFor({ state: 'visible' });
    }

    if (isShowMore) {
      await this.clickShowLessFilters(filterGroup);
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

  async verifyFilterResultsListener({
    type,
    activities,
  }: {
    type?: string[];
    activities?: string[];
  }) {
    this.page.on('response', async (response) => {
      // We can't use this to check district, facilities, or access type
      // because the API doesn't return data for those filters
      const url = response.url();
      if (url.includes('type=') && type) {
        const json = await response.json();
        const results = json.data.map((item: any) => item.rec_resource_type);
        expect(results).toEqual(expect.arrayContaining(type));
      }

      if (url.includes('activities=') && activities) {
        const json = await response.json();
        const results = json.data.map((item: any) => item.recreation_activity);
        results.forEach((activities: any) => {
          const relevantActivities = activities.filter((activity: any) =>
            activities.every((element: any) =>
              activity.description.includes(element),
            ),
          );
          relevantActivities.forEach((activity: any) => {
            activities.forEach((option: any) => {
              expect(activity.description).toEqual(
                expect.stringContaining(option),
              );
            });
          });
        });
      }
    });
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
