// https://playwright.dev/docs/pom

import { expect, Locator, Page } from '@playwright/test';
import { BASE_URL } from 'e2e/constants';

// below `md` the sub nav gives way to the hamburger menu
const MD_BREAKPOINT = 768;

// the search map renders a second <Header/> inside <main>, so plain `header`
// matches twice there
const SITE_HEADER = 'header:not(main header)';

// the test env can be slow to render on CI, especially in Firefox
const PAGE_READY_TIMEOUT = 30_000;

export class LayoutPOM {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async verifyHeaderContent() {
    const header = this.page.locator(SITE_HEADER);
    await expect(header).toHaveCount(1, { timeout: PAGE_READY_TIMEOUT });

    if ((this.page.viewportSize()?.width ?? MD_BREAKPOINT) < MD_BREAKPOINT) {
      await this.verifyMobileHeaderContent(header);
      return;
    }

    await expect(
      header
        .locator('nav[aria-label="Secondary header site navigation"]')
        .getByRole('link', { name: 'Find a site or trail' }),
    ).toBeVisible();
  }

  // the only visible nav here is the toggle; the links sit in the collapsed
  // drawer, which is clipped rather than hidden, so don't assert visibility
  private async verifyMobileHeaderContent(header: Locator) {
    await expect(
      header.getByRole('button', { name: 'Open menu' }),
    ).toBeVisible();

    const drawerLink = header.locator(
      'nav[aria-label="Mobile navigation menu"] a[href="/search"]',
    );
    await expect(drawerLink).toHaveCount(1);
    await expect(drawerLink).toHaveText('Find a site or trail');
  }

  async verifyFooterContent() {
    const footer = this.page.locator('footer');
    const links = [
      'Disclaimer',
      'Privacy',
      'Accessibility',
      'Copyright',
      'Closures',
      'Rules and etiquette',
      'Authorizations',
      'Partnering and volunteering',
      'Research opportunities',
      'ORV Trail Fund',
      'Contact us',
    ];

    // for...of so each assertion is actually awaited (forEach drops the promises)
    for (const link of links) {
      await expect(footer.getByRole('link', { name: link })).toBeVisible();
    }
  }

  async clickFindARecreationSiteOrTrail() {
    await this.page.click('header a[href="/search"]');
    // web-first assertion retries until navigation completes
    await expect(this.page).toHaveURL(`${BASE_URL}/search`);
  }
}
