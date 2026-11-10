import { useGetPendingMapFeatureRequests } from '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { isValidElement, type ReactNode } from 'react';
import { Mock, describe, expect, it, vi } from 'vitest';
import { RequestsPage } from '@/pages/requests-page/RequestsPage';

const getHeaderLabel = (header: unknown, fallbackIndex: number) => {
  if (typeof header === 'string') {
    return header;
  }

  if (isValidElement(header)) {
    const children = header.props?.children;
    if (Array.isArray(children) && typeof children[0] === 'string') {
      return children[0];
    }
  }

  return `col-${fallbackIndex}`;
};

vi.mock('@/components', () => ({
  PageLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  Table: ({ columns, rows, emptyMessage }: any) => (
    <div data-testid="data-table">
      {rows.length ? (
        <table>
          <thead>
            <tr>
              {columns.map((column: any, index: number) => (
                <th key={`header-${index}`}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr
                key={row.rec_resource_id}
                data-testid={`row-${row.rec_resource_id}`}
              >
                {columns.map((column: any, index: number) => (
                  <td
                    key={index}
                    data-testid={`cell-${getHeaderLabel(column.header, index)}`}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>{emptyMessage}</div>
      )}
    </div>
  ),
}));

vi.mock('@shared/index', () => ({
  Breadcrumbs: () => <nav data-testid="breadcrumbs" />,
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ to, params, children }: any) => (
    <a href={to} data-params={JSON.stringify(params)}>
      {children}
    </a>
  ),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests',
  () => ({
    useGetPendingMapFeatureRequests: vi.fn(),
  }),
);

const mockUseGetPendingMapFeatureRequests =
  useGetPendingMapFeatureRequests as Mock;

describe('RequestsPage', () => {
  const sampleRow = {
    rec_resource_id: 'REC001',
    name: '',
    recreation_district: '',
    district_description: 'District description',
    natural_resource_district: undefined,
    recreation_type: undefined,
    amend_status_code: 'PND',
    geometry_types: [],
    feature_count: 2,
    requested_at: '2026-10-07T10:30:00Z',
  };

  const buildPendingRow = (
    index: number,
    overrides: Record<string, any> = {},
  ) => ({
    rec_resource_id: `REC${String(index).padStart(4, '0')}`,
    name: `Resource ${index}`,
    recreation_district: 'District A',
    district_description: 'District A',
    natural_resource_district: 'NRD',
    recreation_type: 'Site',
    amend_status_code: 'PND',
    geometry_types: ['Point'],
    feature_count: index,
    requested_at: `2026-10-${String((index % 28) + 1).padStart(2, '0')}T10:00:00Z`,
    ...overrides,
  });

  it('shows loading and error states when the pending requests query is not ready', () => {
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: true,
    });

    render(<RequestsPage />);

    expect(screen.getByText('Loading pending requests...')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Unable to load pending requests. Please refresh and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('renders the request table and formats each column', () => {
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: { data: [sampleRow] },
      isLoading: false,
      isError: false,
    });

    render(<RequestsPage />);

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
    const row = screen.getByTestId('row-REC001');
    const link = within(row).getByRole('link', { name: 'REC001' });

    expect(link).toHaveAttribute('href', '/rec-resource/$id/geospatial');
    expect(link).toHaveAttribute(
      'data-params',
      JSON.stringify({ id: 'REC001' }),
    );

    const cells = within(row).getAllByRole('cell');
    expect(cells[1]).toHaveTextContent('-');
    expect(cells[2]).toHaveTextContent('District description');
    expect(cells[3]).toHaveTextContent('-');
    expect(cells[4]).toHaveTextContent('-');
    expect(cells[5]).toHaveTextContent('-');
    expect(cells[6]).toHaveTextContent('2');
    expect(cells[7]).toHaveTextContent('2026-10-07');
  });

  it('shows only pending rows when API includes non-pending statuses', () => {
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: [
          sampleRow,
          {
            ...sampleRow,
            rec_resource_id: 'REC002',
            amend_status_code: 'APP',
          },
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<RequestsPage />);

    expect(screen.getByTestId('row-REC001')).toBeInTheDocument();
    expect(screen.queryByTestId('row-REC002')).not.toBeInTheDocument();
  });

  it('sorts rows when sortable headers are clicked', () => {
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: [
          buildPendingRow(1, { rec_resource_id: 'REC0100' }),
          buildPendingRow(2, { rec_resource_id: 'REC0002' }),
          buildPendingRow(3, { rec_resource_id: 'REC0020' }),
        ],
      },
      isLoading: false,
      isError: false,
    });

    render(<RequestsPage />);

    const getRenderedIds = () =>
      screen
        .getAllByRole('row')
        .slice(1)
        .map((row) => within(row).getByRole('link').textContent);

    const sortByRecNumber = screen.getByRole('button', {
      name: /Sort by Rec #/i,
    });

    fireEvent.click(sortByRecNumber);
    expect(getRenderedIds()).toEqual(['REC0002', 'REC0020', 'REC0100']);

    fireEvent.click(sortByRecNumber);
    expect(getRenderedIds()).toEqual(['REC0100', 'REC0020', 'REC0002']);
  });

  it('renders pagination controls and can page, resize, and jump', () => {
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: Array.from({ length: 80 }, (_, index) =>
          buildPendingRow(index + 1),
        ),
      },
      isLoading: false,
      isError: false,
    });

    render(<RequestsPage />);

    expect(screen.getByTestId('row-REC0001')).toBeInTheDocument();
    expect(screen.queryByTestId('row-REC0026')).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Next page'));
    expect(screen.getByTestId('row-REC0026')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Page size' }), {
      target: { value: '10' },
    });
    expect(screen.getByTestId('row-REC0001')).toBeInTheDocument();
    expect(screen.queryByTestId('row-REC0011')).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('combobox', { name: 'Jump to' }), {
      target: { value: '4' },
    });
    expect(screen.getByTestId('row-REC0031')).toBeInTheDocument();
  });

  it('shows ellipsis pagination for high page counts', () => {
    mockUseGetPendingMapFeatureRequests.mockReturnValue({
      data: {
        data: Array.from({ length: 176 }, (_, index) =>
          buildPendingRow(index + 1),
        ),
      },
      isLoading: false,
      isError: false,
    });

    render(<RequestsPage />);

    expect(screen.getAllByLabelText('More').length).toBeGreaterThan(0);
  });
});
