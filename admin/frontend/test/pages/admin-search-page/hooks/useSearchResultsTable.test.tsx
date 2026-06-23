import { act, render, renderHook, screen } from '@testing-library/react';
import type { KeyboardEvent, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchResultsTable } from '@/pages/search/hooks/useSearchResultsTable';
import type { AdminSearchResultRow } from '@/pages/search/types';

const mockNavigate = vi.fn();
const mockUseAuthorizations = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

function createPagination(pageIndex = 0) {
  return {
    state: { pageIndex, pageSize: 25 },
    pageCount: 3,
    rowCount: 55,
    canPreviousPage: pageIndex > 0,
    canNextPage: pageIndex < 2,
    pageSizeOptions: [25, 50, 100],
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
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
    status: 'Open',
    statusCode: 1,
    visible: true,
    publicAccessStatus: 'Restricted',
    recStatusCode: 'AR',
    recStatusDescription: 'Archived',
  },
];

describe('useSearchResultsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthorizations.mockReturnValue({ canViewFeatureFlag: false });
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
    } as unknown as KeyboardEvent<HTMLTableRowElement>);
    interactionProps.onKeyDown({
      key: ' ',
      preventDefault,
    } as unknown as KeyboardEvent<HTMLTableRowElement>);

    expect(preventDefault).toHaveBeenCalledTimes(2);
    expect(mockNavigate).toHaveBeenCalledTimes(3);
    expect(mockNavigate).toHaveBeenNthCalledWith(1, {
      to: '/rec-resource/$id',
      params: { id: 'REC001' },
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(2, {
      to: '/rec-resource/$id',
      params: { id: 'REC001' },
    });
    expect(mockNavigate).toHaveBeenNthCalledWith(3, {
      to: '/rec-resource/$id',
      params: { id: 'REC001' },
    });
  });

  it('shows feature-flagged public access columns when authorized and renders the badge cell', () => {
    mockUseAuthorizations.mockReturnValue({ canViewFeatureFlag: true });

    const { result } = renderHook(() =>
      useSearchResultsTable({
        rows,
        visibleColumns: ['rec_resource_id', 'public_access_status'],
        sort: 'name:asc',
        pagination: createPagination(),
        isLoading: false,
        onSortChange: vi.fn(),
      }),
    );

    expect(
      result.current.visibleLeafColumns.map((column) => column.id),
    ).toContain('public_access_status');

    const columnsById = Object.fromEntries(
      result.current.table
        .getAllColumns()
        .map((column) => [column.id, column.columnDef]),
    );
    const nameHeader = columnsById.name.header as () => ReactNode;
    const nameCell = columnsById.name.cell as (props: unknown) => ReactNode;
    const statusCell = columnsById.status.cell as (props: unknown) => ReactNode;
    const fileStatusCell = columnsById.file_status.cell as (
      props: unknown,
    ) => ReactNode;
    const visibleCell = columnsById.display_on_public_site.cell as (
      props: unknown,
    ) => ReactNode;
    const publicAccessCell = columnsById.public_access_status.cell as (
      props: unknown,
    ) => ReactNode;

    render(
      <table>
        <thead>
          <tr>
            <th>{nameHeader()}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{nameCell({ row: { original: rows[0] } })}</td>
            <td>{statusCell({ row: { original: rows[0] } })}</td>
            <td>{fileStatusCell({ row: { original: rows[0] } })}</td>
            <td>{visibleCell({ row: { original: rows[0] } })}</td>
            <td>{publicAccessCell({ row: { original: rows[0] } })}</td>
          </tr>
        </tbody>
      </table>,
    );

    expect(
      screen.getByRole('button', { name: 'Sort by Name (ascending)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Blue Lake')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();
    expect(screen.getByText('Visible')).toBeInTheDocument();
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });
});
