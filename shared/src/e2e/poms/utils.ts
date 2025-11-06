import { expect, Locator, Page } from '@playwright/test';
import happoPlaywright from 'happo-playwright';
import {
  analyzeAccessibility,
  waitForNetworkRequest,
  waitForNetworkResponse,
} from '@shared/e2e/utils';
import { MAP_CANVAS_SELECTOR } from '@shared/e2e/constants';

export class UtilsPOM {
  readonly page: Page;
  readonly pageContent: Locator;
  readonly baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = (page.context() as any)._options.baseURL ?? '';
    this.pageContent = page.locator('html');
  }

  async checkExpectedUrlParams(expectedParams: string) {
    await this.page.waitForFunction(
      (expected) =>
        new URL(window.location.href).searchParams
          .toString()
          .includes(expected),
      expectedParams,
    );
  }

  async clickLinkByText(text: string) {
    const link = this.page
      .locator(`a:has-text("${text}")`)
      .filter({ hasText: text, hasNotText: '', visible: true });
    const href = await link.getAttribute('href');
    await link.click();

    await this.page.waitForURL(`${this.baseUrl}${href}`);
    expect(this.page.url()).toBe(`${this.baseUrl}${href}`);
  }

  async accessibility() {
    await analyzeAccessibility(this.page);
  }

  async screenshot(component: string, variant: string) {
    await this.removeVectorFeatureMap();
    await happoPlaywright.screenshot(this.page, this.pageContent, {
      component,
      variant,
    });
  }

  async screenshotMobile(component: string, variant: string) {
    const maxHeight = 20000;
    const viewport = '400x844';
    await this.removeVectorFeatureMap();
    await happoPlaywright.screenshot(this.page, this.pageContent, {
      component,
      variant,
      targets: [
        {
          name: 'chrome-small',
          browser: 'chrome',
          viewport,
          maxHeight,
        },
        {
          name: 'firefox-small',
          browser: 'firefox',
          viewport,
          maxHeight,
        },
        {
          name: 'safari-small',
          browser: 'safari',
          viewport,
          maxHeight,
        },
        {
          name: 'edge-small',
          browser: 'edge',
          viewport,
          maxHeight,
        },
      ],
    });
  }

  /**
   * Prepare page for Happo screenshot by capturing map with Playwright and replacing canvas.
   */
  private async prepareMapScreenshot() {
    // Wait for map to be visible and loaded
    await this.page.waitForSelector(MAP_CANVAS_SELECTOR, { state: 'visible' });
    await this.page.waitForTimeout(2000);

    // Check if map is in a fixed full-screen container
    const isFixedMap = await this.page.evaluate(() => {
      const container = document.querySelector('.search-map-container');
      if (!container) return false;
      const style = window.getComputedStyle(container);
      return style.position === 'fixed';
    });

    // Take screenshot - use viewport for fixed maps, fullPage for scrollable
    const screenshotBuffer = await this.page.screenshot({
      fullPage: !isFixedMap,
    });
    const base64Screenshot = screenshotBuffer.toString('base64');

    // Remove the canvas element entirely to prevent Happo from processing it
    await this.removeVectorFeatureMap();

    // Inject the screenshot as a background image
    await this.page.evaluate(
      (data) => {
        const { imgData, isFixed } = data;
        const body = document.body;
        const html = document.documentElement;

        // Use viewport dimensions for fixed maps, scroll dimensions for scrollable
        const height = isFixed ? window.innerHeight : body.scrollHeight;
        const width = isFixed ? window.innerWidth : body.scrollWidth;

        // Create a wrapper to hold the screenshot
        const wrapper = document.createElement('div');
        wrapper.id = 'happo-screenshot-wrapper';
        wrapper.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: ${width}px;
        height: ${height}px;
        background-image: url(${imgData});
        background-size: cover;
        background-position: top left;
        background-repeat: no-repeat;
        z-index: 999999;
      `;

        // Hide all original body content
        Array.from(body.children).forEach((child) => {
          (child as HTMLElement).style.display = 'none';
        });

        // Add the screenshot wrapper
        body.appendChild(wrapper);

        // Ensure body maintains dimensions
        body.style.minHeight = `${height}px`;
        html.style.minHeight = `${height}px`;
      },
      {
        imgData: `data:image/png;base64,${base64Screenshot}`,
        isFixed: isFixedMap,
      },
    );
  }

  /**
   * Take a screenshot with map visible using Playwright's native screenshot.
   */
  async screenshotWithMap(component: string, variant: string) {
    await this.prepareMapScreenshot();

    await happoPlaywright.screenshot(this.page, this.pageContent, {
      component,
      variant,
    });
  }

  /**
   * Take a mobile screenshot with map visible using Playwright's native screenshot.
   */
  async screenshotMobileWithMap(component: string, variant: string) {
    const maxHeight = 20000;
    const viewport = '400x844';

    await this.prepareMapScreenshot();

    await happoPlaywright.screenshot(this.page, this.pageContent, {
      component,
      variant,
      targets: [
        {
          name: 'chrome-small',
          browser: 'chrome',
          viewport,
          maxHeight,
        },
        {
          name: 'firefox-small',
          browser: 'firefox',
          viewport,
          maxHeight,
        },
        {
          name: 'safari-small',
          browser: 'safari',
          viewport,
          maxHeight,
        },
        {
          name: 'edge-small',
          browser: 'edge',
          viewport,
          maxHeight,
        },
      ],
    });
  }

  async waitForNetworkRequest(url: string) {
    await waitForNetworkRequest(this.page, url);
  }

  async waitForNetworkResponse(statusCode?: number) {
    await waitForNetworkResponse(this.page, statusCode);
  }

  async waitForNetwork(url: string, statusCode?: number) {
    await this.waitForNetworkRequest(url);
    await this.waitForNetworkResponse(statusCode);
  }

  /**
   * Remove the map canvas element
   *
   * @remarks
   * Happo e2e automatically converts canvas elements to inline img elements
   * with a URL that looks like  "_inlined/...png" without actually creating
   * the file in the directory. When the tests are done, it then tries to
   * package every URL in the asset bundle for the test review page and tries to
   * resolve this non-existent url which ends up throwing the error.
   */
  async removeVectorFeatureMap() {
    const canvas = this.page.locator(MAP_CANVAS_SELECTOR);
    if ((await canvas.count()) > 0) {
      await this.page.evaluate((selector) => {
        document.querySelector(selector)?.remove();
      }, MAP_CANVAS_SELECTOR);
    }
  }
}
