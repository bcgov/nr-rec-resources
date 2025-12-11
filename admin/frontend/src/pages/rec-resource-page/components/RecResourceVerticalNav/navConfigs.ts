import type { FeatureFlags } from '@/contexts/feature-flags/FeatureFlagContext';

export enum RecResourceNavKey {
  OVERVIEW = 'overview',
  FILES = 'files',
  FEES = 'fees',
  GEOSPATIAL = 'geospatial',
}

type FeatureFlagKey = keyof FeatureFlags;

export interface NavSectionConfig {
  title: string;
  route: (id: string) => string;
  requiredFlags?: FeatureFlagKey[];
}

/**
 * Navigation configuration for recreation resource pages.
 *
 * This configuration defines the navigation structure including titles
 * and route generation functions for each tab section.
 * Sections can optionally specify required feature flags.
 */
export const REC_RESOURCE_PAGE_NAV_SECTIONS: Record<
  RecResourceNavKey,
  NavSectionConfig
> = {
  [RecResourceNavKey.OVERVIEW]: {
    title: 'Overview',
    route: (id: string) => `/rec-resource/${id}/overview`,
  },
  [RecResourceNavKey.FILES]: {
    title: 'Files',
    route: (id: string) => `/rec-resource/${id}/files`,
  },
  [RecResourceNavKey.FEES]: {
    title: 'Fees',
    route: (id: string) => `/rec-resource/${id}/fees`,
  },
  [RecResourceNavKey.GEOSPATIAL]: {
    title: 'Geospatial',
    route: (id: string) => `/rec-resource/${id}/geospatial`,
  },
};
