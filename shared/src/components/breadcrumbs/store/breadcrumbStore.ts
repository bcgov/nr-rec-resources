/**
 * Simple breadcrumb store using React context and state
 */

import { BreadcrumbItem } from "../types";

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  previousRoute?: string;
}

// Simple global store without external dependencies
let globalBreadcrumbState: BreadcrumbState = {
  items: [],
  previousRoute: undefined,
};

type BreadcrumbListener = (state: BreadcrumbState) => void;
const listeners: Set<BreadcrumbListener> = new Set();

/**
 * Simple store implementation
 */
export const breadcrumbStore = {
  getState: () => globalBreadcrumbState,

  setState: (updater: (prev: BreadcrumbState) => BreadcrumbState) => {
    globalBreadcrumbState = updater(globalBreadcrumbState);
    listeners.forEach((listener) => listener(globalBreadcrumbState));
  },

  subscribe: (listener: BreadcrumbListener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

/**
 * Set breadcrumbs in the store
 */
export function setBreadcrumbs(items: BreadcrumbItem[]): void {
  breadcrumbStore.setState((prev) => ({
    ...prev,
    items,
  }));
}
