import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTableColumns } from '@fortawesome/free-solid-svg-icons';
import { CheckboxDropdownField } from '@/components/form';
import { ADMIN_SEARCH_COLUMN_IDS } from '@/pages/search/constants';
import {
  ADMIN_SEARCH_COLUMN_LABELS,
  FEATURE_FLAGGED_COLUMN_IDS,
  type AdminSearchColumnId,
} from '@/pages/search/searchDefinitions';
import { useAuthorizations } from '@/hooks/useAuthorizations';

interface ColumnVisibilityMenuProps {
  visibleColumns: AdminSearchColumnId[];
  onToggle: (columnId: AdminSearchColumnId) => void;
}

export function ColumnVisibilityMenu({
  visibleColumns,
  onToggle,
}: Readonly<ColumnVisibilityMenuProps>) {
  const { canViewFeatureFlag } = useAuthorizations();
  const selectableColumnIds = ADMIN_SEARCH_COLUMN_IDS.filter(
    (columnId) =>
      columnId !== 'rec_resource_id' &&
      (!FEATURE_FLAGGED_COLUMN_IDS.has(columnId) || canViewFeatureFlag),
  );

  return (
    <CheckboxDropdownField
      className="control-button"
      items={selectableColumnIds.map((columnId) => ({
        value: columnId,
        label: ADMIN_SEARCH_COLUMN_LABELS[columnId],
      }))}
      selectedValues={visibleColumns}
      label="Columns"
      icon={<FontAwesomeIcon icon={faTableColumns} aria-hidden="true" />}
      toggleStyle="button"
      onToggle={(columnId) => onToggle(columnId as AdminSearchColumnId)}
    />
  );
}
