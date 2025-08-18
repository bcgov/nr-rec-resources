/**
 * Simple breadcrumb generation utilities
 */

import { BreadcrumbItem } from '../types';
import { ROUTE_PATHS } from '@/routes/constants';
import { findRouteConfig } from '../config/routeConfigs';

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
 * Set breadcrumbs in the store
 */
export function setBreadcrumbs(items: BreadcrumbItem[], store: any): void {
  store.setState((prev: any) => ({
    ...prev,
    items,
  }));
}

/**
 * Set previous route in the store
 */
export function setPreviousRoute(route: string, store: any): void {
  store.setState((prev: any) => ({
    ...prev,
    previousRoute: route,
  }));
}
