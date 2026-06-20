import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/e2e/**'],
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/test-setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      include: ['src'],
      exclude: ['src/index.tsx', 'src/services/recreation-resource-admin/**'],
    },
    alias: {
      'react-select': path.resolve(
        __dirname,
        'test/__mocks__/react-select.tsx',
      ),
    },
  },
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@test': path.resolve(__dirname, 'test'),
      '@shared': fileURLToPath(new URL('../../shared/src', import.meta.url)),
      '~': fileURLToPath(new URL('node_modules', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
});
