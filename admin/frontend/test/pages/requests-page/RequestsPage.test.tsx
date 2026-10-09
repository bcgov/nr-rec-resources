import { RequestsPage } from '@/pages/requests-page/RequestsPage';
import { useGetPendingMapFeatureRequests } from '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Mock, describe, expect, it, vi } from 'vitest';

vi.mock('@/components', () => ({
  PageLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  Table: ({ columns, rows, emptyMessage }: any) => (
    <div data-testid="data-table">
      {rows.length ? (
        <table>
          <tbody>
            {rows.map((row: any) => (
              <tr
                key={row.rec_resource_id}
                data-testid={`row-${row.rec_resource_id}`}
              >
                {columns.map((column: any, index: number) => (
                  <td key={index} data-testid={`cell-${column.header}`}>
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
    amend_status_code: 'NEW',
    geometry_types: [],
    feature_count: 2,
    requested_at: '2026-10-07T10:30:00Z',
  };

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
    expect(screen.getByTestId('cell-Rec #').querySelector('a')).toHaveAttribute(
      'href',
      '/rec-resource/$id/geospatial',
    );
    expect(screen.getByTestId('cell-Rec #').querySelector('a')).toHaveAttribute(
      'data-params',
      JSON.stringify({ id: 'REC001' }),
    );
    expect(screen.getByTestId('cell-Name')).toHaveTextContent('-');
    expect(screen.getByTestId('cell-Recreation District')).toHaveTextContent(
      'District description',
    );
    expect(
      screen.getByTestId('cell-Natural Resource District'),
    ).toHaveTextContent('-');
    expect(screen.getByTestId('cell-Recreation type')).toHaveTextContent('-');
    expect(screen.getByTestId('cell-Status')).toHaveTextContent('NEW');
    expect(screen.getByTestId('cell-Geometry Type')).toHaveTextContent('-');
    expect(screen.getByTestId('cell-Features')).toHaveTextContent('2');
    expect(screen.getByTestId('cell-Requested At')).toHaveTextContent(
      '2026-10-07',
    );
  });
});
