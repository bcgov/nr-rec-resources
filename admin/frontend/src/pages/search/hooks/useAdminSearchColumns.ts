import { useState } from 'react';
import { type AdminSearchColumnId } from '@/pages/search/constants';
import {
  readAdminSearchVisibleColumns,
  writeAdminSearchVisibleColumns,
} from '@/pages/search/utils/storage';

function enforceRequiredColumns(columns: AdminSearchColumnId[]) {
  return columns.includes('rec_resource_id')
    ? columns
    : (['rec_resource_id', ...columns] as AdminSearchColumnId[]);
}

export function useAdminSearchColumns() {
  const [visibleColumns, setVisibleColumns] = useState<AdminSearchColumnId[]>(
    () => enforceRequiredColumns(readAdminSearchVisibleColumns()),
  );

  const updateVisibleColumns = (columns: AdminSearchColumnId[]) => {
    const nextColumns = enforceRequiredColumns(columns);
    setVisibleColumns(nextColumns);
    writeAdminSearchVisibleColumns(nextColumns);
  };

  return {
    visibleColumns,
    toggleColumn: (columnId: AdminSearchColumnId) => {
      if (columnId === 'rec_resource_id') {
        return;
      }

      const nextColumns = visibleColumns.includes(columnId)
        ? visibleColumns.filter((column) => column !== columnId)
        : [...visibleColumns, columnId];

      updateVisibleColumns(nextColumns);
    },
  };
}
