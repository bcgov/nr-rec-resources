/**
 * Simplified breadcrumb exports
 */

export { default as Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbsProps } from './Breadcrumbs';
export { useBreadcrumbs } from './hooks/useBreadcrumbs';
export {
  breadcrumbStore,
  setBreadcrumbs,
  setPreviousRoute,
  clearBreadcrumbs,
  getBreadcrumbState,
} from './store/breadcrumbStore';
export * from './types';
export * from './utils/breadcrumbUtils';
export * from './config/routeConfigs';
export * from './utils/renderUtils';
