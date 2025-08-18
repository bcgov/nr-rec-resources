/**
 * Simplified breadcrumb hook
 */

import { useLocation } from 'react-router-dom';
import { useStore } from '@tanstack/react-store';
import { useCallback, useEffect } from 'react';
import { breadcrumbStore } from '../store/breadcrumbStore';
import {
  generateBreadcrumbs,
  setBreadcrumbs,
  setPreviousRoute,
} from '../utils/breadcrumbUtils';
import { BreadcrumbItem } from '../types';

export interface UseBreadcrumbsOptions {
  /** Resource ID for dynamic breadcrumbs */
  resourceId?: string;
  /** Resource name for dynamic breadcrumbs */
  resourceName?: string;
  /** Custom breadcrumb items to override generation */
  customItems?: BreadcrumbItem[];
  /** Whether to automatically generate breadcrumbs on route changes */
  autoGenerate?: boolean;
}

/**
 * Simple breadcrumb hook
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}) {
  const location = useLocation();
  const state = useStore(breadcrumbStore);
  const { autoGenerate = true, customItems, ...config } = options;

  /**
   * Manually set breadcrumb items
   */
  const setBreadcrumbItems = useCallback((items: BreadcrumbItem[]) => {
    setBreadcrumbs(items, breadcrumbStore);
  }, []);

  /**
   * Set previous route for context-aware navigation
   */
  const setPreviousRouteValue = useCallback((route: string) => {
    setPreviousRoute(route, breadcrumbStore);
  }, []);

  /**
   * Generate and set breadcrumbs
   */
  const generateAndSetBreadcrumbs = useCallback(() => {
    if (customItems) {
      setBreadcrumbs(customItems, breadcrumbStore);
      return;
    }

    const breadcrumbs = generateBreadcrumbs(location.pathname, {
      ...config,
      previousRoute: state.previousRoute,
      searchParams: new URLSearchParams(location.search),
    });

    setBreadcrumbs(breadcrumbs, breadcrumbStore);
  }, [
    location.pathname,
    location.search,
    config.resourceId,
    config.resourceName,
    customItems,
    state.previousRoute,
  ]);

  /**
   * Clear all breadcrumbs
   */
  const clearBreadcrumbs = useCallback(() => {
    setBreadcrumbs([], breadcrumbStore);
  }, []);

  // Auto-generate breadcrumbs when route changes
  useEffect(() => {
    if (autoGenerate) {
      generateAndSetBreadcrumbs();
    }
  }, [autoGenerate, generateAndSetBreadcrumbs]);

  return {
    // State
    breadcrumbs: state.items,
    previousRoute: state.previousRoute,

    // Actions
    setBreadcrumbs: setBreadcrumbItems,
    setPreviousRoute: setPreviousRouteValue,
    generateBreadcrumbs: generateAndSetBreadcrumbs,
    clearBreadcrumbs,
  };
}
