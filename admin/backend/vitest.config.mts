import swc from 'unplugin-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    include: ['test/**/*.e2e-spec.ts', 'test/**/*.spec.ts'],
    exclude: ['**/node_modules/**'],
    globals: true,
    environment: 'node',
    setupFiles: 'test/test-setup.ts',
    env: {
      // Test environment variables
      POSTGRES_HOST: 'localhost',
      POSTGRES_PORT: '5432',
      POSTGRES_USER: 'test_user',
      POSTGRES_PASSWORD: 'test_password',
      POSTGRES_DATABASE: 'test_db',
      POSTGRES_SCHEMA: 'test_schema',
      KEYCLOAK_AUTH_SERVER_URL: 'https://test-keycloak.example.com/auth',
      KEYCLOAK_REALM: 'test-realm',
      KEYCLOAK_CLIENT_ID: 'test-client',
      KEYCLOAK_ISSUER:
        'https://test-keycloak.example.com/auth/realms/test-realm',
      ESTABLISHMENT_ORDER_DOCS_BUCKET: 'rst-lza-establishment-order-docs-dev',
      RST_STORAGE_IMAGES_BUCKET: 'rst-lza-rec-resource-images-dev',
      RST_STORAGE_PUBLIC_DOCUMENTS_BUCKET: 'rst-lza-rec-resource-docs-dev',
      RST_STORAGE_CONSENT_FORMS_BUCKET: 'rst-storage-consent-forms-dev',
      RST_STORAGE_CLOUDFRONT_URL: 'https://test-cdn.example.com',
      AWS_REGION: 'ca-central-1',
    },
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/app.ts',
        'src/prisma-generated-sql/**/*.{ts,js}', // Prisma generated SQL files
      ],
    },
  },
  plugins: [swc.vite(), tsconfigPaths()],
});
