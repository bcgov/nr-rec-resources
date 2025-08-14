/**
 * Route-specific breadcrumb configurations
 * Integrates with the route constants to provide consistent breadcrumb generation
 */

import { BreadcrumbItem } from '../types';
import { ROUTE_PATHS } from '@/routes/constants';

export interface RouteBreadcrumbConfig {
  /** Route pattern (from ROUTE_PATHS) */
  route: string;
  /** Static breadcrumb items for this route */
  breadcrumbs?: BreadcrumbItem[];
  /** Function to generate dynamic breadcrumbs */
  generateBreadcrumbs?: (
    params: Record<string, string>,
    context?: any,
  ) => BreadcrumbItem[];
  /** Whether this route requires previous route context */
  usesPreviousRoute?: boolean;
  /** Whether this route should include search breadcrumb */
  includesSearch?: boolean;
  /** Parent route for hierarchical breadcrumbs */
  parentRoute?: string;
}

/**
 * Predefined route configurations for breadcrumb generation
 */
export const ROUTE_BREADCRUMB_CONFIGS: Record<string, RouteBreadcrumbConfig> = {
  [ROUTE_PATHS.HOME]: {
    route: ROUTE_PATHS.HOME,
    breadcrumbs: [{ label: 'Home', href: ROUTE_PATHS.HOME, isCurrent: true }],
  },

  [ROUTE_PATHS.SEARCH]: {
    route: ROUTE_PATHS.SEARCH,
    breadcrumbs: [
      { label: 'Home', href: ROUTE_PATHS.HOME },
      { label: 'Find a site or trail', isCurrent: true },
    ],
  },

  [ROUTE_PATHS.CONTACT_US]: {
    route: ROUTE_PATHS.CONTACT_US,
    breadcrumbs: [
      { label: 'Home', href: ROUTE_PATHS.HOME },
      { label: 'Contact', isCurrent: true },
    ],
  },

  [ROUTE_PATHS.REC_RESOURCE]: {
    route: ROUTE_PATHS.REC_RESOURCE,
    usesPreviousRoute: true,
    includesSearch: true,
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
        label: resourceName,
        isCurrent: true,
      });

      return breadcrumbs;
    },
  },

  [ROUTE_PATHS.REC_RESOURCE_CONTACT]: {
    route: ROUTE_PATHS.REC_RESOURCE_CONTACT,
    parentRoute: ROUTE_PATHS.REC_RESOURCE,
    usesPreviousRoute: true,
    includesSearch: true,
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
      const resourcePath = ROUTE_PATHS.REC_RESOURCE.replace(':id', id);
      breadcrumbs.push({
        label: resourceName || id,
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
};

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

  // Handle resource routes
  const resourceMatch = path.match(/^\/resource\/([^/]+)$/);
  if (resourceMatch) {
    const resourceId = resourceMatch[1];
    return { label: resourceId, href: path };
  }

  // Default fallback
  return { label: 'Back', href: previousRoute };
}

/**
 * Extract route parameters from a path using a route pattern
 */
export function extractRouteParams(
  path: string,
  routePattern: string,
): Record<string, string> {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = routePattern.split('/').filter(Boolean);
  const params: Record<string, string> = {};

  patternParts.forEach((part, index) => {
    if (part.startsWith(':') && pathParts[index]) {
      const paramName = part.slice(1);
      params[paramName] = pathParts[index];
    }
  });

  return params;
}

/**
 * Check if a path matches a route pattern
 */
export function matchesRoutePattern(
  path: string,
  routePattern: string,
): boolean {
  const pathParts = path.split('/').filter(Boolean);
  const patternParts = routePattern.split('/').filter(Boolean);

  if (pathParts.length !== patternParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    return part.startsWith(':') || part === pathParts[index];
  });
}

/**
 * Find the matching route configuration for a given path
 */
export function findRouteConfig(
  path: string,
): RouteBreadcrumbConfig | undefined {
  return Object.values(ROUTE_BREADCRUMB_CONFIGS).find(
    (config) =>
      path === config.route || matchesRoutePattern(path, config.route),
  );
}
