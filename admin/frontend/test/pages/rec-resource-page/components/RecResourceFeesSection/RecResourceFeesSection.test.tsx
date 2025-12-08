import { RecResourceFeesSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection';
import * as services from '@/services';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services');

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
  },
];

const setupMocks = (
  fees = mockFees,
  isLoading = false,
  error: Error | null = null,
) => {
  vi.mocked(services.useGetRecreationResourceFees).mockReturnValue({
    data: fees,
    isLoading,
    error,
    isSuccess: !isLoading && !error,
    isError: !!error,
  } as any);
};

describe('RecResourceFeesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders loading state', () => {
    setupMocks([], true);

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading fees...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    setupMocks([], false, new Error('Network error'));

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    expect(
      screen.getByText('Error loading fees. Please try again later.'),
    ).toBeInTheDocument();
  });

  it('renders empty state when no fees', () => {
    setupMocks([]);

    render(<RecResourceFeesSection recResourceId="REC9999" />);

    expect(screen.getByText('Currently no fees')).toBeInTheDocument();
  });

  it('renders fees table with correct data', () => {
    render(<RecResourceFeesSection recResourceId="REC1222" />);

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
    render(<RecResourceFeesSection recResourceId="REC1222" />);

    // First fee has all days except Sunday - should show individual day badges
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();

    // Second fee has all days - should show "All days" badge
    expect(screen.getByText('All days')).toBeInTheDocument();
  });

  it('handles missing fee amount', () => {
    const feesWithNullAmount = [
      {
        ...mockFees[0],
        fee_amount: undefined,
      },
    ];
    setupMocks(feesWithNullAmount as any);

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    const row = screen.getByText('Day use').closest('tr');
    expect(row).toHaveTextContent('--');
  });

  it('handles missing dates', () => {
    const feesWithNullDates = [
      {
        ...mockFees[0],
        fee_start_date: undefined,
        fee_end_date: undefined,
      },
    ];
    setupMocks(feesWithNullDates as any);

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    const row = screen.getByText('Day use').closest('tr');
    expect(row).toHaveTextContent('--');
  });

  it('uses fee code when description is missing', () => {
    const feesWithoutDescription = [
      {
        ...mockFees[0],
        fee_type_description: '',
      },
    ];
    setupMocks(feesWithoutDescription);

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('handles fee amount of zero', () => {
    const feesWithZeroAmount = [
      {
        ...mockFees[0],
        fee_amount: 0,
      },
    ];
    setupMocks(feesWithZeroAmount);

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles multiple fees with same code and start date', () => {
    const duplicateFees = [
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
    setupMocks(duplicateFees);

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    // Should render both fees with unique keys
    const rows = screen.getAllByText('Day use');
    expect(rows.length).toBe(2);
  });

  it('handles fees with only start date and no end date', () => {
    const feesWithOnlyStartDate = [
      {
        ...mockFees[0],
        fee_end_date: undefined,
      },
    ];
    setupMocks(feesWithOnlyStartDate as any);

    render(<RecResourceFeesSection recResourceId="REC1222" />);

    const row = screen.getByText('Day use').closest('tr');
    expect(row).toHaveTextContent('--');
  });
});
