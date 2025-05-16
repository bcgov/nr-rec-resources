// https://playwright.dev/docs/pom

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
