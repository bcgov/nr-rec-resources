import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    plugins: [react(), tsconfigPaths()],
    server: {
      port: parseInt(env.PORT || '3001'),
      fs: {
        // Allow serving files from two levels up to the project root
        allow: [
          path.resolve(__dirname, '../..'),
          path.resolve(__dirname, '../../shared'),
        ],
      },
      proxy: {
        // Proxy API requests to the backend
        '/api': {
          target: env.BACKEND_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    test: {
      exclude: ['**/node_modules/**', '**/e2e/**'],
      globals: true,
      environment: 'jsdom',
      setupFiles: 'src/test-setup.ts',
      // you might want to disable it, if you don't have tests that rely on CSS
      // since parsing CSS is slow
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['lcov', 'text'],
        include: ['src'],
        exclude: ['src/index.tsx', 'src/services/recreation-resource-admin/**'],
      },
    },
    resolve: {
      // https://vitejs.dev/config/shared-options.html#resolve-alias
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@test': path.resolve(__dirname, 'test'),
        '@shared': fileURLToPath(new URL('../../shared/src', import.meta.url)),
        '~': fileURLToPath(new URL('node_modules', import.meta.url)),
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
            react: ['react', 'react-dom', 'react-router-dom', 'react-router'],
          },
        },
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          // Silence depreciations until next bootstrap release
          // https://github.com/twbs/bootstrap/issues/40962
          silenceDeprecations: [
            'mixed-decls',
            'color-functions',
            'global-builtin',
            'import',
            'legacy-js-api',
          ],
          includePaths: [
            path.resolve(__dirname, 'src'),
            path.resolve(__dirname, '../../shared'),
          ],
        },
      },
    },
  };
});
