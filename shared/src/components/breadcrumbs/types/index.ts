/**
 * Core breadcrumb types and interfaces
 */

export interface RouteHandle<T> {
  breadcrumb?: BreadcrumbFunction<T>;
  [key: string]: any;
}

export interface BreadcrumbItem {
  /** Display label for the breadcrumb item */
  label: string;
  /** Optional navigation URL */
  href?: string;
  /** Whether this item represents the current page */
  isCurrent?: boolean;
  /** Optional icon for the breadcrumb item */
  icon?: string;
}

// Type for breadcrumb function in handle
export type BreadcrumbFunction<T> = (context?: T) => BreadcrumbItem[];

// Legacy interface for backward compatibility during migration
export interface RouteBreadcrumbConfig {
  /** Route pattern (from ROUTE_PATHS) */
  route: string;
  /** Static breadcrumb items for this route */
  breadcrumbs?: BreadcrumbItem[];
  /** Function to generate dynamic breadcrumbs */
  generateBreadcrumbs?: (
    params: Record<string, string | undefined>,
    context?: {
      resourceName?: string;
      previousRoute?: string;
      searchParams?: URLSearchParams;
    },
  ) => BreadcrumbItem[];
}
