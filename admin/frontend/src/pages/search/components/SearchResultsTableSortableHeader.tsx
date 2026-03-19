import {
  ADMIN_SEARCH_COLUMN_LABELS,
  ADMIN_SEARCH_SORTABLE_COLUMNS,
  type AdminSearchColumnId,
} from '@/pages/search/searchDefinitions';
import type { AdminSearchRouteState } from '@/pages/search/types';

interface SearchResultsTableSortableHeaderProps {
  columnId: AdminSearchColumnId;
  sortField: string;
  sortDirection: string;
  onSortChange: (sort: AdminSearchRouteState['sort']) => void;
}

export function SearchResultsTableSortableHeader({
  columnId,
  sortField,
  sortDirection,
  onSortChange,
}: SearchResultsTableSortableHeaderProps) {
  const sortKey = ADMIN_SEARCH_SORTABLE_COLUMNS[columnId];

  if (!sortKey) {
    return ADMIN_SEARCH_COLUMN_LABELS[columnId];
  }

  const nextSort = `${sortKey}:${
    sortField === sortKey && sortDirection === 'asc' ? 'desc' : 'asc'
  }` as AdminSearchRouteState['sort'];
  const sortLabel =
    sortField === sortKey
      ? sortDirection === 'asc'
        ? 'ascending'
        : 'descending'
      : 'not sorted';

  return (
    <button
      type="button"
      className="results-table__sort"
      onClick={() => onSortChange(nextSort)}
      aria-label={`Sort by ${ADMIN_SEARCH_COLUMN_LABELS[columnId]} (${sortLabel})`}
    >
      <span>{ADMIN_SEARCH_COLUMN_LABELS[columnId]}</span>
      <span aria-hidden="true">
        {sortField === sortKey ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </button>
  );
}
