import {
  ADMIN_SEARCH_COLUMN_IDS,
  type AdminSearchColumnId,
  type AdminSearchSort,
} from '@/pages/search/searchDefinitions';
import type { AdminSearchRouteState } from '@/pages/search/types';

export type { AdminSearchColumnId } from '@/pages/search/searchDefinitions';
export { ADMIN_SEARCH_COLUMN_IDS } from '@/pages/search/searchDefinitions';

export type EditableAdminSearchFilters = Pick<
  AdminSearchRouteState,
  | 'type'
  | 'district'
  | 'activities'
  | 'status'
  | 'access'
  | 'establishment_date_from'
  | 'establishment_date_to'
>;

export const DEFAULT_ADMIN_SEARCH_STATE: AdminSearchRouteState = {
  q: '',
  sort: 'name:asc',
  page: 1,
  page_size: 25,
  type: [],
  district: [],
  activities: [],
  status: [],
  establishment_date_from: undefined,
  establishment_date_to: undefined,
  access: [],
};

export const ADMIN_SEARCH_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export const DEFAULT_ADMIN_SEARCH_SORT: AdminSearchSort =
  DEFAULT_ADMIN_SEARCH_STATE.sort;

export const EMPTY_ADMIN_SEARCH_FILTERS: EditableAdminSearchFilters = {
  type: [],
  district: [],
  activities: [],
  status: [],
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
    key: 'status',
    label: 'Status',
    controlId: 'admin-search-filter-status',
    optionsKey: 'statusOptions',
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

export const DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS: AdminSearchColumnId[] = [
  ...ADMIN_SEARCH_COLUMN_IDS,
];
