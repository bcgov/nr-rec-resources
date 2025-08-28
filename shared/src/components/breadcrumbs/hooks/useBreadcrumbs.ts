/**
 * Generic breadcrumb hook that can be used across different projects
 */

import { useEffect, useCallback } from "react";
import { useLocation, useMatches, Location } from "react-router-dom";
import { setBreadcrumbs, useBreadcrumbState } from "../store/breadcrumbStore";
import { BreadcrumbItem, RouteHandle } from "../types";

export interface UseBreadcrumbsOptions<T = Record<string, any>> {
  context?: T;
  /** Custom breadcrumb items to override generation */
  customItems?: BreadcrumbItem[];
  /** Whether to automatically generate breadcrumbs on route changes */
  autoGenerate?: boolean;
  /** Custom breadcrumb generator function */
  breadcrumbGenerator?: (location: Location, context?: T) => BreadcrumbItem[];
}

/**
 * Generic breadcrumb hook that can be customized for different projects
 * Supports both route handles (React Router v6+) and custom generators
 */
export function useBreadcrumbs<T = Record<string, any>>({
  autoGenerate = true,
  customItems,
  context,
  breadcrumbGenerator,
}: UseBreadcrumbsOptions<T> = {}) {
  const location = useLocation();
  const state = useBreadcrumbState();
  const matches = useMatches();

  /**
   * Generate breadcrumbs using route handles, custom generator, or provided items
   */
  const generateBreadcrumbs = useCallback(() => {
    try {
      if (customItems) {
        setBreadcrumbs(customItems);
        return;
      }

      // Try to use route handles first (React Router pattern)
      const lastMatchWithBreadcrumb = matches
        .slice()
        .reverse()
        .find((match) => {
          const handle = match.handle as RouteHandle<T>;
          return handle?.breadcrumb && typeof handle.breadcrumb === "function";
        });

      if (lastMatchWithBreadcrumb) {
        const handle = lastMatchWithBreadcrumb.handle as RouteHandle<T>;
        if (handle?.breadcrumb && typeof handle.breadcrumb === "function") {
          const breadcrumbs = handle.breadcrumb(context);
          setBreadcrumbs(breadcrumbs);
          return;
        }
      }

      // Fallback to custom generator
      if (breadcrumbGenerator) {
        const breadcrumbs = breadcrumbGenerator(location, context);
        setBreadcrumbs(breadcrumbs);
        return;
      }

      // Default behavior - no breadcrumbs if no generator provided
      setBreadcrumbs([]);
    } catch (error) {
      // Handle errors gracefully by setting empty breadcrumbs
      console.warn("Error generating breadcrumbs:", error);
      setBreadcrumbs([]);
    }
  }, [
    customItems,
    breadcrumbGenerator,
    location.pathname,
    location.search,
    matches,
    JSON.stringify(context),
  ]);

  // Auto-generate breadcrumbs when route changes
  useEffect(() => {
    if (autoGenerate) {
      generateBreadcrumbs();
    }
  }, [autoGenerate, generateBreadcrumbs]);

  // Handle custom items changes
  useEffect(() => {
    if (customItems) {
      setBreadcrumbs(customItems);
    }
  }, [customItems]);

  return {
    breadcrumbs: state.items,
    setBreadcrumbs,
    generateBreadcrumbs,
  };
}
