/**
 * Improved breadcrumb hook using React Router handles
 */

import { useLocation, useMatches } from 'react-router-dom';
import { useStore } from '@tanstack/react-store';
import { useCallback, useEffect } from 'react';
import { breadcrumbStore, setBreadcrumbs } from '../store/breadcrumbStore';
import { BreadcrumbItem, RouteHandle } from '../types';
import { generateBreadcrumbs } from '../utils/breadcrumbUtils';

export interface UseBreadcrumbsOptions {
  /** Resource ID for dynamic breadcrumbs (legacy support) */
  resourceId?: string;
  /** Resource name for dynamic breadcrumbs */
  resourceName?: string;
  /** Additional context for dynamic breadcrumbs */
  context?: {
    resourceName?: string;
    [key: string]: any;
  };
  /** Custom breadcrumb items to override generation */
  customItems?: BreadcrumbItem[];
  /** Whether to automatically generate breadcrumbs on route changes */
  autoGenerate?: boolean;
}

/**
 * Enhanced breadcrumb hook that uses React Router handles when available,
 * falls back to legacy breadcrumb generation
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}) {
  const location = useLocation();
  const state = useStore(breadcrumbStore);
  const {
    autoGenerate = true,
    customItems,
    resourceName,
    resourceId,
    context,
  } = options;

  // Try to get matches, fallback to null if not in data router context
  let matches = null;
  try {
    matches = useMatches();
  } catch (error) {
    // Not in a data router context, will use legacy breadcrumb generation
    matches = null;
  }

  /**
   * Generate breadcrumbs from route handles or legacy system
   */
  const generateBreadcrumbsFromHandles = useCallback(() => {
    if (customItems) {
      setBreadcrumbs(customItems);
      return;
    }

    // Create context at generation time to avoid dependency issues
    const currentBreadcrumbContext = {
      resourceName,
      resourceId,
      ...context,
      previousRoute: state.previousRoute,
      searchParams: new URLSearchParams(location.search),
    };

    // Try handle-based breadcrumbs first (if in data router context)
    if (matches) {
      const lastMatchWithBreadcrumb = matches
        .slice()
        .reverse()
        .find((match) => {
          const handle = match.handle as RouteHandle | undefined;
          return handle?.breadcrumb;
        });

      if (lastMatchWithBreadcrumb) {
        const handle = lastMatchWithBreadcrumb.handle as RouteHandle;
        if (handle?.breadcrumb) {
          const breadcrumbs = handle.breadcrumb(
            lastMatchWithBreadcrumb,
            currentBreadcrumbContext,
          );
          setBreadcrumbs(breadcrumbs);
          return;
        }
      }
    }

    // Fallback to legacy breadcrumb generation
    const breadcrumbs = generateBreadcrumbs(location.pathname, {
      resourceId,
      resourceName,
      previousRoute: state.previousRoute,
      searchParams: new URLSearchParams(location.search),
    });

    setBreadcrumbs(breadcrumbs);
  }, [
    matches,
    customItems,
    resourceName,
    resourceId,
    context,
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
