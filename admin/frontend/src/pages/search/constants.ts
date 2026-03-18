import { AdminSearchRouteState, AdminSearchSort } from '@/pages/search/types';

export type EditableAdminSearchFilters = Pick<
  AdminSearchRouteState,
  | 'type'
  | 'district'
  | 'activities'
  | 'access'
  | 'establishment_date_from'
  | 'establishment_date_to'
>;

export const DEFAULT_ADMIN_SEARCH_STATE: AdminSearchRouteState = {
  q: '',
  sort: 'name:asc',
  page: 1,
  type: [],
  district: [],
  activities: [],
  establishment_date_from: undefined,
  establishment_date_to: undefined,
  access: [],
  defined_campsites: undefined,
  closest_community: undefined,
};

export const DEFAULT_ADMIN_SEARCH_SORT: AdminSearchSort =
  DEFAULT_ADMIN_SEARCH_STATE.sort;

export const EMPTY_ADMIN_SEARCH_FILTERS: EditableAdminSearchFilters = {
  type: [],
  district: [],
  activities: [],
  access: [],
  establishment_date_from: undefined,
  establishment_date_to: undefined,
};

export const ADMIN_SEARCH_MULTISELECT_FILTER_FIELDS = [
  {
    key: 'type',
    label: 'Resource type',
    controlId: 'admin-search-filter-resource-type',
    optionsKey: 'typeOptions',
  },
  {
    key: 'district',
    label: 'District',
    controlId: 'admin-search-filter-district',
    optionsKey: 'districtOptions',
  },
  {
    key: 'activities',
    label: 'Activities',
    controlId: 'admin-search-filter-activities',
    optionsKey: 'activityOptions',
  },
  {
    key: 'access',
    label: 'Access type',
    controlId: 'admin-search-filter-access',
    optionsKey: 'accessOptions',
  },
] as const;

export const ADMIN_SEARCH_STORAGE_KEYS = {
  columnVisibility: 'admin-search-visible-columns',
  filterPanelOpen: 'admin-search-filter-panel-open',
  draftQuery: 'admin-search-draft-query',
} as const;

export const ADMIN_SEARCH_COLUMN_IDS = [
  'rec_resource_id',
  'name',
  'recreation_resource_type',
  'district',
  'closest_community',
  'project_established_date',
  'access_types',
  'fee_types',
  'defined_campsites',
] as const;

export type AdminSearchColumnId = (typeof ADMIN_SEARCH_COLUMN_IDS)[number];

export const DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS: AdminSearchColumnId[] = [
  'rec_resource_id',
  'name',
  'recreation_resource_type',
  'district',
  'closest_community',
  'project_established_date',
  'access_types',
  'fee_types',
  'defined_campsites',
];
