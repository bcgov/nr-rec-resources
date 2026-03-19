import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS } from '@/pages/search/constants';
import { useAdminSearchColumns } from '@/pages/search/hooks/useAdminSearchColumns';
import {
  normalizeVisibleAdminSearchColumns,
  type AdminSearchColumnId,
} from '@/pages/search/searchDefinitions';
import {
  readAdminSearchDraftQuery,
  readAdminSearchFilterPanelOpen,
  readAdminSearchVisibleColumns,
  writeAdminSearchDraftQuery,
  writeAdminSearchFilterPanelOpen,
  writeAdminSearchVisibleColumns,
} from '@/pages/search/utils/storage';

describe('useAdminSearchColumns', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('restores stored columns, keeps the required id column, and persists updates', () => {
    window.sessionStorage.setItem(
      'admin-search-visible-columns',
      'name,district,invalid-column',
    );

    const { result } = renderHook(() => useAdminSearchColumns());

    expect(result.current.visibleColumns).toEqual([
      'rec_resource_id',
      'name',
      'district',
    ]);

    act(() => {
      result.current.toggleColumn('district');
    });
    expect(window.sessionStorage.getItem('admin-search-visible-columns')).toBe(
      'rec_resource_id,name',
    );

    act(() => {
      result.current.toggleColumn('rec_resource_id');
    });
    expect(window.sessionStorage.getItem('admin-search-visible-columns')).toBe(
      'rec_resource_id,name',
    );
  });
});

describe('admin search storage helpers', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('reads defaults and persists visible columns, filter panel state, and draft query', () => {
    expect(readAdminSearchVisibleColumns()).toEqual(
      DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS,
    );
    expect(readAdminSearchFilterPanelOpen()).toBe(false);
    expect(readAdminSearchDraftQuery()).toBe('');

    writeAdminSearchVisibleColumns(['rec_resource_id', 'name']);
    writeAdminSearchFilterPanelOpen(true);
    writeAdminSearchDraftQuery('ridge');

    expect(readAdminSearchVisibleColumns()).toEqual([
      'rec_resource_id',
      'name',
    ]);
    expect(readAdminSearchFilterPanelOpen()).toBe(true);
    expect(readAdminSearchDraftQuery()).toBe('ridge');
  });

  it('returns safe defaults when window storage is unavailable', () => {
    const windowSpy = vi
      .spyOn(globalThis, 'window', 'get')
      .mockReturnValue(undefined as never);

    expect(readAdminSearchVisibleColumns()).toEqual(
      DEFAULT_VISIBLE_ADMIN_SEARCH_COLUMNS,
    );
    expect(readAdminSearchFilterPanelOpen()).toBe(false);
    expect(readAdminSearchDraftQuery()).toBe('');

    writeAdminSearchVisibleColumns(['rec_resource_id', 'name']);
    writeAdminSearchFilterPanelOpen(true);
    writeAdminSearchDraftQuery('ridge');

    windowSpy.mockRestore();
  });
});

describe('normalizeVisibleAdminSearchColumns', () => {
  it('accepts arrays and comma-delimited values while restoring the required id column', () => {
    expect(
      normalizeVisibleAdminSearchColumns([
        'name,district',
        'defined_campsites',
        123,
      ]),
    ).toEqual([
      'rec_resource_id',
      'name',
      'district',
      'defined_campsites',
    ] satisfies AdminSearchColumnId[]);
  });
});
