/**
 * Improved breadcrumb hook using React Router handles
 */

import { useStore } from '@tanstack/react-store';
import { useCallback, useEffect } from 'react';
import { useLocation, useMatches } from 'react-router-dom';
import { breadcrumbStore, setBreadcrumbs } from '../store/breadcrumbStore';
import { BreadcrumbItem } from '../types';
import { RouteHandle } from '@/routes/types';

export interface UseBreadcrumbsOptions<T = Record<string, any>> {
  context?: T;
  /** Custom breadcrumb items to override generation */
  customItems?: BreadcrumbItem[];
  /** Whether to automatically generate breadcrumbs on route changes */
  autoGenerate?: boolean;
}

/**
 * Enhanced breadcrumb hook that uses React Router handles when available,
 * falls back to legacy breadcrumb generation
 */
export function useBreadcrumbs<T = Record<string, any>>({
  autoGenerate = true,
  customItems,
  context,
}: UseBreadcrumbsOptions<T> = {}) {
  const location = useLocation();
  const state = useStore(breadcrumbStore);
  const matches = useMatches();

  /**
   * Generate breadcrumbs from route handles or legacy system
   */
  const generateBreadcrumbsFromHandles = useCallback(() => {
    if (customItems) {
      setBreadcrumbs(customItems);
      return;
    }

    const lastMatchWithBreadcrumb = matches
      .slice()
      .reverse()
      .find((match) => {
        const handle = match.handle as RouteHandle<T>;
        return handle.breadcrumb;
      });

    if (lastMatchWithBreadcrumb) {
      const handle = lastMatchWithBreadcrumb.handle as RouteHandle<T>;
      if (handle?.breadcrumb) {
        const breadcrumbs = handle.breadcrumb(context);
        setBreadcrumbs(breadcrumbs);
        return;
      }
    }
  }, [
    matches,
    customItems,
    JSON.stringify(context),
    state.previousRoute,
    location.pathname,
    location.search,
  ]);

  // Auto-generate breadcrumbs when route changes
  useEffect(() => {
    if (autoGenerate) {
      generateBreadcrumbsFromHandles();
    }
  }, [autoGenerate, generateBreadcrumbsFromHandles]);
}
