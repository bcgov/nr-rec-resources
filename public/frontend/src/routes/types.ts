import { BreadcrumbFunction } from '@shared/components/breadcrumbs';

// Extend handle to include breadcrumb function
export interface RouteHandle<T> {
  breadcrumb?: BreadcrumbFunction<T>;
}
