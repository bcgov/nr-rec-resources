/**
 * Lightweight hook for accessing breadcrumb state without management capabilities
 * Useful for components that only need to read breadcrumb state
 */

import { useStore } from '@tanstack/react-store';
import { breadcrumbService } from '@/components/breadcrumbs';

/**
 * Hook to access breadcrumb state without management functions
 * Optimized for components that only need to read breadcrumb data
 */
export function useBreadcrumbState() {
  const state = useStore(breadcrumbService.getStore());

  return {
    breadcrumbs: state.items,
    previousRoute: state.previousRoute,
    hasBreadcrumbs: state.items.length > 0,
  };
}
