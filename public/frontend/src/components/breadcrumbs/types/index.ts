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
