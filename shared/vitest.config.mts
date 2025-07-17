import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    exclude: ["**/node_modules/**"],
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      include: ["shared"],
    },
  },
});
