// https://playwright.dev/docs/pom
// Page object models (POM) simplify authoring by creating a higher-level API which suits your application &
// simplify maintenance by capturing element selectors in one place and create reusable code to avoid repetition.

import { expect, Page } from '@playwright/test';

export class FilterChipsPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyFilterChips(filters: string[]) {
    if (filters.length === 0) return;
    for (const filter of filters) {
      const filterChip = this.page.getByRole('button', { name: filter });
      await filterChip.waitFor({ state: 'visible' });
    }
  }

  async removeFilterChip(label: string) {
    const filterChip = this.page.getByRole('button', { name: label });
    await expect(filterChip).toBeVisible();
    await filterChip.click();
    await filterChip.waitFor({ state: 'hidden' });
  }
}
