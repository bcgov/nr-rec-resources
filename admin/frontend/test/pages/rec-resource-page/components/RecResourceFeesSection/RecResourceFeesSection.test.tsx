import { RecResourceFeesSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection';
import { Route } from '@/routes/rec-resource/$id/fees';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const mockFees = [
  {
    fee_amount: 15,
    fee_start_date: new Date('2024-05-15'),
    fee_end_date: new Date('2024-10-15'),
    recreation_fee_code: 'D',
    fee_type_description: 'Day use',
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'N',
    fee_start_date_readable_utc: 'May 15, 2024',
    fee_end_date_readable_utc: 'October 15, 2024',
  },
  {
    fee_amount: 7,
    fee_start_date: new Date('2024-05-15'),
    fee_end_date: new Date('2024-10-15'),
    recreation_fee_code: 'T',
    fee_type_description: 'Trail use',
    monday_ind: 'Y',
    tuesday_ind: 'Y',
    wednesday_ind: 'Y',
    thursday_ind: 'Y',
    friday_ind: 'Y',
    saturday_ind: 'Y',
    sunday_ind: 'Y',
    fee_start_date_readable_utc: 'May 15, 2024',
    fee_end_date_readable_utc: 'October 15, 2024',
  },
];

vi.mock('@/routes/rec-resource/$id/fees', () => {
  return {
    Route: {
      useLoaderData: vi.fn(() => ({
        fees: mockFees,
      })),
    },
  };
});

describe('RecResourceFeesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Route.useLoaderData).mockReturnValue({
      fees: mockFees,
    });
  });

  it('renders empty state when no fees', () => {
    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: [],
    });

    render(<RecResourceFeesSection />);

    expect(screen.getByText('Currently no fees')).toBeInTheDocument();
  });

  it('renders fees table with correct data', () => {
    render(<RecResourceFeesSection />);

    expect(screen.getByText('Fee Type')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();

    expect(screen.getByText('Day use')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
    expect(screen.getByText('Trail use')).toBeInTheDocument();
    expect(screen.getByText('$7.00')).toBeInTheDocument();
  });

  it('formats fee days correctly', () => {
    render(<RecResourceFeesSection />);

    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();

    expect(screen.getByText('All days')).toBeInTheDocument();
  });

  it('handles missing fee amount', () => {
    const feesWithNullAmount: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        fee_amount: undefined,
      },
    ];

    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: feesWithNullAmount as any,
    });

    render(<RecResourceFeesSection />);

    const row = screen.getByText('Day use').closest('tr');
    expect(row).toHaveTextContent('--');
  });

  it('handles missing dates', () => {
    const feesWithNullDates: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        fee_start_date: undefined,
        fee_end_date: undefined,
        fee_start_date_readable_utc: undefined,
        fee_end_date_readable_utc: undefined,
      },
    ];

    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: feesWithNullDates as any,
    });

    render(<RecResourceFeesSection />);

    const row = screen.getByText('Day use').closest('tr');
    expect(row).toHaveTextContent('--');
  });

  it('uses fee code when description is missing', () => {
    const feesWithoutDescription: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        fee_type_description: '',
      },
    ];

    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: feesWithoutDescription,
    });

    render(<RecResourceFeesSection />);

    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('handles fee amount of zero', () => {
    const feesWithZeroAmount: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        fee_amount: 0,
      },
    ];

    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: feesWithZeroAmount,
    });

    render(<RecResourceFeesSection />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles multiple fees with same code and start date', () => {
    const duplicateFees: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        recreation_fee_code: 'D',
        fee_start_date: new Date('2024-05-15'),
      },
      {
        ...mockFees[0],
        recreation_fee_code: 'D',
        fee_start_date: new Date('2024-05-15'),
        fee_amount: 20,
      },
    ];

    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: duplicateFees,
    });

    render(<RecResourceFeesSection />);

    const rows = screen.getAllByText('Day use');
    expect(rows.length).toBe(2);
  });

  it('handles fees with only start date and no end date', () => {
    const feesWithOnlyStartDate: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        fee_end_date: undefined,
        fee_end_date_readable_utc: undefined,
      },
    ];

    vi.mocked(Route.useLoaderData).mockReturnValueOnce({
      fees: feesWithOnlyStartDate as any,
    });

    render(<RecResourceFeesSection />);

    const row = screen.getByText('Day use').closest('tr');
    expect(row).toHaveTextContent('--');
  });

  it('handles empty fees array', () => {
    render(<RecResourceFeesSection fees={[]} />);

    expect(screen.getByText('Current Fee Information')).toBeInTheDocument();
    expect(screen.getByText('Fee Type')).toBeInTheDocument();
  });
});
