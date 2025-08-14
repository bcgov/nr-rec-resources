// https://playwright.dev/docs/pom

import { expect, Page } from "@playwright/test";

export class LayoutPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyHeaderContent() {
    const header = this.page.locator("header");
    await expect(
      header.getByRole("link", {
        name: "Recreation Sites and Trails BC Logo",
      }),
    ).toBeVisible();

    await expect(header.getByText("Admin Tool")).toBeVisible();
  }
}
