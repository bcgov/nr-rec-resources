import { flexRender } from '@tanstack/react-table';
import type { AdminSearchColumnId } from '@/pages/search/constants';
import type { SearchResultsPaginationModel } from '@/pages/search/hooks/useAdminSearchController';
import { useSearchResultsTable } from '@/pages/search/hooks/useSearchResultsTable';
import type {
  AdminSearchResultRow,
  AdminSearchRouteState,
} from '@/pages/search/types';
import './SearchResultsTable.scss';

interface SearchResultsTableProps {
  rows: AdminSearchResultRow[];
  visibleColumns: AdminSearchColumnId[];
  sort: AdminSearchRouteState['sort'];
  pagination: SearchResultsPaginationModel;
  isLoading: boolean;
  onSortChange: (sort: AdminSearchRouteState['sort']) => void;
}

export const SearchResultsTable = ({
  rows,
  visibleColumns,
  sort,
  pagination,
  isLoading,
  onSortChange,
}: SearchResultsTableProps) => {
  const {
    table,
    tableRows,
    visibleLeafColumns,
    statusMessage,
    getRowInteractionProps,
  } = useSearchResultsTable({
    rows,
    visibleColumns,
    sort,
    pagination,
    isLoading,
    onSortChange,
  });

  return (
    <div className="search-results-table">
      <table className="results-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={`results-table__column results-table__column--${header.column.id}`}
                >
                  <div className="results-table__header">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {tableRows.length > 0 ? (
            tableRows.map((row) => (
              <tr key={row.id} {...getRowInteractionProps(row)}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`results-table__column results-table__column--${cell.column.id}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={visibleLeafColumns.length || 1}
                className="text-center text-muted py-4"
              >
                {statusMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
