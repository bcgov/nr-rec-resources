// https://playwright.dev/docs/pom

import { Page } from '@playwright/test';

export class SearchMapPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async hideMapDisclaimer() {
    await this.page.waitForSelector('#dont-show-again', { state: 'visible' });
    await this.page.getByLabel("Don't show again").check();
    await this.page.getByRole('button', { name: 'OK' }).click();
    await this.page.waitForSelector('#dont-show-again', { state: 'hidden' });
  }
}
