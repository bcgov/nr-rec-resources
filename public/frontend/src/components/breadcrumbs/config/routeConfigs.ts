/**
 * Route-specific breadcrumb configurations
 * Uses React Router's built-in route matching for better reliability
 */

import { BreadcrumbItem } from '../types';
import { ROUTE_PATHS } from '@/routes/constants';
import { matchPath } from 'react-router-dom';

export interface RouteBreadcrumbConfig {
  /** Route pattern (from ROUTE_PATHS) */
  route: string;
  /** Static breadcrumb items for this route */
  breadcrumbs?: BreadcrumbItem[];
  /** Function to generate dynamic breadcrumbs */
  generateBreadcrumbs?: (
    params: Record<string, string | undefined>,
    context?: {
      resourceName?: string;
      previousRoute?: string;
      searchParams?: URLSearchParams;
    },
  ) => BreadcrumbItem[];
}

/**
 * Predefined route configurations for breadcrumb generation
 */
export const ROUTE_BREADCRUMB_CONFIGS: RouteBreadcrumbConfig[] = [
  {
    route: ROUTE_PATHS.HOME,
    breadcrumbs: [{ label: 'Home', href: ROUTE_PATHS.HOME, isCurrent: true }],
  },

  {
    route: ROUTE_PATHS.SEARCH,
    breadcrumbs: [
      { label: 'Home', href: ROUTE_PATHS.HOME },
      { label: 'Find a site or trail', isCurrent: true },
    ],
  },

  {
    route: ROUTE_PATHS.CONTACT_US,
    breadcrumbs: [
      { label: 'Home', href: ROUTE_PATHS.HOME },
      { label: 'Contact', isCurrent: true },
    ],
  },

  {
    route: ROUTE_PATHS.REC_RESOURCE,
    generateBreadcrumbs: (params, context) => {
      const { id } = params;
      const { resourceName, previousRoute } = context || {};

      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: ROUTE_PATHS.HOME },
      ];

      // Add previous route or search context
      if (previousRoute && !previousRoute.startsWith(`/resource/${id}`)) {
        const previousItem = generatePreviousRouteBreadcrumb(previousRoute);
        if (previousItem.href !== ROUTE_PATHS.HOME) {
          breadcrumbs.push(previousItem);
        }
      } else {
        breadcrumbs.push(getSearchBreadcrumb());
      }

      // Add resource breadcrumb
      breadcrumbs.push({
        label: resourceName || id || 'Resource',
        isCurrent: true,
      });

      return breadcrumbs;
    },
  },

  {
    route: ROUTE_PATHS.REC_RESOURCE_CONTACT,
    generateBreadcrumbs: (params, context) => {
      const { id } = params;
      const { resourceName, previousRoute } = context || {};

      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: ROUTE_PATHS.HOME },
      ];

      // Add previous route or search context
      if (previousRoute && !previousRoute.startsWith(`/resource/${id}`)) {
        const previousItem = generatePreviousRouteBreadcrumb(previousRoute);
        if (previousItem.href !== ROUTE_PATHS.HOME) {
          breadcrumbs.push(previousItem);
        }
      } else {
        breadcrumbs.push(getSearchBreadcrumb());
      }

      // Add resource breadcrumb
      const resourcePath = ROUTE_PATHS.REC_RESOURCE.replace(':id', id || '');
      breadcrumbs.push({
        label: resourceName || id || 'Resource',
        href: resourcePath,
      });

      // Add contact breadcrumb
      breadcrumbs.push({
        label: 'Contact',
        isCurrent: true,
      });

      return breadcrumbs;
    },
  },
];

/**
 * Helper function to get search breadcrumb with preserved state
 */
function getSearchBreadcrumb(): BreadcrumbItem {
  const lastSearch = sessionStorage.getItem('lastSearch');
  return {
    label: 'Find a site or trail',
    href: `${ROUTE_PATHS.SEARCH}${lastSearch || ''}`,
  };
}

/**
 * Helper function to generate breadcrumb from previous route
 */
function generatePreviousRouteBreadcrumb(
  previousRoute: string,
): BreadcrumbItem {
  const [path] = previousRoute.split('?');

  const routeMap: Record<string, BreadcrumbItem> = {
    [ROUTE_PATHS.HOME]: { label: 'Home', href: ROUTE_PATHS.HOME },
    [ROUTE_PATHS.SEARCH]: {
      label: 'Find a site or trail',
      href: previousRoute,
    },
    [ROUTE_PATHS.CONTACT_US]: {
      label: 'Contact',
      href: ROUTE_PATHS.CONTACT_US,
    },
  };

  // Check for direct route matches
  if (routeMap[path]) {
    return routeMap[path];
  }

  // Handle resource routes using React Router's matchPath
  const resourceMatch = matchPath(
    { path: ROUTE_PATHS.REC_RESOURCE, end: true },
    path,
  );
  if (resourceMatch) {
    return { label: resourceMatch.params.id || 'Resource', href: path };
  }

  // Default fallback
  return { label: 'Back', href: previousRoute };
}

/**
 * Find the matching route configuration for a given path using React Router's matchPath
 */
export function findRouteConfig(path: string):
  | {
      config: RouteBreadcrumbConfig;
      params: Record<string, string | undefined>;
    }
  | undefined {
  for (const config of ROUTE_BREADCRUMB_CONFIGS) {
    const match = matchPath({ path: config.route, end: true }, path);
    if (match) {
      return {
        config,
        params: match.params,
      };
    }
  }
}
