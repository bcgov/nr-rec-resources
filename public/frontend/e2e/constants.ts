import { MAX_VISIBLE_OPTIONS } from '@/components/search/filters/FilterGroup';

// Normalize localhost to 127.0.0.1 to avoid DNS resolution issues with newer versions of Playwright
export const BASE_URL = (
  process.env.E2E_BASE_URL || 'http://localhost:3000'
).replace('localhost', '127.0.0.1');

export const MAX_VISIBLE_FILTERS = MAX_VISIBLE_OPTIONS;

export const MAP_CANVAS_SELECTOR = '#map-container';
