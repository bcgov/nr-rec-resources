import { BreadcrumbFunction } from '@/components/breadcrumbs';

// Extend handle to include breadcrumb function
export interface RouteHandle<T> {
  breadcrumb?: BreadcrumbFunction<T>;
}
