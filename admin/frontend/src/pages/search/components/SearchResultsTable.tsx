import { flexRender } from '@tanstack/react-table';
import clsx from 'clsx';
import type { AdminSearchColumnId } from '@/pages/search/constants';
import type { SearchResultsPaginationModel } from '@/pages/search/hooks/useAdminSearchController';
import { useSearchResultsTable } from '@/pages/search/hooks/useSearchResultsTable';
import { useSearchResultsTableScroll } from '@/pages/search/hooks/useSearchResultsTableScroll';
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
  const { table, tableRows, statusMessage, getRowInteractionProps } =
    useSearchResultsTable({
      rows,
      visibleColumns,
      sort,
      pagination,
      isLoading,
      onSortChange,
    });
  const hasRows = tableRows.length > 0;

  const {
    wrapperRef,
    topScrollRef,
    topSpacerRef,
    viewportRef,
    tableRef,
    canScrollLeft,
    canScrollRight,
  } = useSearchResultsTableScroll(
    `${visibleColumns.join(',')}|${tableRows.length}|${isLoading}`,
  );

  return (
    <div
      ref={wrapperRef}
      className={clsx('search-results-table', {
        'search-results-table--scroll-left': canScrollLeft,
        'search-results-table--scroll-right': canScrollRight,
      })}
    >
      <div
        ref={topScrollRef}
        className="search-results-table__top-scroll"
        aria-hidden="true"
      >
        <div
          ref={topSpacerRef}
          className="search-results-table__top-scroll-spacer"
        />
      </div>

      <div className="search-results-table__body">
        <div ref={viewportRef} className="search-results-table__viewport">
          <table ref={tableRef} className="results-table">
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
            {hasRows ? (
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.id} {...getRowInteractionProps(row)}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`results-table__column results-table__column--${cell.column.id}`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ) : null}
          </table>
          {hasRows ? null : (
            <div className="search-results-table__status text-center text-muted">
              {statusMessage}
            </div>
          )}
        </div>

        <span
          className="search-results-table__fade search-results-table__fade--left"
          aria-hidden="true"
        />
        <span
          className="search-results-table__fade search-results-table__fade--freeze"
          aria-hidden="true"
        />
        <span
          className="search-results-table__fade search-results-table__fade--right"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
