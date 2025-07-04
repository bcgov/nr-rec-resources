import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
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
        "@keycloak-lib": path.resolve(
          __dirname,
          "node_modules/keycloak-js/lib",
        ),
      },
      extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
    },
    build: {
      // Build Target
      // https://vitejs.dev/config/build-options.html#build-target
      target: "esnext",
      // Minify option
      // https://vitejs.dev/config/build-options.html#build-minify
      minify: "esbuild",
      // Rollup Options
      // https://vitejs.dev/config/build-options.html#build-rollupoptions
      rollupOptions: {
        output: {
          manualChunks: {
            // Split external library from transpiled code.
            react: ["react", "react-dom", "react-router-dom", "react-router"],
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          // Silence depreciations until next bootstrap release
          // https://github.com/twbs/bootstrap/issues/40962
          silenceDeprecations: [
            "mixed-decls",
            "color-functions",
            "global-builtin",
            "import",
            "legacy-js-api",
          ],
        },
      },
    },
  };
});
