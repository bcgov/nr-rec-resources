import { MAX_VISIBLE_OPTIONS } from '@/components/search/filters/FilterGroup';

// Use 127.0.0.1 as local default to avoid macOS DNS issues where localhost → ::1.
// When E2E_BASE_URL is explicitly set (e.g. CI), use it as-is.
export const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3000';

export const MAX_VISIBLE_FILTERS = MAX_VISIBLE_OPTIONS;

export const MAP_CANVAS_SELECTOR = '#map-container';
