import { CheckboxDropdownField } from '@/components/form';
import {
  ADMIN_SEARCH_COLUMN_IDS,
  type AdminSearchColumnId,
} from '@/pages/search/constants';
import { ADMIN_SEARCH_COLUMN_LABELS } from '@/pages/search/searchDefinitions';

interface ColumnVisibilityMenuProps {
  visibleColumns: AdminSearchColumnId[];
  onToggle: (columnId: AdminSearchColumnId) => void;
}

export function ColumnVisibilityMenu({
  visibleColumns,
  onToggle,
}: ColumnVisibilityMenuProps) {
  const selectableColumnIds = ADMIN_SEARCH_COLUMN_IDS.filter(
    (columnId) => columnId !== 'rec_resource_id',
  );

  return (
    <CheckboxDropdownField
      items={selectableColumnIds.map((columnId) => ({
        value: columnId,
        label: ADMIN_SEARCH_COLUMN_LABELS[columnId],
      }))}
      selectedValues={visibleColumns}
      label="Columns"
      toggleVariant="light"
      toggleClassName="control-button d-flex align-items-center gap-2"
      onToggle={(columnId) => onToggle(columnId as AdminSearchColumnId)}
    />
  );
}
