import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/",
    plugins: [react()],
    server: {
      port: parseInt(env.PORT || "3001"),
      fs: {
        // Allow serving files from one level up to the project root
        allow: [".."],
      },
      proxy: {
        // Proxy API requests to the backend
        "/api": {
          target: env.BACKEND_URL || "http://localhost:8001",
          changeOrigin: true,
        },
      },
    },
    resolve: {
      // https://vitejs.dev/config/shared-options.html#resolve-alias
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
        "~bootstrap": path.resolve(__dirname, "node_modules/bootstrap"),
      },
      extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
    },
  };
});
