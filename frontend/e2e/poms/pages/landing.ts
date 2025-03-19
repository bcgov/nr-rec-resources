// https://playwright.dev/docs/pom

import { Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';
import { waitForImagesToLoad } from 'e2e/utils';

export class LandingPOM {
  readonly page: Page;

  readonly url: string = BASE_URL;

  constructor(page: Page) {
    this.page = page;
  }

  async route() {
    await this.page.goto(this.url);
    await waitForImagesToLoad(this.page);
  }
}
