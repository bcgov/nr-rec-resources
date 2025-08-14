/**
 * Primary hook for breadcrumb management
 * Provides a simple interface for managing breadcrumbs in components
 */

import { useLocation } from 'react-router-dom';
import { useStore } from '@tanstack/react-store';
import { useCallback, useEffect, useMemo } from 'react';
import { breadcrumbService } from '../core/BreadcrumbService';
import { BreadcrumbGeneratorConfig, BreadcrumbItem } from '../types';

interface UseBreadcrumbsOptions extends BreadcrumbGeneratorConfig {
  /** Whether to automatically generate breadcrumbs on mount and route changes */
  autoGenerate?: boolean;
}

/**
 * Main hook for breadcrumb management
 * Provides access to breadcrumb state and management functions
 */
export function useBreadcrumbs(options: UseBreadcrumbsOptions = {}) {
  const location = useLocation();
  const state = useStore(breadcrumbService.getStore());
  const { autoGenerate = true, ...config } = options;

  // Memoize config to prevent unnecessary re-generations
  const memoizedConfig = useMemo(() => config, [config]);

  /**
   * Manually set breadcrumb items
   */
  const setBreadcrumbs = useCallback((items: BreadcrumbItem[]) => {
    breadcrumbService.setBreadcrumbs(items);
  }, []);

  /**
   * Set previous route for context-aware navigation
   */
  const setPreviousRoute = useCallback((route: string) => {
    breadcrumbService.setPreviousRoute(route);
  }, []);

  /**
   * Generate breadcrumbs based on current route and config
   */
  const generateBreadcrumbs = useCallback(() => {
    const context = {
      currentPath: location.pathname,
      previousRoute: state.previousRoute,
      searchParams: new URLSearchParams(location.search),
    };

    breadcrumbService.generateAndSetBreadcrumbs(memoizedConfig, context);
  }, [location.pathname, location.search, state.previousRoute, memoizedConfig]);

  /**
   * Clear all breadcrumbs
   */
  const clearBreadcrumbs = useCallback(() => {
    breadcrumbService.clearBreadcrumbs();
  }, []);

  // Auto-generate breadcrumbs when route changes
  useEffect(() => {
    if (autoGenerate) {
      generateBreadcrumbs();
    }
  }, [autoGenerate, generateBreadcrumbs]);

  return {
    // State
    breadcrumbs: state.items,
    previousRoute: state.previousRoute,

    // Actions
    setBreadcrumbs,
    setPreviousRoute,
    generateBreadcrumbs,
    clearBreadcrumbs,
  };
}
