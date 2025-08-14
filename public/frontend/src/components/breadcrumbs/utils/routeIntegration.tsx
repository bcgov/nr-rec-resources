/**
 * Integration utilities for breadcrumbs with the routing system
 */

import { useLocation, useParams } from 'react-router-dom';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { BreadcrumbGeneratorConfig } from '../types';
import { ROUTE_PATHS } from '@/routes/constants';
import { matchesRoutePattern } from '../config/routeConfigs';

/**
 * Hook that automatically configures breadcrumbs based on current route
 * This hook intelligently determines the route type and sets up appropriate breadcrumbs
 */
export function useRouteBreadcrumbs(
  options: Omit<BreadcrumbGeneratorConfig, 'autoGenerate'> = {},
) {
  const location = useLocation();
  const params = useParams();

  // Auto-detect resource information from route params
  const resourceId = params.id;

  // Determine if we're on a resource route
  matchesRoutePattern(location.pathname, ROUTE_PATHS.REC_RESOURCE);
  matchesRoutePattern(location.pathname, ROUTE_PATHS.REC_RESOURCE_CONTACT);

  // Configure breadcrumbs with auto-detected and provided options
  const breadcrumbConfig: BreadcrumbGeneratorConfig = {
    resourceId: resourceId || options.resourceId,
    resourceName: options.resourceName,
    customItems: options.customItems,
    showHomeIcon: options.showHomeIcon,
    autoGenerate: true, // Always auto-generate for route-based breadcrumbs
  };

  return useBreadcrumbs(breadcrumbConfig);
}

/**
 * Helper hook for resource pages that automatically extracts resource ID from route
 */
export function useResourceBreadcrumbs(
  resourceName?: string,
  customItems?: BreadcrumbGeneratorConfig['customItems'],
) {
  return useRouteBreadcrumbs({
    resourceName,
    customItems,
  });
}

/**
 * Helper hook for contact pages (both general and resource-specific)
 */
export function useContactBreadcrumbs(resourceName?: string) {
  const location = useLocation();
  const isResourceContact = matchesRoutePattern(
    location.pathname,
    ROUTE_PATHS.REC_RESOURCE_CONTACT,
  );

  return useRouteBreadcrumbs({
    resourceName: isResourceContact ? resourceName : undefined,
  });
}
