import { act, renderHook } from '@testing-library/react';
import type { KeyboardEvent } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchResultsTable } from '@/pages/search/hooks/useSearchResultsTable';
import type { AdminSearchResultRow } from '@/pages/search/types';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function createPagination(pageIndex = 0) {
  return {
    state: { pageIndex, pageSize: 25 },
    pageCount: 3,
    rowCount: 55,
    canPreviousPage: pageIndex > 0,
    canNextPage: pageIndex < 2,
    setPageIndex: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
  };
}

const rows: AdminSearchResultRow[] = [
  {
    recResourceId: 'REC001',
    projectName: 'Blue Lake',
    recreationResourceType: 'Recreation site',
    district: 'Chilliwack',
    establishmentDate: '2024-06-10',
    accessType: 'Walk in',
    feeType: 'Reservable, Has fees',
    definedCampsites: '3',
    closestCommunity: 'Hope',
  },
];

describe('useSearchResultsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the visible columns and loading or empty status message', () => {
    const pagination = createPagination();
    const { result, rerender } = renderHook(
      ({
        tableRows,
        isLoading,
      }: {
        tableRows: AdminSearchResultRow[];
        isLoading: boolean;
      }) =>
        useSearchResultsTable({
          rows: tableRows,
          visibleColumns: [
            'rec_resource_id',
            'name',
            'defined_campsites',
            'closest_community',
          ],
          sort: 'name:asc',
          pagination,
          isLoading,
          onSortChange: vi.fn(),
        }),
      {
        initialProps: {
          tableRows: rows,
          isLoading: true,
        },
      },
    );

    expect(
      result.current.visibleLeafColumns.map((column) => column.id),
    ).toEqual([
      'rec_resource_id',
      'name',
      'closest_community',
      'defined_campsites',
    ]);
    expect(result.current.statusMessage).toBe('Loading results...');

    rerender({
      tableRows: [],
      isLoading: false,
    });

    expect(result.current.tableRows).toHaveLength(0);
    expect(result.current.statusMessage).toBe(
      'No resources match the current search state.',
    );
  });

  it('bridges pagination updates and row interactions', () => {
    const pagination = createPagination();
    const { result } = renderHook(() =>
      useSearchResultsTable({
        rows,
        visibleColumns: ['rec_resource_id', 'name'],
        sort: 'name:asc',
        pagination,
        isLoading: false,
        onSortChange: vi.fn(),
      }),
    );

    act(() => {
      result.current.table.setPageIndex(1);
      result.current.table.setPageIndex(0);
    });

    expect(pagination.setPageIndex).toHaveBeenCalledTimes(1);
    expect(pagination.setPageIndex).toHaveBeenCalledWith(1);

    const row = result.current.tableRows[0];
    const interactionProps = result.current.getRowInteractionProps(row);
    const preventDefault = vi.fn();

    interactionProps.onClick();
    interactionProps.onKeyDown({
      key: 'Enter',
      preventDefault,
    } as KeyboardEvent<HTMLTableRowElement>);

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/rec-resource/$id',
      params: { id: 'REC001' },
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(2, {
      to: '/rec-resource/$id',
      params: { id: 'REC001' },
    });
  });
});
