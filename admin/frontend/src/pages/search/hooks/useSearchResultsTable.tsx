import {
  type ColumnDef,
  functionalUpdate,
  getCoreRowModel,
  type OnChangeFn,
  type Row,
  useReactTable,
} from '@tanstack/react-table';
import type { KeyboardEvent } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  AdminStatusBadge,
  CustomBadge,
  PublicAccessStatusBadge,
  VisibleOnWebsite,
} from '@/components';
import { COLOR_RED, COLOR_RED_LIGHT } from '@/styles/colors';
import { ROUTE_PATHS } from '@/constants/routes';
import {
  ADMIN_SEARCH_COLUMN_IDS,
  type AdminSearchColumnId,
} from '@/pages/search/constants';
import { SearchResultsTableSortableHeader } from '@/pages/search/components/SearchResultsTableSortableHeader';
import type { SearchResultsPaginationModel } from '@/pages/search/hooks/useAdminSearchController';
import {
  ADMIN_SEARCH_COLUMN_DEFINITIONS,
  FEATURE_FLAGGED_COLUMN_IDS,
} from '@/pages/search/searchDefinitions';
import type {
  AdminSearchResultRow,
  AdminSearchRouteState,
} from '@/pages/search/types';
import { useAuthorizations } from '@/hooks/useAuthorizations';

interface UseSearchResultsTableParams {
  rows: AdminSearchResultRow[];
  visibleColumns: AdminSearchColumnId[];
  sort: AdminSearchRouteState['sort'];
  pagination: SearchResultsPaginationModel;
  isLoading: boolean;
  onSortChange: (sort: AdminSearchRouteState['sort']) => void;
}

const getSortParts = (sort: AdminSearchRouteState['sort']) => sort.split(':');

const buildColumnVisibility = (
  visibleColumns: AdminSearchColumnId[],
  canViewFeatureFlag: boolean,
) =>
  Object.fromEntries(
    ADMIN_SEARCH_COLUMN_IDS.map((columnId) => {
      if (FEATURE_FLAGGED_COLUMN_IDS.has(columnId) && !canViewFeatureFlag) {
        return [columnId, false];
      }
      return [columnId, visibleColumns.includes(columnId)];
    }),
  ) as Record<AdminSearchColumnId, boolean>;

const buildColumns = (
  sortField: string,
  sortDirection: string,
  onSortChange: (sort: AdminSearchRouteState['sort']) => void,
): ColumnDef<AdminSearchResultRow>[] =>
  ADMIN_SEARCH_COLUMN_DEFINITIONS.map(({ id, resultKey }) => {
    const column: ColumnDef<AdminSearchResultRow> = {
      id,
      accessorKey: resultKey,
      header: () => (
        <SearchResultsTableSortableHeader
          columnId={id}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }: { row: Row<AdminSearchResultRow> }) =>
        String(row.original[resultKey] ?? ''),
    };

    if (id === 'status') {
      column.cell = ({ row }: { row: Row<AdminSearchResultRow> }) => {
        const isArchived = row.original.recStatusCode === 'AR';
        if (isArchived) {
          return (
            <CustomBadge
              label="Archived"
              bgColor={COLOR_RED_LIGHT}
              textColor={COLOR_RED}
            />
          );
        }
        return (
          <AdminStatusBadge
            label={row.original.status}
            statusCode={row.original.statusCode}
          />
        );
      };
    }

    if (id === 'display_on_public_site') {
      column.cell = ({ row }: { row: Row<AdminSearchResultRow> }) => (
        <VisibleOnWebsite visible={row.original.visible} />
      );
    }

    if (id === 'public_access_status') {
      column.cell = ({ row }: { row: Row<AdminSearchResultRow> }) => (
        <PublicAccessStatusBadge label={row.original.publicAccessStatus} />
      );
    }

    return column;
  });

export function useSearchResultsTable({
  rows,
  visibleColumns,
  sort,
  pagination,
  isLoading,
  onSortChange,
}: UseSearchResultsTableParams) {
  const navigate = useNavigate();
  const { canViewFeatureFlag } = useAuthorizations();
  const [sortField, sortDirection] = getSortParts(sort);

  const navigateToResource = (recResourceId: string) =>
    navigate({
      to: ROUTE_PATHS.REC_RESOURCE_PAGE,
      params: { id: recResourceId },
    });

  const onPaginationChange: OnChangeFn<typeof pagination.state> = (updater) => {
    const nextPagination = functionalUpdate(updater, pagination.state);

    if (nextPagination.pageIndex !== pagination.state.pageIndex) {
      pagination.setPageIndex(nextPagination.pageIndex);
    }
  };

  const table = useReactTable({
    data: rows,
    columns: buildColumns(sortField, sortDirection, onSortChange),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onPaginationChange,
    pageCount: pagination.pageCount,
    rowCount: pagination.rowCount,
    state: {
      columnVisibility: buildColumnVisibility(
        visibleColumns,
        canViewFeatureFlag,
      ),
      pagination: pagination.state,
    },
    getRowId: (row) => row.recResourceId,
  });

  const getRowInteractionProps = (row: Row<AdminSearchResultRow>) => {
    const { recResourceId, projectName } = row.original;
    const openResource = () => navigateToResource(recResourceId);

    return {
      className: 'results-table__row',
      onClick: openResource,
      onKeyDown: (event: KeyboardEvent<HTMLTableRowElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openResource();
        }
      },
      tabIndex: 0,
      role: 'link' as const,
      'aria-label': `Open resource ${recResourceId}`,
      title: `Click for more details about ${recResourceId} - ${projectName}`,
    };
  };

  return {
    table,
    tableRows: table.getRowModel().rows,
    visibleLeafColumns: table.getVisibleLeafColumns(),
    statusMessage: isLoading
      ? 'Loading results...'
      : 'No resources match the current search state.',
    getRowInteractionProps,
  };
}
