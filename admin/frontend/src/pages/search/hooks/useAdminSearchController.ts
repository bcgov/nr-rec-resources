import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';
import {
  ADMIN_SEARCH_PAGE_SIZE_OPTIONS,
  DEFAULT_ADMIN_SEARCH_STATE,
  EMPTY_ADMIN_SEARCH_FILTERS,
  PUBLIC_ACCESS_STATUS_OPTIONS,
  type EditableAdminSearchFilters,
} from '@/pages/search/constants';
import {
  AdminAppliedFilterChip,
  AdminSearchRouteState,
} from '@/pages/search/types';
import { mapAdminSearchResultRow } from '@/pages/search/searchResultsMapper';
import {
  readAdminSearchFilterPanelOpen,
  writeAdminSearchFilterPanelOpen,
} from '@/pages/search/utils/storage';
import {
  serializeAdminSearchRouteState,
  setAdminSearchAccessFilter,
  setAdminSearchActivitiesFilter,
  setAdminSearchDistrictFilter,
  setAdminSearchEstablishmentDateFromFilter,
  setAdminSearchEstablishmentDateToFilter,
  setAdminSearchEstablishedFilter,
  setAdminSearchPage,
  setAdminSearchPageSize,
  setAdminSearchStatusFilter,
  setAdminSearchSort,
  setAdminSearchTypeFilter,
  submitAdminSearchQuery,
  setAdminSearchClosestCommunityFilter,
  setAdminSearchPublicAccessStatusFilter,
  setAdminSearchRecStatusFilter,
} from '@/pages/search/utils/urlState';
import useGetRecreationResourceSearch from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSearch';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import {
  RecreationResourceOptionUIModel,
  useGetRecreationResourceOptions,
} from '@/services';
import type { PaginationState } from '@tanstack/react-table';
import { capitalizeWords } from '@shared/utils/capitalizeWords';
import { useAuthorizations } from '@/hooks/useAuthorizations';

const hasActiveEditableFilters = (search: AdminSearchRouteState) =>
  search.type.length > 0 ||
  search.district.length > 0 ||
  search.activities.length > 0 ||
  search.status.length > 0 ||
  search.access.length > 0 ||
  search.closestCommunity.length > 0 ||
  search.publicAccessStatus.length > 0 ||
  search.recStatus.length > 0 ||
  Boolean(search.establishment_date_from) ||
  Boolean(search.establishment_date_to) ||
  Boolean(search.established);

const hasAppliedSearchState = (search: AdminSearchRouteState) =>
  hasActiveEditableFilters(search) || Boolean(search.q);

const sortOptionsByLabel = (options: RecreationResourceOptionUIModel[] = []) =>
  [...options].sort((left, right) => left.label.localeCompare(right.label));

const getOptionLabel = (
  value: string,
  options: RecreationResourceOptionUIModel[],
): string => options.find((option) => option.id === value)?.label ?? value;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export interface SearchResultsPaginationModel {
  state: PaginationState;
  pageCount: number;
  rowCount: number;
  pageSizeOptions: number[];
  canPreviousPage: boolean;
  canNextPage: boolean;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  previousPage: () => void;
  nextPage: () => void;
}

