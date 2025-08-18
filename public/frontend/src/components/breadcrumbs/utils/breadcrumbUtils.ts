/**
 * Simple breadcrumb generation utilities
 */

import { BreadcrumbItem, RouteBreadcrumbConfig } from '../types';
import { ROUTE_PATHS } from '@/routes/constants';
import { ROUTE_BREADCRUMB_CONFIGS } from '../config/routeConfigs';
import { matchPath } from 'react-router';

/**
 * Generate breadcrumbs for a given route
 */
export function generateBreadcrumbs(
  pathname: string,
  options: {
    resourceId?: string;
    resourceName?: string;
    previousRoute?: string;
    searchParams?: URLSearchParams;
  } = {},
): BreadcrumbItem[] {
  const { resourceName, previousRoute, searchParams } = options;

  // Try route config first
  const routeMatch = findRouteConfig(pathname);
  if (routeMatch) {
    const { config, params } = routeMatch;

    // Static breadcrumbs
    if (config.breadcrumbs) {
      return config.breadcrumbs;
    }

    // Dynamic breadcrumbs
    if (config.generateBreadcrumbs) {
      const context = {
        resourceName,
        previousRoute,
        searchParams,
      };

      return config.generateBreadcrumbs(params, context);
    }
  }

  // Default fallback - just home
  return [{ label: 'Home', href: ROUTE_PATHS.HOME, isCurrent: true }];
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
