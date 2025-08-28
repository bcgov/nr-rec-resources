/**
 * Breadcrumb store using TanStack Store
 */

import { Store, useStore } from "@tanstack/react-store";
import { BreadcrumbItem } from "../types";

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  previousRoute?: string;
}

const initialState: BreadcrumbState = {
  items: [],
  previousRoute: undefined,
};

export const breadcrumbStore = new Store(initialState);

/**
 * Set breadcrumbs in the store
 */
export function setBreadcrumbs(items: BreadcrumbItem[]): void {
  breadcrumbStore.setState((state) => ({
    ...state,
    items,
  }));
}

/**
 * Set previous route in the store
 */
export function setPreviousRoute(route: string): void {
  breadcrumbStore.setState((state) => ({
    ...state,
    previousRoute: route,
  }));
}

/**
 * Get current breadcrumb state
 */
export function getBreadcrumbState(): BreadcrumbState {
  return breadcrumbStore.state;
}

/**
 * Hook to use breadcrumb items in components
 */
export const useBreadcrumbItems = () => {
  return useStore(breadcrumbStore, (state) => state.items);
};

/**
 * Hook to use previous route in components
 */
export const usePreviousRoute = () => {
  return useStore(breadcrumbStore, (state) => state.previousRoute);
};

/**
 * Hook to use entire breadcrumb state in components
 */
export const useBreadcrumbState = () => {
  return useStore(breadcrumbStore, (state) => state);
};
