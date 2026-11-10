import { useGetPendingMapFeatureRequests } from '@/services/hooks/recreation-resource-admin/useGetPendingMapFeatureRequests';
import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { RequestsPage } from '@/pages/requests-page/RequestsPage';

vi.mock('@/components', () => ({
  PageLayout: ({ children }: { children: ReactNode }) => (
    <div data-testid="page-layout">{children}</div>
  ),
  Table: ({ columns, rows, emptyMessage, getRowKey }: any) => (
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
            {rows.map((row: any, rowIndex: number) => (
              <tr
                key={getRowKey(row, rowIndex)}
                data-testid={`row-${row.rec_resource_id}`}
              >
                {columns.map((column: any, index: number) => (
                  <td key={index}>{column.render(row)}</td>
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

const mockRows = (rows: any[]) =>
  mockUseGetPendingMapFeatureRequests.mockReturnValue({
    data: { data: rows },
    isLoading: false,
    isError: false,
  });

const getRenderedIds = () =>
  screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).getByRole('link').textContent);

const clickSort = (name: RegExp) =>
  fireEvent.click(screen.getByRole('button', { name }));

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

  const buildManyRows = (count: number) =>
    Array.from({ length: count }, (_, index) => buildPendingRow(index + 1));

  beforeEach(() => {
    mockUseGetPendingMapFeatureRequests.mockReset();
  });

  describe('loading, error and empty states', () => {
    it('shows loading and error states when the query is not ready', () => {
      mockUseGetPendingMapFeatureRequests.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: true,
      });

      render(<RequestsPage />);

      expect(
        screen.getByText('Loading pending requests...'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Unable to load pending requests. Please refresh and try again.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('No pending requests found.'),
      ).toBeInTheDocument();
    });

    it('hides loading and error alerts when the query succeeds', () => {
      mockRows([sampleRow]);

      render(<RequestsPage />);

      expect(
        screen.queryByText('Loading pending requests...'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          'Unable to load pending requests. Please refresh and try again.',
        ),
      ).not.toBeInTheDocument();
    });

    it('shows the empty message and no pagination when there are no rows', () => {
      mockRows([]);

      render(<RequestsPage />);

      expect(
        screen.getByText('No pending requests found.'),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText('Next page')).not.toBeInTheDocument();
      expect(
        screen.queryByRole('combobox', { name: 'Page size' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('table rendering', () => {
    it('renders the request table and formats each column', () => {
      mockRows([sampleRow]);

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

    it('renders populated values and prefers the recreation district', () => {
      mockRows([
        buildPendingRow(1, {
          recreation_district: 'Primary district',
          district_description: 'Fallback district',
          geometry_types: ['Point', 'Polygon'],
        }),
      ]);

      render(<RequestsPage />);

      const cells = within(screen.getByTestId('row-REC0001')).getAllByRole(
        'cell',
      );
      expect(cells[1]).toHaveTextContent('Resource 1');
      expect(cells[2]).toHaveTextContent('Primary district');
      expect(cells[3]).toHaveTextContent('NRD');
      expect(cells[4]).toHaveTextContent('Site');
      expect(cells[5]).toHaveTextContent('Point, Polygon');
      expect(cells[6]).toHaveTextContent('1');
    });

    it('renders a dash for null values and a missing requested date', () => {
      mockRows([
        buildPendingRow(1, {
          name: null,
          natural_resource_district: null,
          recreation_type: null,
          requested_at: null,
        }),
      ]);

      render(<RequestsPage />);

      const cells = within(screen.getByTestId('row-REC0001')).getAllByRole(
        'cell',
      );
      expect(cells[1]).toHaveTextContent('-');
      expect(cells[3]).toHaveTextContent('-');
      expect(cells[4]).toHaveTextContent('-');
      expect(cells[7]).toHaveTextContent('-');
    });

    it('renders every row returned by the API without filtering', () => {
      mockRows([
        sampleRow,
        { ...sampleRow, rec_resource_id: 'REC002', submission_id: 42 },
      ]);

      render(<RequestsPage />);

      expect(screen.getByTestId('row-REC001')).toBeInTheDocument();
      expect(screen.getByTestId('row-REC002')).toBeInTheDocument();
    });
  });

  describe('sorting', () => {
    it('sorts by Rec # ascending then descending', () => {
      mockRows([
        buildPendingRow(1, { rec_resource_id: 'REC0100' }),
        buildPendingRow(2, { rec_resource_id: 'REC0002' }),
        buildPendingRow(3, { rec_resource_id: 'REC0020' }),
      ]);

      render(<RequestsPage />);

      const sortByRecNumber = screen.getByRole('button', {
        name: /Sort by Rec #/i,
      });

      fireEvent.click(sortByRecNumber);
      expect(getRenderedIds()).toEqual(['REC0002', 'REC0020', 'REC0100']);

      fireEvent.click(sortByRecNumber);
      expect(getRenderedIds()).toEqual(['REC0100', 'REC0020', 'REC0002']);
    });

    it('treats a missing Rec # as an empty string when sorting', () => {
      mockRows([
        buildPendingRow(1, { rec_resource_id: 'REC_B' }),
        buildPendingRow(2, { rec_resource_id: undefined }),
        buildPendingRow(3, { rec_resource_id: 'REC_A' }),
      ]);

      render(<RequestsPage />);

      clickSort(/Sort by Rec #/i);
      expect(getRenderedIds()).toEqual(['', 'REC_A', 'REC_B']);
    });

    it('sorts by requested date descending first, then ascending', () => {
      mockRows([
        buildPendingRow(1, {
          rec_resource_id: 'REC_A',
          requested_at: '2026-10-01T00:00:00Z',
        }),
        buildPendingRow(2, {
          rec_resource_id: 'REC_B',
          requested_at: '2026-10-03T00:00:00Z',
        }),
        buildPendingRow(3, {
          rec_resource_id: 'REC_C',
          requested_at: '2026-10-02T00:00:00Z',
        }),
      ]);

      render(<RequestsPage />);

      const sortByRequestedAt = screen.getByRole('button', {
        name: /Sort by Requested at/i,
      });

      fireEvent.click(sortByRequestedAt);
      expect(getRenderedIds()).toEqual(['REC_B', 'REC_C', 'REC_A']);

      fireEvent.click(sortByRequestedAt);
      expect(getRenderedIds()).toEqual(['REC_A', 'REC_C', 'REC_B']);
    });

    it('treats a missing requested date as the oldest when sorting', () => {
      mockRows([
        buildPendingRow(1, {
          rec_resource_id: 'REC_A',
          requested_at: '2026-10-01T00:00:00Z',
        }),
        buildPendingRow(2, { rec_resource_id: 'REC_B', requested_at: null }),
        buildPendingRow(3, {
          rec_resource_id: 'REC_C',
          requested_at: '2026-10-02T00:00:00Z',
        }),
      ]);

      render(<RequestsPage />);

      clickSort(/Sort by Requested at/i);
      expect(getRenderedIds()).toEqual(['REC_C', 'REC_A', 'REC_B']);
    });

    it('sorts by feature count numerically and treats missing as zero', () => {
      mockRows([
        buildPendingRow(1, { rec_resource_id: 'REC_F1', feature_count: 10 }),
        buildPendingRow(2, {
          rec_resource_id: 'REC_F2',
          feature_count: undefined,
        }),
        buildPendingRow(3, { rec_resource_id: 'REC_F3', feature_count: 2 }),
      ]);

      render(<RequestsPage />);

      const sortByFeatures = screen.getByRole('button', {
        name: /Sort by Features/i,
      });

      fireEvent.click(sortByFeatures);
      expect(getRenderedIds()).toEqual(['REC_F2', 'REC_F3', 'REC_F1']);

      fireEvent.click(sortByFeatures);
      expect(getRenderedIds()).toEqual(['REC_F1', 'REC_F3', 'REC_F2']);
    });

    it('treats missing text values as empty strings when sorting', () => {
      mockRows([
        buildPendingRow(1, { rec_resource_id: 'REC_N1', name: 'Beta' }),
        buildPendingRow(2, { rec_resource_id: 'REC_N2', name: undefined }),
        buildPendingRow(3, { rec_resource_id: 'REC_N3', name: 'Alpha' }),
      ]);

      render(<RequestsPage />);

      clickSort(/Sort by Name/i);
      expect(getRenderedIds()).toEqual(['REC_N2', 'REC_N3', 'REC_N1']);
    });

    it('sorts by fallback district and geometry type values', () => {
      mockRows([
        buildPendingRow(1, {
          rec_resource_id: 'REC_G1',
          recreation_district: undefined,
          district_description: 'District Z',
          geometry_types: ['Polygon'],
        }),
        buildPendingRow(2, {
          rec_resource_id: 'REC_G2',
          recreation_district: undefined,
          district_description: 'District A',
          geometry_types: ['LineString'],
        }),
      ]);

      render(<RequestsPage />);

      clickSort(/Sort by Recreation district/i);
      expect(getRenderedIds()).toEqual(['REC_G2', 'REC_G1']);

      clickSort(/Sort by Geometry type/i);
      expect(getRenderedIds()).toEqual(['REC_G2', 'REC_G1']);
    });

    it('sorts by natural resource district and recreation type', () => {
      mockRows([
        buildPendingRow(1, {
          rec_resource_id: 'REC_X1',
          natural_resource_district: 'Zeta',
          recreation_type: 'Trail',
        }),
        buildPendingRow(2, {
          rec_resource_id: 'REC_X2',
          natural_resource_district: 'Alpha',
          recreation_type: 'Site',
        }),
      ]);

      render(<RequestsPage />);

      clickSort(/Sort by Natural resource district/i);
      expect(getRenderedIds()).toEqual(['REC_X2', 'REC_X1']);

      clickSort(/Sort by Recreation type/i);
      expect(getRenderedIds()).toEqual(['REC_X2', 'REC_X1']);
    });

    it('updates the sort button label as the direction changes', () => {
      mockRows([buildPendingRow(1), buildPendingRow(2)]);

      render(<RequestsPage />);

      expect(
        screen.getByRole('button', {
          name: 'Sort by Name (not sorted, next asc)',
        }),
      ).toBeInTheDocument();

      clickSort(/Sort by Name/i);
      expect(
        screen.getByRole('button', {
          name: 'Sort by Name (ascending, next desc)',
        }),
      ).toBeInTheDocument();

      clickSort(/Sort by Name/i);
      expect(
        screen.getByRole('button', {
          name: 'Sort by Name (descending, next asc)',
        }),
      ).toBeInTheDocument();
    });

    it('returns to the first page when the sort changes', () => {
      mockRows(buildManyRows(60));

      render(<RequestsPage />);

      fireEvent.click(screen.getByLabelText('Next page'));
      expect(screen.getByTestId('row-REC0026')).toBeInTheDocument();

      clickSort(/Sort by Rec #/i);
      expect(screen.getByTestId('row-REC0001')).toBeInTheDocument();
      expect(screen.queryByTestId('row-REC0026')).not.toBeInTheDocument();
    });
  });

  describe('pagination', () => {
    it('renders pagination controls and can page, resize, and jump', () => {
      mockRows(buildManyRows(80));

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

    it('shows all page numbers without ellipsis when there are 7 pages or fewer', () => {
      mockRows(buildManyRows(80));

      render(<RequestsPage />);

      expect(screen.queryByLabelText('More')).not.toBeInTheDocument();
      ['1', '2', '3', '4'].forEach((name) => {
        expect(screen.getByRole('button', { name })).toBeInTheDocument();
      });
    });

    it('shows a single trailing ellipsis on the first page of many', () => {
      mockRows(buildManyRows(176));

      render(<RequestsPage />);

      expect(screen.getAllByLabelText('More')).toHaveLength(1);
    });

    it('shows ellipsis on both sides when in the middle pages', () => {
      mockRows(buildManyRows(176));

      render(<RequestsPage />);

      const next = screen.getByLabelText('Next page');
      fireEvent.click(next);
      fireEvent.click(next);
      fireEvent.click(next);

      expect(screen.getByTestId('row-REC0076')).toBeInTheDocument();
      expect(screen.getAllByLabelText('More')).toHaveLength(2);
    });

    it('shows a single leading ellipsis on the last pages and disables next', () => {
      mockRows(buildManyRows(176));

      render(<RequestsPage />);

      fireEvent.change(screen.getByRole('combobox', { name: 'Jump to' }), {
        target: { value: '8' },
      });

      expect(screen.getByTestId('row-REC0176')).toBeInTheDocument();
      expect(screen.getAllByLabelText('More')).toHaveLength(1);
      expect(screen.getByLabelText('Next page')).toHaveAttribute(
        'aria-disabled',
        'true',
      );
    });

    it('can jump to a page item and navigate back with previous', () => {
      mockRows(buildManyRows(120));

      render(<RequestsPage />);

      fireEvent.click(screen.getByRole('button', { name: '3' }));
      expect(screen.getByTestId('row-REC0051')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Previous page'));
      expect(screen.getByTestId('row-REC0026')).toBeInTheDocument();
    });

    it('disables previous on the first page and does not go below it', () => {
      mockRows(buildManyRows(60));

      render(<RequestsPage />);

      const previous = screen.getByLabelText('Previous page');
      expect(previous).toHaveAttribute('aria-disabled', 'true');

      fireEvent.click(previous);
      expect(screen.getByTestId('row-REC0001')).toBeInTheDocument();
    });
  });
});
