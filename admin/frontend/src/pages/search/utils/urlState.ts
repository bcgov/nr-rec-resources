import {
  AdminSearchFilters,
  AdminSearchRouteState,
} from '@/pages/search/types';
import { DEFAULT_ADMIN_SEARCH_STATE } from '@/pages/search/constants';
import type { AdminSearchSort } from '@/pages/search/searchDefinitions';

type SerializedListFilterFields =
  | 'type'
  | 'district'
  | 'activities'
  | 'status'
  | 'access';

export type SerializedAdminSearchRouteState = Partial<
  Omit<AdminSearchRouteState, SerializedListFilterFields | 'sort'> & {
    sort: string;
  } & Record<SerializedListFilterFields, string>
>;

function serializeListFilter(values: string[]): string | undefined {
  return values.length > 0 ? values.join('_') : undefined;
}

function serializeSort(sort: AdminSearchSort): string {
  const [field, direction] = sort.split(':');
  return `${field}_${direction}`;
}

export const serializeAdminSearchRouteState = (
  state: AdminSearchRouteState,
): SerializedAdminSearchRouteState => {
  const search: SerializedAdminSearchRouteState = {};

  const trimmedQuery = state.q.trim();
  if (trimmedQuery) {
    search.q = trimmedQuery;
  }

  if (state.sort !== DEFAULT_ADMIN_SEARCH_STATE.sort) {
    search.sort = serializeSort(state.sort);
  }

  if (state.page !== DEFAULT_ADMIN_SEARCH_STATE.page) {
    search.page = state.page;
  }

  if (state.page_size !== DEFAULT_ADMIN_SEARCH_STATE.page_size) {
    search.page_size = state.page_size;
  }

  if (state.type.length > 0) {
    search.type = serializeListFilter(state.type);
  }

  if (state.district.length > 0) {
    search.district = serializeListFilter(state.district);
  }

  if (state.activities.length > 0) {
    search.activities = serializeListFilter(state.activities);
  }

  if (state.status.length > 0) {
    search.status = serializeListFilter(state.status);
  }

  if (state.establishment_date_from) {
    search.establishment_date_from = state.establishment_date_from;
  }

  if (state.establishment_date_to) {
    search.establishment_date_to = state.establishment_date_to;
  }

  if (state.access.length > 0) {
    search.access = serializeListFilter(state.access);
  }

  return search;
};

export const submitAdminSearchQuery = (
  state: AdminSearchRouteState,
  query: string,
): AdminSearchRouteState => ({
  ...state,
  q: query.trim(),
  page: 1,
});

export const setAdminSearchSort = (
  state: AdminSearchRouteState,
  sort: AdminSearchSort,
): AdminSearchRouteState => ({
  ...state,
  sort,
});

export const setAdminSearchPage = (
  state: AdminSearchRouteState,
  page: number,
): AdminSearchRouteState => ({
  ...state,
  page,
});

export const setAdminSearchPageSize = (
  state: AdminSearchRouteState,
  pageSize: number,
): AdminSearchRouteState => ({
  ...state,
  page: 1,
  page_size: pageSize,
});

const setFilterState = (
  state: AdminSearchRouteState,
  nextFilters: Partial<AdminSearchFilters>,
): AdminSearchRouteState => ({
  ...state,
  ...nextFilters,
  page: 1,
});

export const setAdminSearchTypeFilter = (
  state: AdminSearchRouteState,
  type: string[],
): AdminSearchRouteState => setFilterState(state, { type });

export const setAdminSearchDistrictFilter = (
  state: AdminSearchRouteState,
  district: string[],
): AdminSearchRouteState => setFilterState(state, { district });

export const setAdminSearchActivitiesFilter = (
  state: AdminSearchRouteState,
  activities: string[],
): AdminSearchRouteState => setFilterState(state, { activities });

export const setAdminSearchAccessFilter = (
  state: AdminSearchRouteState,
  access: string[],
): AdminSearchRouteState => setFilterState(state, { access });

export const setAdminSearchStatusFilter = (
  state: AdminSearchRouteState,
  status: string[],
): AdminSearchRouteState => setFilterState(state, { status });

export const setAdminSearchEstablishmentDateFromFilter = (
  state: AdminSearchRouteState,
  establishmentDateFrom: AdminSearchRouteState['establishment_date_from'],
): AdminSearchRouteState =>
  setFilterState(state, {
    establishment_date_from: establishmentDateFrom || undefined,
  });

export const setAdminSearchEstablishmentDateToFilter = (
  state: AdminSearchRouteState,
  establishmentDateTo: AdminSearchRouteState['establishment_date_to'],
): AdminSearchRouteState =>
  setFilterState(state, {
    establishment_date_to: establishmentDateTo || undefined,
  });

export const clearAdminSearchState = (
  state: AdminSearchRouteState,
): AdminSearchRouteState => ({
  ...state,
  ...DEFAULT_ADMIN_SEARCH_STATE,
  page: 1,
});
