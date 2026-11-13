import { ROUTE_PATHS } from '@/constants/routes';
import { NavigateOptions } from '@tanstack/react-router';

export enum RecResourceNavKey {
  OVERVIEW = 'overview',
  ADVISORIES = 'advisories',
  PARTNERS = 'partners',
  FILES = 'files',
  ACTIVITIES = 'activities',
  ASSETS = 'assets',
  GEOSPATIAL = 'geospatial',
  RESERVATION = 'reservation',
  FEES = 'fees',
  NOTES = 'notes',
}

export type NavSectionConfig = {
  title: string;
  getNavigateOptions: (id: string) => NavigateOptions;
  isFeatureFlagged?: boolean;
};

/**
 * Navigation configuration for recreation resource pages.
 *
 * This configuration defines the navigation structure including titles
 * and navigation options generation functions for each tab section.
 */
export const REC_RESOURCE_PAGE_NAV_SECTIONS: Record<
  RecResourceNavKey,
  NavSectionConfig
> = {
  [RecResourceNavKey.OVERVIEW]: {
    title: 'Overview',
    isFeatureFlagged: true,
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_OVERVIEW,
      params: { id },
    }),
  },
  [RecResourceNavKey.ADVISORIES]: {
    title: 'Advisories and closures',
    isFeatureFlagged: true,
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_ADVISORIES,
      params: { id },
    }),
  },
  [RecResourceNavKey.PARTNERS]: {
    title: 'Partners',
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_PARTNERS,
      params: { id },
    }),
  },
  [RecResourceNavKey.FILES]: {
    title: 'Images and documents',
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_FILES,
      params: { id },
    }),
  },
  [RecResourceNavKey.ACTIVITIES]: {
    title: 'Activities and features',
    isFeatureFlagged: true,
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES,
      params: { id },
    }),
  },
  [RecResourceNavKey.ASSETS]: {
    title: 'Assets',
    isFeatureFlagged: true,
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_ASSETS,
      params: { id },
    }),
  },
  [RecResourceNavKey.GEOSPATIAL]: {
    title: 'Geospatial',
    isFeatureFlagged: true,
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_GEOSPATIAL,
      params: { id },
    }),
  },
  [RecResourceNavKey.RESERVATION]: {
    title: 'Reservations',
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_RESERVATION,
      params: { id },
    }),
  },
  [RecResourceNavKey.FEES]: {
    title: 'Fees',
    isFeatureFlagged: true,
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_FEES,
      params: { id },
    }),
  },
  [RecResourceNavKey.NOTES]: {
    title: 'Notes and references',
    isFeatureFlagged: true,
    getNavigateOptions: (id: string) => ({
      to: ROUTE_PATHS.REC_RESOURCE_NOTES,
      params: { id },
    }),
  },
};
