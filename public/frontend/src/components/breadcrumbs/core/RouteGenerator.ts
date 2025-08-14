/**
 * Breadcrumb route configuration and generation utilities
 */

import {
  BreadcrumbItem,
  BreadcrumbGeneratorConfig,
  RouteContext,
} from '../types';
import { ROUTE_PATHS } from '@/routes/constants';
import {
  findRouteConfig,
  extractRouteParams,
  matchesRoutePattern,
} from '../config/routeConfigs';

/**
 * Enhanced route-specific breadcrumb generator using route configurations
 */
export class BreadcrumbRouteGenerator {
  private readonly homeItem: BreadcrumbItem = {
    label: 'Home',
    href: ROUTE_PATHS.HOME,
  };

  /**
   * Get search breadcrumb with preserved search state
   */
  private getSearchBreadcrumb(): BreadcrumbItem {
    const lastSearch = sessionStorage.getItem('lastSearch');
    return {
      label: 'Find a site or trail',
      href: `${ROUTE_PATHS.SEARCH}${lastSearch || ''}`,
    };
  }

  /**
   * Generate breadcrumb from previous route using route constants
   */
  private generateFromPreviousRoute(previousRoute: string): BreadcrumbItem {
    const [path] = previousRoute.split('?');

    // Use route constants for consistent path matching
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

    // Handle parameterized routes
    if (matchesRoutePattern(path, ROUTE_PATHS.REC_RESOURCE)) {
      const params = extractRouteParams(path, ROUTE_PATHS.REC_RESOURCE);
      return { label: params.id, href: path };
    }

    // Default fallback
    return { label: 'Back', href: previousRoute };
  }

  /**
   * Generate breadcrumbs using route configurations
   */
  private generateFromRouteConfig(
    config: BreadcrumbGeneratorConfig,
    context: RouteContext,
  ): BreadcrumbItem[] {
    const { currentPath } = context;
    const routeConfig = findRouteConfig(currentPath);

    if (!routeConfig) {
      // Fallback to home if no route config found
      return [this.homeItem];
    }

    // If route has static breadcrumbs, return them
    if (routeConfig.breadcrumbs) {
      return routeConfig.breadcrumbs;
    }

    // If route has dynamic breadcrumb generation
    if (routeConfig.generateBreadcrumbs) {
      const params = extractRouteParams(currentPath, routeConfig.route);
      const breadcrumbContext = {
        resourceName: config.resourceName,
        previousRoute: context.previousRoute,
        searchParams: context.searchParams,
      };

      return routeConfig.generateBreadcrumbs(params, breadcrumbContext);
    }

    // Fallback to home
    return [this.homeItem];
  }

  /**
   * Generate breadcrumbs for resource pages (legacy support)
   */
  private generateResourceBreadcrumbs(
    config: BreadcrumbGeneratorConfig,
    context: RouteContext,
  ): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [this.homeItem];
    const { resourceId, resourceName } = config;
    const { currentPath, previousRoute } = context;

    // Add context breadcrumb (search or previous route)
    const shouldUsePrevious =
      previousRoute && !previousRoute.startsWith(currentPath);
    if (shouldUsePrevious) {
      const previousItem = this.generateFromPreviousRoute(previousRoute);
      if (previousItem.href !== ROUTE_PATHS.HOME) {
        breadcrumbs.push(previousItem);
      }
    } else {
      breadcrumbs.push(this.getSearchBreadcrumb());
    }

    // Add resource breadcrumb
    if (resourceId) {
      const isContactPage = matchesRoutePattern(
        currentPath,
        ROUTE_PATHS.REC_RESOURCE_CONTACT,
      );
      const resourcePath = ROUTE_PATHS.REC_RESOURCE.replace(':id', resourceId);

      breadcrumbs.push({
        label: resourceName || resourceId,
        href: isContactPage ? resourcePath : undefined,
        isCurrent: !isContactPage,
      });

      // Add contact breadcrumb if on contact page
      if (isContactPage) {
        breadcrumbs.push({ label: 'Contact', isCurrent: true });
      }
    }

    return breadcrumbs;
  }

  /**
   * Generate breadcrumbs for contact pages (legacy support)
   */
  private generateContactBreadcrumbs(): BreadcrumbItem[] {
    return [this.homeItem, { label: 'Contact', isCurrent: true }];
  }

  /**
   * Generate breadcrumbs for search pages (legacy support)
   */
  private generateSearchBreadcrumbs(): BreadcrumbItem[] {
    return [this.homeItem, { label: 'Find a site or trail', isCurrent: true }];
  }

  /**
   * Main breadcrumb generation method using route configurations
   */
  generateBreadcrumbs(
    config: BreadcrumbGeneratorConfig,
    context: RouteContext,
  ): BreadcrumbItem[] {
    const { customItems } = config;
    const { currentPath } = context;

    // Use custom items if provided
    if (customItems) {
      return customItems;
    }

    // Try to use route configuration first (preferred approach)
    const routeConfig = findRouteConfig(currentPath);
    if (routeConfig) {
      return this.generateFromRouteConfig(config, context);
    }

    // Fallback to legacy route-based generation for backward compatibility
    if (
      matchesRoutePattern(currentPath, ROUTE_PATHS.REC_RESOURCE) ||
      matchesRoutePattern(currentPath, ROUTE_PATHS.REC_RESOURCE_CONTACT)
    ) {
      return this.generateResourceBreadcrumbs(config, context);
    }

    if (currentPath === ROUTE_PATHS.CONTACT_US) {
      return this.generateContactBreadcrumbs();
    }

    if (currentPath === ROUTE_PATHS.SEARCH) {
      return this.generateSearchBreadcrumbs();
    }

    // Default to home only
    return [this.homeItem];
  }
}
