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
import { ROUTE_PATHS } from '@/constants/routes';
import {
  ADMIN_SEARCH_COLUMN_IDS,
  type AdminSearchColumnId,
} from '@/pages/search/constants';
import { SearchResultsTableSortableHeader } from '@/pages/search/components/SearchResultsTableSortableHeader';
import type { SearchResultsPaginationModel } from '@/pages/search/hooks/useAdminSearchController';
import { ADMIN_SEARCH_COLUMN_DEFINITIONS } from '@/pages/search/searchDefinitions';
import type {
  AdminSearchResultRow,
  AdminSearchRouteState,
} from '@/pages/search/types';

interface UseSearchResultsTableParams {
  rows: AdminSearchResultRow[];
  visibleColumns: AdminSearchColumnId[];
  sort: AdminSearchRouteState['sort'];
  pagination: SearchResultsPaginationModel;
  isLoading: boolean;
  onSortChange: (sort: AdminSearchRouteState['sort']) => void;
}

const getSortParts = (sort: AdminSearchRouteState['sort']) => sort.split(':');

const buildColumnVisibility = (visibleColumns: AdminSearchColumnId[]) =>
  Object.fromEntries(
    ADMIN_SEARCH_COLUMN_IDS.map((columnId) => [
      columnId,
      visibleColumns.includes(columnId),
    ]),
  ) as Record<AdminSearchColumnId, boolean>;

const buildColumns = (
  sortField: string,
  sortDirection: string,
  onSortChange: (sort: AdminSearchRouteState['sort']) => void,
): ColumnDef<AdminSearchResultRow>[] =>
  ADMIN_SEARCH_COLUMN_DEFINITIONS.map(({ id, resultKey }) => ({
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
  }));

export function useSearchResultsTable({
  rows,
  visibleColumns,
  sort,
  pagination,
  isLoading,
  onSortChange,
}: UseSearchResultsTableParams) {
  const navigate = useNavigate();
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
      columnVisibility: buildColumnVisibility(visibleColumns),
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
