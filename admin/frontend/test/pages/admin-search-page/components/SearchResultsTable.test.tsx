import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SearchResultsTable } from '@/pages/search/components/SearchResultsTable';
import { AdminSearchResultRow } from '@/pages/search/types';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function createPagination() {
  return {
    state: { pageIndex: 0, pageSize: 25 },
    pageCount: 1,
    rowCount: 1,
    canPreviousPage: false,
    canNextPage: false,
    setPageIndex: vi.fn(),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
  };
}

describe('SearchResultsTable', () => {
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
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders only the visible columns', () => {
    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={[
          'rec_resource_id',
          'name',
          'defined_campsites',
          'closest_community',
          'status',
        ]}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /sort by rec #/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sort by name/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sort by defined campsites/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sort by closest community/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sort by status/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Type' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Blue Lake')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('Hope')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('renders status as a badge in the status column', () => {
    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={['rec_resource_id', 'status']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={vi.fn()}
      />,
    );

    const statusCell = screen.getByText('Open');
    expect(statusCell.tagName).toBe('SPAN');
    expect(statusCell).toHaveClass('custom-badge');
  });

  it('emits the next sort when a sortable header is clicked', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={['rec_resource_id', 'name']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /sort by name/i }));

    expect(onSortChange).toHaveBeenCalledWith('name:desc');
  });

  it('emits the next sort for defined campsites', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={['rec_resource_id', 'defined_campsites']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={onSortChange}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: /sort by defined campsites/i }),
    );

    expect(onSortChange).toHaveBeenCalledWith('campsites:asc');
  });

  it('emits the next sort for recreation resource type', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={['rec_resource_id', 'recreation_resource_type']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /sort by type/i }));

    expect(onSortChange).toHaveBeenCalledWith('type:asc');
  });

  it('emits the next sort for status', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();

    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={['rec_resource_id', 'status']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: /sort by status/i }));

    expect(onSortChange).toHaveBeenCalledWith('status:asc');
  });

  it('renders a blank defined campsites cell when the count is zero', () => {
    render(
      <SearchResultsTable
        rows={[
          {
            ...rows[0],
            recResourceId: 'REC002',
            definedCampsites: '',
          },
        ]}
        visibleColumns={['rec_resource_id', 'defined_campsites']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={vi.fn()}
      />,
    );

    const cells = screen.getAllByRole('cell');
    expect(cells).toHaveLength(2);
    expect(cells[1]).toBeEmptyDOMElement();
  });

  it('keeps the table shell and shows a loading row during initial load', () => {
    render(
      <SearchResultsTable
        rows={[]}
        visibleColumns={[
          'rec_resource_id',
          'name',
          'defined_campsites',
          'closest_community',
        ]}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={true}
        onSortChange={vi.fn()}
      />,
    );

    expect(screen.getAllByRole('columnheader')).toHaveLength(4);
    expect(screen.getByText('Loading results...')).toBeInTheDocument();
  });

  it('shows the empty-state row when the fetch resolves with no records', () => {
    render(
      <SearchResultsTable
        rows={[]}
        visibleColumns={[
          'rec_resource_id',
          'name',
          'defined_campsites',
          'closest_community',
        ]}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText('No resources match the current search state.'),
    ).toBeInTheDocument();
  });

  it('navigates to the resource page from the row click target', async () => {
    const user = userEvent.setup();

    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={['rec_resource_id', 'name']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole('link', { name: 'Open resource REC001' }),
    );

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/rec-resource/$id',
      params: { id: 'REC001' },
    });
  });

  it('navigates to the resource page from the keyboard on the row', async () => {
    const user = userEvent.setup();

    render(
      <SearchResultsTable
        rows={rows}
        visibleColumns={['rec_resource_id', 'name']}
        sort="name:asc"
        pagination={createPagination()}
        isLoading={false}
        onSortChange={vi.fn()}
      />,
    );

    const rowLink = screen.getByRole('link', { name: 'Open resource REC001' });
    rowLink.focus();
    await user.keyboard('{Enter}');

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/rec-resource/$id',
      params: { id: 'REC001' },
    });
  });
});
