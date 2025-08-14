/**
 * Core breadcrumb types and interfaces
 */

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

export interface BreadcrumbState {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Previous route for context-aware navigation */
  previousRoute?: string;
}

export interface BreadcrumbGeneratorConfig {
  /** Resource identifier */
  resourceId?: string;
  /** Display name for the resource */
  resourceName?: string;
  /** Custom breadcrumb items to override generation */
  customItems?: BreadcrumbItem[];
  /** Whether to include home icon on first item */
  showHomeIcon?: boolean;
  /** Whether to automatically generate breadcrumbs on route change */
  autoGenerate?: boolean;
}

export interface RouteContext {
  /** Current route path */
  currentPath: string;
  /** Previous route path */
  previousRoute?: string;
  /** Route search parameters */
  searchParams?: URLSearchParams;
}
