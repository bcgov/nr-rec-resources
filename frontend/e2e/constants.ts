import { MAX_VISIBLE_OPTIONS } from '@/components/search/filters/FilterGroup';

export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

export const BASE_API_URL =
  process.env.E2E_BASE_API_URL || 'http://localhost:8000/api';

export const MAX_VISIBLE_FILTERS = MAX_VISIBLE_OPTIONS;