export function useAdminSearchController(search: AdminSearchRouteState) {
  const navigate = useNavigate();
  const { canEditArchived } = useAuthorizations();
  const [isRecStatusDefaultSuppressed, setIsRecStatusDefaultSuppressed] =
    useState(false);
  const hasActiveFilters = hasActiveEditableFilters(search);
  const [isFilterPanelPreferredOpen, setIsFilterPanelPreferredOpen] = useState(
    () => readAdminSearchFilterPanelOpen(),
  );
  const [dismissedFilterPanelState, setDismissedFilterPanelState] = useState<
    string | null
  >(null);
  // Default to Issued (HI) for non-super-admins only until the user clears/resets that default.
  const shouldApplyDefaultRecStatus =
    !canEditArchived &&
    search.recStatus.length === 0 &&
    !isRecStatusDefaultSuppressed;
  const effectiveSearch = useMemo(
    () =>
      shouldApplyDefaultRecStatus ? { ...search, recStatus: ['HI'] } : search,
    [search, shouldApplyDefaultRecStatus],
  );
  const resultsQuery = useGetRecreationResourceSearch(effectiveSearch);
  const { data: filterOptionsData, isLoading: isFilterOptionsLoading } =
    useGetRecreationResourceOptions([
      GetOptionsByTypesTypesEnum.Activities,
      GetOptionsByTypesTypesEnum.ResourceType,
      GetOptionsByTypesTypesEnum.RecreationStatus,
      GetOptionsByTypesTypesEnum.Access,
      GetOptionsByTypesTypesEnum.District,
      GetOptionsByTypesTypesEnum.ClosestCommunity,
      GetOptionsByTypesTypesEnum.RecStatusCode,
    ]);
  const [
    activityOptionsByType,
    typeOptionsByType,
    statusOptionsByType,
    accessOptionsByType,
    districtOptionsByType,
    closestCommunityOptionsByType,
    recStatusOptionsByType,
  ] = filterOptionsData ?? [];
  const results = useMemo(
    () => (resultsQuery.data?.data ?? []).map(mapAdminSearchResultRow),
    [resultsQuery.data?.data],
  );
  const total = resultsQuery.data?.total ?? 0;
  const pageSize = resultsQuery.data?.page_size ?? search.page_size;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const currentPage =
    totalPages === 0
      ? 1
      : clamp(resultsQuery.data?.page ?? search.page, 1, totalPages);
  const paginationState: PaginationState = {
    pageIndex: Math.max(currentPage - 1, 0),
    pageSize,
  };
  const activityOptions = useMemo(
    () => sortOptionsByLabel(activityOptionsByType?.options ?? []),
    [activityOptionsByType],
  );
  const typeOptions = useMemo(
    () => sortOptionsByLabel(typeOptionsByType?.options ?? []),
    [typeOptionsByType],
  );
  const accessOptions = useMemo(
    () => sortOptionsByLabel(accessOptionsByType?.options ?? []),
    [accessOptionsByType],
  );
  const statusOptions = useMemo(
    () => sortOptionsByLabel(statusOptionsByType?.options ?? []),
    [statusOptionsByType],
  );
  const districtOptions = useMemo(
    () =>
      sortOptionsByLabel(
        (districtOptionsByType?.options ?? []).filter(
          (option) => !option.is_archived,
        ),
      ),
    [districtOptionsByType],
  );
  const closestCommunityOptions = useMemo(
    () => sortOptionsByLabel(closestCommunityOptionsByType?.options ?? []),
    [closestCommunityOptionsByType],
  );
  const establishedOptions = useMemo(
    () => [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
    ],
    [],
  );
  const publicAccessStatusOptions = useMemo(
    () => [...PUBLIC_ACCESS_STATUS_OPTIONS],
    [],
  );
  const recStatusOptions = useMemo(
    () => sortOptionsByLabel(recStatusOptionsByType?.options ?? []),
    [recStatusOptionsByType],
  );
  const updateSearch = (nextSearch: AdminSearchRouteState) =>
    navigate({
      to: ROUTE_PATHS.LANDING,
      search: serializeAdminSearchRouteState(nextSearch),
      resetScroll: false,
    });
  const setPageIndex = (pageIndex: number) => {
    const nextPageIndex = clamp(pageIndex, 0, Math.max(totalPages - 1, 0));
    updateSearch(setAdminSearchPage(search, nextPageIndex + 1));
  };
  const setPageSize = (nextPageSize: number) => {
    const pageSizeOption = ADMIN_SEARCH_PAGE_SIZE_OPTIONS.find(
      (option) => option === nextPageSize,
    );

    updateSearch(
      setAdminSearchPageSize(
        search,
        pageSizeOption ?? DEFAULT_ADMIN_SEARCH_STATE.page_size,
      ),
    );
  };
  const pagination: SearchResultsPaginationModel = {
    state: paginationState,
    pageCount: totalPages,
    rowCount: total,
    pageSizeOptions: [...ADMIN_SEARCH_PAGE_SIZE_OPTIONS],
    canPreviousPage: paginationState.pageIndex > 0,
    canNextPage: paginationState.pageIndex < totalPages - 1,
    setPageIndex,
    setPageSize,
    previousPage: () => setPageIndex(paginationState.pageIndex - 1),
    nextPage: () => setPageIndex(paginationState.pageIndex + 1),
  };
  const clearQuery = () => updateSearch(submitAdminSearchQuery(search, ''));
  const clearType = (value: string) =>
    updateSearch(
      setAdminSearchTypeFilter(
        search,
        search.type.filter((entry) => entry !== value),
      ),
    );
  const clearDistrict = (value: string) =>
    updateSearch(
      setAdminSearchDistrictFilter(
        search,
        search.district.filter((entry) => entry !== value),
      ),
    );
  const clearActivity = (value: string) =>
    updateSearch(
      setAdminSearchActivitiesFilter(
        search,
        search.activities.filter((entry) => entry !== value),
      ),
    );
  const clearStatus = (value: string) =>
    updateSearch(
      setAdminSearchStatusFilter(
        search,
        search.status.filter((entry) => entry !== value),
      ),
    );
  const clearAccess = (value: string) =>
    updateSearch(
      setAdminSearchAccessFilter(
        search,
        search.access.filter((entry) => entry !== value),
      ),
    );
  const clearClosestCommunity = (value: string) =>
    updateSearch(
      setAdminSearchClosestCommunityFilter(
        search,
        search.closestCommunity.filter((entry) => entry !== value),
      ),
    );
  const addClosestCommunity = (value: string) => {
    const nextValue = value.trim();

    if (!nextValue || search.closestCommunity.includes(nextValue)) {
      return;
    }

    updateSearch(
      setAdminSearchClosestCommunityFilter(search, [
        ...search.closestCommunity,
        nextValue,
      ]),
    );
  };
  const clearEstablishmentDateFrom = () =>
    updateSearch(setAdminSearchEstablishmentDateFromFilter(search, undefined));
  const clearEstablishmentDateTo = () =>
    updateSearch(setAdminSearchEstablishmentDateToFilter(search, undefined));
  const clearEstablished = () =>
    updateSearch(setAdminSearchEstablishedFilter(search, undefined));
  const clearPublicAccessStatus = (value: string) =>
    updateSearch(
      setAdminSearchPublicAccessStatusFilter(
        search,
        search.publicAccessStatus.filter((entry) => entry !== value),
      ),
    );
  const clearRecStatus = (value: string) => {
    const nextRecStatus = search.recStatus.filter((entry) => entry !== value);
    if (nextRecStatus.length === 0) {
      setIsRecStatusDefaultSuppressed(true);
    }
    updateSearch(setAdminSearchRecStatusFilter(search, nextRecStatus));
  };
  const appliedFilterChips: AdminAppliedFilterChip[] = [];
  if (shouldApplyDefaultRecStatus) {
    appliedFilterChips.push({
      key: 'recStatus:HI:default',
      label: 'Issued',
      onClear: () => setIsRecStatusDefaultSuppressed(true),
    });
  }
  appliedFilterChips.push(
    ...search.type.map((type) => ({
      key: `type:${type}`,
      label: getOptionLabel(type, typeOptions),
      onClear: () => clearType(type),
    })),
    ...search.district.map((district) => ({
      key: `district:${district}`,
      label: getOptionLabel(district, districtOptions),
      onClear: () => clearDistrict(district),
    })),
    ...search.activities.map((activity) => ({
      key: `activity:${activity}`,
      label: getOptionLabel(activity, activityOptions),
      onClear: () => clearActivity(activity),
    })),
    ...search.status.map((status) => ({
      key: `status:${status}`,
      label: getOptionLabel(status, statusOptions),
      onClear: () => clearStatus(status),
    })),
    ...search.access.map((access) => ({
      key: `access:${access}`,
      label: getOptionLabel(access, accessOptions),
      onClear: () => clearAccess(access),
    })),
    ...search.closestCommunity.map((closestCommunity) => ({
      key: `closestCommunity:${closestCommunity}`,
      label: capitalizeWords(
        getOptionLabel(closestCommunity, closestCommunityOptions),
      ),
      onClear: () => clearClosestCommunity(closestCommunity),
    })),
    ...search.publicAccessStatus.map((status) => ({
      key: `publicAccessStatus:${status}`,
      label: status,
      onClear: () => clearPublicAccessStatus(status),
    })),
    ...search.recStatus.map((code) => ({
      key: `recStatus:${code}`,
      // Show the human-readable description (e.g. "Archived") instead of the code (e.g. "AR")
      label: getOptionLabel(code, recStatusOptions),
      onClear: () => clearRecStatus(code),
    })),
  );

  if (search.establishment_date_from) {
    appliedFilterChips.push({
      key: `established-from:${search.establishment_date_from}`,
      label: `Established from: ${search.establishment_date_from}`,
      onClear: clearEstablishmentDateFrom,
    });
  }

  if (search.establishment_date_to) {
    appliedFilterChips.push({
      key: `established-to:${search.establishment_date_to}`,
      label: `Established to: ${search.establishment_date_to}`,
      onClear: clearEstablishmentDateTo,
    });
  }

  if (search.established) {
    const labelMap = { yes: 'Yes', no: 'No' };
    appliedFilterChips.push({
      key: `established:${search.established}`,
      label: `Established: ${labelMap[search.established as keyof typeof labelMap] || search.established}`,
      onClear: clearEstablished,
    });
  }
  const activeFilterStateKey = useMemo(
    () =>
      JSON.stringify({
        type: search.type,
        district: search.district,
        activities: search.activities,
        status: search.status,
        access: search.access,
        closestCommunity: search.closestCommunity,
        establishment_date_from: search.establishment_date_from,
        establishment_date_to: search.establishment_date_to,
        established: search.established,
        publicAccessStatus: search.publicAccessStatus,
        recStatus: search.recStatus,
      }),
    [
      search.type,
      search.district,
      search.activities,
      search.status,
      search.access,
      search.closestCommunity,
      search.establishment_date_from,
      search.establishment_date_to,
      search.established,
      search.publicAccessStatus,
      search.recStatus,
    ],
  );
  const isFilterPanelOpen = hasActiveFilters
    ? dismissedFilterPanelState !== activeFilterStateKey
    : isFilterPanelPreferredOpen;

  const setFilterPanelOpen = (nextState: boolean) => {
    if (hasActiveFilters) {
      setDismissedFilterPanelState(nextState ? null : activeFilterStateKey);
      return;
    }

    setIsFilterPanelPreferredOpen(nextState);
    writeAdminSearchFilterPanelOpen(nextState);
  };

  const effectiveRecStatusSelection = shouldApplyDefaultRecStatus
    ? ['HI']
    : search.recStatus;
  const hasAppliedState =
    hasAppliedSearchState(search) || shouldApplyDefaultRecStatus;

  return {
    results,
    total,
    totalPages,
    currentPage,
    pagination,
    isResultsLoading: resultsQuery.isLoading,
    isResultsFetching: resultsQuery.isFetching,
    resultsError: resultsQuery.error,
    isFilterOptionsLoading,
    activityOptions,
    typeOptions,
    statusOptions,
    districtOptions,
    accessOptions,
    closestCommunityOptions,
    establishedOptions,
    appliedFilterChips,
    hasAppliedState,
    effectiveRecStatusSelection,
    isFilterPanelOpen,
    toggleFilterPanel: () => setFilterPanelOpen(!isFilterPanelOpen),
    closeFilterPanel: () => setFilterPanelOpen(false),
    submitQuery: (query: string) =>
      updateSearch(submitAdminSearchQuery(search, query)),
    setSort: (sort: AdminSearchRouteState['sort']) =>
      updateSearch(setAdminSearchSort(search, sort)),
    applyFilters: (filters: EditableAdminSearchFilters) => {
      setIsRecStatusDefaultSuppressed((filters.recStatus?.length ?? 0) === 0);
      updateSearch({
        ...search,
        ...filters,
        page: DEFAULT_ADMIN_SEARCH_STATE.page,
      });
    },
    resetFilters: () => {
      setIsRecStatusDefaultSuppressed(true);
      updateSearch({
        ...search,
        ...EMPTY_ADMIN_SEARCH_FILTERS,
        page: DEFAULT_ADMIN_SEARCH_STATE.page,
      });
      setFilterPanelOpen(false);
    },
    publicAccessStatusOptions,
    recStatusOptions,
    clearQuery,
    clearType,
    clearDistrict,
    clearActivity,
    clearStatus,
    clearAccess,
    addClosestCommunity,
    clearClosestCommunity,
    clearEstablishmentDateFrom,
    clearEstablishmentDateTo,
    clearEstablished,
    clearPublicAccessStatus,
    clearRecStatus,
  };
}
