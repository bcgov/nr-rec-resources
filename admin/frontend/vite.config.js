import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

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
  };
});
