import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: {
    alias: {
      // Configure @shared to point to your shared folder
      '@shared': resolve(__dirname, '../../shared/src'),
    },
  },
  assetsInclude: ['**/*.svg'],
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**'],
    globals: true,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost',
      },
    },
    setupFiles: 'src/test-setup.ts',
    // you might want to disable it, if you don't have tests that rely on CSS
    // since parsing CSS is slow
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      include: ['src'],
      exclude: [
        'src/service/recreation-resource/**',
        'src/service/custom-models/**',
      ],
    },
  },
});
