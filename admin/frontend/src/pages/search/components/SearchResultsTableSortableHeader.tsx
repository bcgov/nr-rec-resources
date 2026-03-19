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

function getSortPresentation(direction?: string) {
  switch (direction) {
    case 'asc':
      return { label: 'ascending', indicator: '↑' };
    case 'desc':
      return { label: 'descending', indicator: '↓' };
    default:
      return { label: 'not sorted', indicator: '↕' };
  }
}

export function SearchResultsTableSortableHeader({
  columnId,
  sortField,
  sortDirection,
  onSortChange,
}: Readonly<SearchResultsTableSortableHeaderProps>) {
  const sortKey = ADMIN_SEARCH_SORTABLE_COLUMNS[columnId];

  if (!sortKey) {
    return ADMIN_SEARCH_COLUMN_LABELS[columnId];
  }

  const activeSortDirection = sortField === sortKey ? sortDirection : undefined;
  const nextSort = `${sortKey}:${
    activeSortDirection === 'asc' ? 'desc' : 'asc'
  }` as AdminSearchRouteState['sort'];
  const { label: sortLabel, indicator: sortIndicator } =
    getSortPresentation(activeSortDirection);

  return (
    <button
      type="button"
      className="results-table__sort"
      onClick={() => onSortChange(nextSort)}
      aria-label={`Sort by ${ADMIN_SEARCH_COLUMN_LABELS[columnId]} (${sortLabel})`}
    >
      <span>{ADMIN_SEARCH_COLUMN_LABELS[columnId]}</span>
      <span aria-hidden="true">{sortIndicator}</span>
    </button>
  );
}
