import {
  ADMIN_SEARCH_STORAGE_KEYS,
  DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS,
} from '@/pages/search/constants';
import {
  normalizeVisibleAdminSearchColumns,
  type AdminSearchColumnId,
} from '@/pages/search/searchDefinitions';

// Utils to read and save session storage for the Search page

function getSessionStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
}

export function readAdminSearchVisibleColumns(): AdminSearchColumnId[] {
  const storage = getSessionStorage();
  const rawValue = storage?.getItem(ADMIN_SEARCH_STORAGE_KEYS.columnVisibility);

  if (!rawValue) {
    return DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS;
  }

  return normalizeVisibleAdminSearchColumns(rawValue);
}

export function writeAdminSearchVisibleColumns(columns: AdminSearchColumnId[]) {
  const storage = getSessionStorage();
  storage?.setItem(
    ADMIN_SEARCH_STORAGE_KEYS.columnVisibility,
    columns.join(','),
  );
}

export function readAdminSearchFilterPanelOpen(): boolean {
  const storage = getSessionStorage();
  return storage?.getItem(ADMIN_SEARCH_STORAGE_KEYS.filterPanelOpen) === 'true';
}

export function writeAdminSearchFilterPanelOpen(isOpen: boolean) {
  const storage = getSessionStorage();
  storage?.setItem(
    ADMIN_SEARCH_STORAGE_KEYS.filterPanelOpen,
    isOpen ? 'true' : 'false',
  );
}

export function readAdminSearchDraftQuery() {
  const storage = getSessionStorage();
  return storage?.getItem(ADMIN_SEARCH_STORAGE_KEYS.draftQuery) ?? '';
}

export function writeAdminSearchDraftQuery(query: string) {
  const storage = getSessionStorage();
  storage?.setItem(ADMIN_SEARCH_STORAGE_KEYS.draftQuery, query);
}
