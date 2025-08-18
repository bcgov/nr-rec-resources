/**
 * Improved route-based breadcrumb configuration
 * Uses composition and reusable builders for better maintainability
 */

import { BreadcrumbItem, RouteBreadcrumbConfig } from '../types';
import { ROUTE_PATHS } from '@/routes/constants';

// Reusable breadcrumb builders
export const BREADCRUMB_BUILDERS = {
  home: (): BreadcrumbItem => ({
    label: 'Home',
    href: ROUTE_PATHS.HOME,
  }),

  search: (preserveQuery = true): BreadcrumbItem => {
    const lastSearch = preserveQuery
      ? sessionStorage.getItem('lastSearch')
      : '';
    return {
      label: 'Find a site or trail',
      href: `${ROUTE_PATHS.SEARCH}${lastSearch || ''}`,
    };
  },

  contact: (): BreadcrumbItem => ({
    label: 'Contact',
    href: ROUTE_PATHS.CONTACT_US,
  }),

  resource: (id: string, name?: string): BreadcrumbItem => ({
    label: name || id || 'Resource',
    href: ROUTE_PATHS.REC_RESOURCE.replace(':id', id),
  }),
} as const;

// Common breadcrumb chains
export const BREADCRUMB_CHAINS = {
  fromHome: () => [BREADCRUMB_BUILDERS.home()],

  fromSearch: () => [BREADCRUMB_BUILDERS.home(), BREADCRUMB_BUILDERS.search()],

  toResource: (id: string, name?: string) => [
    BREADCRUMB_BUILDERS.home(),
    BREADCRUMB_BUILDERS.search(),
    BREADCRUMB_BUILDERS.resource(id, name),
  ],
} as const;

/**
 * Predefined route configurations for breadcrumb generation
 */
export const ROUTE_BREADCRUMB_CONFIGS: RouteBreadcrumbConfig[] = [
  {
    route: ROUTE_PATHS.HOME,
    breadcrumbs: [{ ...BREADCRUMB_BUILDERS.home(), isCurrent: true }],
  },

  {
    route: ROUTE_PATHS.SEARCH,
    breadcrumbs: [
      BREADCRUMB_BUILDERS.home(),
      { ...BREADCRUMB_BUILDERS.search(false), isCurrent: true },
    ],
  },

  {
    route: ROUTE_PATHS.CONTACT_US,
    breadcrumbs: [
      BREADCRUMB_BUILDERS.home(),
      { ...BREADCRUMB_BUILDERS.contact(), isCurrent: true },
    ],
  },

  {
    route: ROUTE_PATHS.REC_RESOURCE,
    generateBreadcrumbs: (params, context) => {
      const { id } = params;
      const { resourceName } = context || {};

      return [
        ...BREADCRUMB_CHAINS.fromSearch(),
        {
          ...BREADCRUMB_BUILDERS.resource(id || '', resourceName),
          isCurrent: true,
        },
      ];
    },
  },

  {
    route: ROUTE_PATHS.REC_RESOURCE_CONTACT,
    generateBreadcrumbs: (params, context) => {
      const { id } = params;
      const { resourceName } = context || {};

      return [
        ...BREADCRUMB_CHAINS.toResource(id || '', resourceName),
        { ...BREADCRUMB_BUILDERS.contact(), isCurrent: true },
      ];
    },
  },
];
