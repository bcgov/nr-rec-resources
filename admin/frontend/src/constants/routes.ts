import { NavigateOptions } from '@tanstack/react-router';

export const ROUTE_PATHS = {
  LANDING: '/',
  REC_RESOURCE_PAGE: '/rec-resource/$id',
  REC_RESOURCE_OVERVIEW: '/rec-resource/$id/overview',
  REC_RESOURCE_OVERVIEW_EDIT: '/rec-resource/$id/overview/edit',
  REC_RESOURCE_FILES: '/rec-resource/$id/files',
  REC_RESOURCE_ACTIVITIES: '/rec-resource/$id/activities',
  REC_RESOURCE_ACTIVITIES_EDIT: '/rec-resource/$id/activities/edit',
  REC_RESOURCE_FEES: '/rec-resource/$id/fees',
  REC_RESOURCE_FEES_ADD: '/rec-resource/$id/fees/add',
  REC_RESOURCE_FEES_EDIT: '/rec-resource/$id/fees/edit',
  REC_RESOURCE_GEOSPATIAL: '/rec-resource/$id/geospatial',
  REC_RESOURCE_GEOSPATIAL_EDIT: '/rec-resource/$id/geospatial/edit',
} as const satisfies Record<string, NavigateOptions['to']>;
