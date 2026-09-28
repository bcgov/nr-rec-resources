import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'shared/vitest.config.mts',
  'admin/backend/vitest.config.mts',
  'admin/frontend/vitest.config.mts',
  'public/backend/vitest.config.mts',
  'public/frontend/vitest.config.mts',
]);
