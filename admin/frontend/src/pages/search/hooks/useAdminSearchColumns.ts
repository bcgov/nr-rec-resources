import { useState } from 'react';
import {
  ensureRequiredSearchColumns,
  type AdminSearchColumnId,
} from '@/pages/search/searchDefinitions';
import {
  readAdminSearchVisibleColumns,
  writeAdminSearchVisibleColumns,
} from '@/pages/search/utils/storage';

export function useAdminSearchColumns() {
  const [visibleColumns, setVisibleColumns] = useState<AdminSearchColumnId[]>(
    () => ensureRequiredSearchColumns(readAdminSearchVisibleColumns()),
  );

  const updateVisibleColumns = (columns: AdminSearchColumnId[]) => {
    const nextColumns = ensureRequiredSearchColumns(columns);
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
