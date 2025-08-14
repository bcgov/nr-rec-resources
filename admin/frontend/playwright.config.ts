import baseConfig from "@shared/config/playwright.base.config";
import { defineConfig } from "@playwright/test";
import { BASE_URL } from "./e2e/constants";

export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: BASE_URL,
  },
  projects: (baseConfig.projects ?? []).map((project) => ({
    ...project,
    use: {
      ...project.use,
      baseURL: BASE_URL,
    },
  })),
});
