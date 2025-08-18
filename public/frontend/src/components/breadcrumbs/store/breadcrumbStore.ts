/**
 * Simple breadcrumb store using TanStack Store
 */

import { Store } from '@tanstack/store';
import { BreadcrumbItem } from '../types';

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  previousRoute?: string;
}

// Simple global store
export const breadcrumbStore = new Store<BreadcrumbState>({
  items: [],
  previousRoute: undefined,
});

/**
 * Set breadcrumbs in the store
 */
export function setBreadcrumbs(items: BreadcrumbItem[]): void {
  breadcrumbStore.setState((prev) => ({
    ...prev,
    items,
  }));
}

/**
 * Set previous route in the store
 */
export function setPreviousRoute(route: string): void {
  breadcrumbStore.setState((prev) => ({
    ...prev,
    previousRoute: route,
  }));
}

/**
 * Clear all breadcrumbs
 */
export function clearBreadcrumbs(): void {
  setBreadcrumbs([]);
}

/**
 * Get current breadcrumb state
 */
export function getBreadcrumbState(): BreadcrumbState {
  return breadcrumbStore.state;
}
