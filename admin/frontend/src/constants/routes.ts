import { NavigateOptions } from '@tanstack/react-router';

export const ROUTE_PATHS: Record<string, NavigateOptions['to']> = {
  LANDING: '/',
  REC_RESOURCE_PAGE: '/rec-resource/$id',
  REC_RESOURCE_OVERVIEW: '/rec-resource/$id/overview',
  REC_RESOURCE_OVERVIEW_EDIT: '/rec-resource/$id/overview/edit',
  REC_RESOURCE_FILES: '/rec-resource/$id/files',
  REC_RESOURCE_FEES: '/rec-resource/$id/fees',
};
