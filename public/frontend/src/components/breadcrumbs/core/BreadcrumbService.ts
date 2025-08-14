/**
 * Centralized breadcrumb service for managing state and operations
 */

import { Store } from '@tanstack/store';
import {
  BreadcrumbGeneratorConfig,
  BreadcrumbItem,
  BreadcrumbState,
  RouteContext,
} from '../types';
import { BreadcrumbRouteGenerator } from './RouteGenerator';

class BreadcrumbService {
  private readonly store: Store<BreadcrumbState>;
  private routeGenerator: BreadcrumbRouteGenerator;

  constructor() {
    this.store = new Store<BreadcrumbState>({
      items: [],
      previousRoute: undefined,
    });
    this.routeGenerator = new BreadcrumbRouteGenerator();
  }

  /**
   * Get the breadcrumb store instance
   */
  getStore(): Store<BreadcrumbState> {
    return this.store;
  }

  /**
   * Get current breadcrumb state
   */
  getState(): BreadcrumbState {
    return this.store.state;
  }

  /**
   * Set breadcrumb items
   */
  setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.store.setState((prev) => ({
      ...prev,
      items,
    }));
  }

  /**
   * Set previous route for context
   */
  setPreviousRoute(route: string): void {
    this.store.setState((prev) => ({
      ...prev,
      previousRoute: route,
    }));
  }

  /**
   * Generate and set breadcrumbs based on route context
   */
  generateAndSetBreadcrumbs(
    config: BreadcrumbGeneratorConfig,
    context: RouteContext,
  ): void {
    const breadcrumbs = this.routeGenerator.generateBreadcrumbs(
      config,
      context,
    );
    this.setBreadcrumbs(breadcrumbs);
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.setBreadcrumbs([]);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.store.setState({
      items: [],
      previousRoute: undefined,
    });
  }
}

// Export singleton instance
export const breadcrumbService = new BreadcrumbService();

// Export the store for direct access if needed
export const breadcrumbStore = breadcrumbService.getStore();
