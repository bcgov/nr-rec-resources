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
  | 'closestCommunity'
  | 'establishment_date_from'
  | 'establishment_date_to'
  | 'established'
  | 'publicAccessStatus'
  | 'recStatus'
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
  established: undefined,
  closestCommunity: [],
  publicAccessStatus: [],
  recStatus: [],
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
  closestCommunity: [],
  establishment_date_from: undefined,
  establishment_date_to: undefined,
  established: undefined,
  publicAccessStatus: [],
  recStatus: [],
};

export const ADMIN_SEARCH_MULTISELECT_FILTER_FIELDS = [
  {
    key: 'district',
    label: 'District',
    controlId: 'admin-search-filter-district',
    optionsKey: 'districtOptions',
  },
  {
    key: 'type',
    label: 'Resource type',
    controlId: 'admin-search-filter-resource-type',
    optionsKey: 'typeOptions',
  },
  {
    key: 'established',
    label: 'Established',
    controlId: 'admin-search-filter-established',
    optionsKey: 'establishedOptions',
    isSelect: true,
  },
  {
    key: 'status',
    label: 'Status',
    controlId: 'admin-search-filter-status',
    optionsKey: 'statusOptions',
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
  {
    key: 'closestCommunity',
    label: 'Closest community',
    controlId: 'admin-search-filter-closest-community',
    optionsKey: 'closestCommunityOptions',
  },
  {
    key: 'publicAccessStatus',
    label: 'Public access status',
    controlId: 'admin-search-filter-public-access-status',
    optionsKey: 'publicAccessStatusOptions',
    isFeatureFlagged: true,
  },
  {
    key: 'recStatus',
    label: 'File status',
    controlId: 'admin-search-filter-rec-status',
    optionsKey: 'recStatusOptions',
  },
] as const;

export const ADMIN_SEARCH_ESTABLISHED_OPTIONS = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
] as const;

export const PUBLIC_ACCESS_STATUS_OPTIONS = [
  { id: 'Open', label: 'Open' },
  { id: 'Seasonal restrictions', label: 'Seasonal restrictions' },
  { id: 'Visit with caution', label: 'Visit with caution' },
  { id: 'Limited access', label: 'Limited access' },
  { id: 'Restricted', label: 'Restricted' },
  { id: 'Closed', label: 'Closed' },
] as const;

export const ADMIN_SEARCH_STORAGE_KEYS = {
  columnVisibility: 'admin-search-visible-columns',
  filterPanelOpen: 'admin-search-filter-panel-open',
  draftQuery: 'admin-search-draft-query',
} as const;

export const DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS: AdminSearchColumnId[] = [
  ...ADMIN_SEARCH_COLUMN_IDS,
];
