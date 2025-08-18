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
