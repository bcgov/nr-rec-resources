import { test } from "@playwright/test";
import { initHappo } from "@shared/e2e/utils";
import { LandingPOM, LayoutPOM, UtilsPOM } from "e2e/poms";

initHappo();

test.describe("RST admin tool landing page", () => {
  test("RST admin tool landing page renders correctly", async ({ page }) => {
    const landing = new LandingPOM(page);
    const layout = new LayoutPOM(page);
    const utils = new UtilsPOM(page);

    await landing.route();

    await layout.verifyHeaderContent();
    await landing.verifyLandingPageContent();

    await utils.accessibility();

    await utils.screenshot("RST Admin tool landing page", "default");
  });
});
