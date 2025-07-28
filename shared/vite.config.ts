import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "./src"),
    },
    preserveSymlinks: false,
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "index.ts"),
      name: "shared",
      fileName: "index",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    root: path.resolve(__dirname),
    alias: {
      "@shared": path.resolve(__dirname, "./src"),
    },
  },
});
