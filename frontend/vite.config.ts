import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  {
    return {
      plugins: [react()],
      server: {
        port: parseInt(env.PORT || '3000'),
        fs: {
          // Allow serving files from one level up to the project root
          allow: ['..'],
        },
        proxy: {
          // Proxy API requests to the backend
          '/api': {
            target: `http://localhost:${env.API_PORT || 8000}`,
            changeOrigin: true,
          },
        },
      },
      resolve: {
        // https://vitejs.dev/config/shared-options.html#resolve-alias
        alias: {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
          '~': fileURLToPath(new URL('./node_modules', import.meta.url)),
        },
        extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
      },
      build: {
        // Build Target
        // https://vitejs.dev/config/build-options.html#build-target
        target: 'esnext',
        // Minify option
        // https://vitejs.dev/config/build-options.html#build-minify
        minify: 'esbuild',
        // Rollup Options
        // https://vitejs.dev/config/build-options.html#build-rollupoptions
        rollupOptions: {
          output: {
            manualChunks: {
              // Split external library from transpiled code.
              react: [
                'react',
                'react-dom',
                'react-router-dom',
                'react-router',
                '@emotion/react',
                '@emotion/styled',
              ],
              axios: ['axios'],
            },
          },
        },
      },
    };
  }
});
