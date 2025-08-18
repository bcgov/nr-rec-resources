/**
 * Breadcrumb route configuration and generation utilities
 */

import {
  BreadcrumbGeneratorConfig,
  BreadcrumbItem,
  RouteContext,
} from '../types';
import { ROUTE_PATHS } from '@/routes/constants';
import { extractRouteParams, findRouteConfig } from '../config/routeConfigs';

/**
 * Enhanced route-specific breadcrumb generator using route configurations
 */
export class BreadcrumbRouteGenerator {
  private readonly homeItem: BreadcrumbItem = {
    label: 'Home',
    href: ROUTE_PATHS.HOME,
  };

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
   * Main breadcrumb generation method using route configurations only
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

    // Use route configuration only
    const routeConfig = findRouteConfig(currentPath);
    if (routeConfig) {
      return this.generateFromRouteConfig(config, context);
    }

    // Default to home only
    return [this.homeItem];
  }
}
