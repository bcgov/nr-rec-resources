import { RecResourceFeesTable } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable';
import { RecreationFeeUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/contexts/feature-flags', () => ({
  useFeatureFlagsEnabled: vi.fn(),
}));

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components', () => ({
  CustomBadge: ({ label }: any) => (
    <span data-testid="custom-badge">{label}</span>
  ),
  Table: ({ columns, rows, emptyMessage, getRowKey }: any) => {
    if (rows.length === 0) {
      return <div>{emptyMessage}</div>;
    }
    return (
      <table>
        <thead>
          <tr>
            {columns.map((col: any, idx: number) => (
              <th key={idx}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any) => (
            <tr key={getRowKey(row)}>
              {columns.map((col: any, colIdx: number) => (
                <td key={colIdx} data-testid={`cell-${colIdx}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/helpers',
  () => ({
    getIndividualDays: (fee: any) => {
      const days: string[] = [];
      if (fee.monday_ind) days.push('Mon');
      if (fee.tuesday_ind) days.push('Tue');
      if (fee.wednesday_ind) days.push('Wed');
      if (fee.thursday_ind) days.push('Thu');
      if (fee.friday_ind) days.push('Fri');
      if (fee.saturday_ind) days.push('Sat');
      if (fee.sunday_ind) days.push('Sun');
      if (days.length === 7) return ['All days'];
      return days;
    },
  }),
);

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="fa-icon">{icon.iconName}</span>
  ),
}));

import { useFeatureFlagsEnabled } from '@/contexts/feature-flags';

const mockedUseFeatureFlagsEnabled = vi.mocked(useFeatureFlagsEnabled);

describe('RecResourceFeesTable', () => {
  const mockFees: RecreationFeeUIModel[] = [
    {
      fee_id: 1,
      recreation_fee_code: 'TYPE_A',
      fee_type_description: 'Day Use',
      fee_amount: 10.5,
      fee_start_date_readable_utc: '2024-01-01',
      fee_end_date_readable_utc: '2024-12-31',
      monday_ind: true,
      tuesday_ind: true,
      wednesday_ind: false,
      thursday_ind: false,
      friday_ind: false,
      saturday_ind: false,
      sunday_ind: false,
    },
    {
      fee_id: 2,
      recreation_fee_code: 'TYPE_B',
      fee_type_description: 'Camping',
      fee_amount: 25.0,
      fee_start_date_readable_utc: '2024-06-01',
      fee_end_date_readable_utc: null,
      monday_ind: true,
      tuesday_ind: true,
      wednesday_ind: true,
      thursday_ind: true,
      friday_ind: true,
      saturday_ind: true,
      sunday_ind: true,
    },
    {
      fee_id: 3,
      recreation_fee_code: 'TYPE_C',
      fee_type_description: null,
      fee_amount: null,
      fee_start_date_readable_utc: null,
      fee_end_date_readable_utc: null,
      monday_ind: false,
      tuesday_ind: false,
      wednesday_ind: false,
      thursday_ind: false,
      friday_ind: false,
      saturday_ind: false,
      sunday_ind: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders fee table with correct columns', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={mockFees} />);

    expect(screen.getByText('Fee Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('displays fee data correctly formatted', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={[mockFees[0]]} />);

    expect(screen.getByText('Day Use')).toBeInTheDocument();
    expect(screen.getByText('$10.50')).toBeInTheDocument();
    expect(screen.getByText('2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('2024-12-31')).toBeInTheDocument();
  });

  it('shows "--" for missing/null values', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={[mockFees[2]]} />);

    expect(screen.getByText('TYPE_C')).toBeInTheDocument();
    // Check for "--" in the rendered cells - the Table mock renders them
    const cells = screen.getAllByTestId(/^cell-/);
    const dashCells = cells.filter((cell) => cell.textContent === '--');
    expect(dashCells.length).toBeGreaterThanOrEqual(3); // Amount, Start Date, End Date, Days
  });

  it('renders individual days as badges', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={[mockFees[0]]} />);

    const badges = screen.getAllByTestId('custom-badge');
    // Should have fee type badge + day badges (Mon, Tue)
    expect(badges.length).toBeGreaterThanOrEqual(3);
    expect(badges[0]).toHaveTextContent('Day Use');
    // Check that day badges are present
    const dayBadges = badges.filter((badge) =>
      ['Mon', 'Tue'].includes(badge.textContent || ''),
    );
    expect(dayBadges.length).toBeGreaterThanOrEqual(2);
  });

  it('shows "All days" when all days are selected', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={[mockFees[1]]} />);

    // "All days" should be rendered as a badge
    const badges = screen.getAllByTestId('custom-badge');
    const allDaysBadge = badges.find(
      (badge) => badge.textContent === 'All days',
    );
    expect(allDaysBadge).toBeInTheDocument();
  });

  it('shows edit link when feature flag enabled and recResourceId provided', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(true);

    render(
      <RecResourceFeesTable fees={[mockFees[0]]} recResourceId="REC123" />,
    );

    const editLink = screen.getByLabelText('Edit fee');
    expect(editLink).toBeInTheDocument();
    expect(editLink).toHaveAttribute(
      'href',
      '/rec-resource/$id/fees/$feeId/edit',
    );
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('hides actions column when feature flag disabled', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(
      <RecResourceFeesTable fees={[mockFees[0]]} recResourceId="REC123" />,
    );

    expect(screen.queryByLabelText('Edit fee')).not.toBeInTheDocument();
    // Actions column should show "--" - check in the last column (Actions)
    const cells = screen.getAllByTestId(/^cell-/);
    const actionCell = cells[cells.length - 1]; // Last cell is Actions column
    expect(actionCell).toHaveTextContent('--');
  });

  it('hides actions when recResourceId is missing', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(true);

    render(<RecResourceFeesTable fees={[mockFees[0]]} />);

    expect(screen.queryByLabelText('Edit fee')).not.toBeInTheDocument();
  });

  it('displays empty message when no fees', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={[]} />);

    expect(screen.getByText('Currently no fees')).toBeInTheDocument();
  });

  it('formats currency amounts correctly', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    const feeWithDecimal: RecreationFeeUIModel = {
      ...mockFees[0],
      fee_amount: 99.99,
    };

    render(<RecResourceFeesTable fees={[feeWithDecimal]} />);

    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('uses fee_type_description when available, otherwise recreation_fee_code', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={mockFees} />);

    expect(screen.getByText('Day Use')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('TYPE_C')).toBeInTheDocument();
  });

  it('renders multiple fees correctly', () => {
    mockedUseFeatureFlagsEnabled.mockReturnValue(false);

    render(<RecResourceFeesTable fees={mockFees} />);

    expect(screen.getByText('Day Use')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('TYPE_C')).toBeInTheDocument();
  });
});
