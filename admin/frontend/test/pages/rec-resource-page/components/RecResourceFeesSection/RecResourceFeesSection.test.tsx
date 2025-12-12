import { RecResourceFeesSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection';
import { RecreationFeeUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const mockFees: RecreationFeeUIModel[] = [
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

describe('RecResourceFeesSection', () => {
  it('renders section title', () => {
    render(<RecResourceFeesSection fees={mockFees} />);

    expect(screen.getByText('Current Fee Information')).toBeInTheDocument();
  });

  it('renders fees table with correct data', () => {
    render(<RecResourceFeesSection fees={mockFees} />);

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
    render(<RecResourceFeesSection fees={mockFees} />);

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
    const feesWithNullAmount: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        fee_amount: undefined,
      },
    ];

    render(<RecResourceFeesSection fees={feesWithNullAmount} />);

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

    render(<RecResourceFeesSection fees={feesWithNullDates} />);

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

    render(<RecResourceFeesSection fees={feesWithoutDescription} />);

    expect(screen.getByText('D')).toBeInTheDocument();
  });

  it('handles fee amount of zero', () => {
    const feesWithZeroAmount: RecreationFeeUIModel[] = [
      {
        ...mockFees[0],
        fee_amount: 0,
      },
    ];

    render(<RecResourceFeesSection fees={feesWithZeroAmount} />);

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

    render(<RecResourceFeesSection fees={duplicateFees} />);

    // Should render both fees with unique keys
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

    render(<RecResourceFeesSection fees={feesWithOnlyStartDate} />);

    const row = screen.getByText('Day use').closest('tr');
    expect(row).toHaveTextContent('--');
  });

  it('handles empty fees array', () => {
    render(<RecResourceFeesSection fees={[]} />);

    expect(screen.getByText('Current Fee Information')).toBeInTheDocument();
    expect(screen.getByText('Fee Type')).toBeInTheDocument();
  });
});
