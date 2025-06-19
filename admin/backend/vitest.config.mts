import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    include: ["test/**/*.e2e-spec.ts", "test/**/*.spec.ts"],
    exclude: ["**/node_modules/**"],
    globals: true,
    environment: "node",
    setupFiles: "test/test-setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["lcov", "text"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/main.ts",
        "src/app.ts",
        "src/prisma-generated-sql/**/*.{ts,js}", // Prisma generated SQL files
      ],
    },
  },
  plugins: [swc.vite(), tsconfigPaths()],
});
