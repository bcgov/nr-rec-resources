import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecreationFee from './RecreationFee';
import { RecreationFeeModel } from '@/service/custom-models';
import {
  formatFeeDays,
  getFeeTypeLabel,
  formatRecurringMonthDay,
  formatDateFull,
} from '@shared/utils';

// Mock the utility functions
vi.mock('@shared/utils', () => ({
  formatFeeDays: vi.fn(),
  getFeeTypeLabel: vi.fn(),
  formatRecurringMonthDay: vi.fn(),
  formatDateFull: vi.fn(),
}));

describe('RecreationFee', () => {
  const mockFee = {
    recreation_fee_code: 'CAMPING',
    fee_amount: 25.5,
    fee_start_date: '2025-06-01',
    fee_end_date: '2025-09-30',
    recurring_ind: false,
  };

  const mockRecurringFee = {
    recreation_fee_code: 'CAMPING',
    fee_amount: 25.5,
    recurring_ind: true,
    recurring_start_mmdd: '06-01',
    recurring_end_mmdd: '09-30',
  };

  beforeEach(() => {
    // Reset mock implementations
    vi.mocked(formatDateFull).mockImplementation((date) => {
      if (typeof date === 'string') return date;
      return String(date);
    });
    vi.mocked(formatFeeDays).mockReturnValue('Monday - Sunday');
    vi.mocked(getFeeTypeLabel).mockReturnValue('Camping');
    vi.mocked(formatRecurringMonthDay).mockImplementation((mmdd) => {
      if (!mmdd) return '';
      const [month, day] = mmdd.split('-');
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      return `${months[parseInt(month) - 1]} ${parseInt(day)}`;
    });
  });

  it('renders empty state when no data is provided', () => {
    render(<RecreationFee data={[]} />);
    expect(
      screen.getByText('No fees available for this resource.'),
    ).toBeInTheDocument();
  });

  it('renders non-recurring fee information correctly', () => {
    const fees = [mockFee] as unknown as RecreationFeeModel[];
    render(<RecreationFee data={fees} />);

    // Check if utility functions were called with correct arguments
    expect(getFeeTypeLabel).toHaveBeenCalledWith('CAMPING');
    expect(formatDateFull).toHaveBeenCalledWith('2025-06-01');
    expect(formatDateFull).toHaveBeenCalledWith('2025-09-30');
    expect(formatFeeDays).toHaveBeenCalledWith(mockFee);

    // Verify rendered content
    expect(screen.getByText('Camping fee')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('Fee applies')).toBeInTheDocument();
    expect(screen.getByText('Monday - Sunday')).toBeInTheDocument();
    expect(screen.getByText('2025-06-01 - 2025-09-30')).toBeInTheDocument();
  });

  it('renders recurring fee information correctly', () => {
    const fees = [mockRecurringFee] as unknown as RecreationFeeModel[];
    render(<RecreationFee data={fees} />);

    // Check if utility functions were called with correct arguments
    expect(getFeeTypeLabel).toHaveBeenCalledWith('CAMPING');
    expect(formatRecurringMonthDay).toHaveBeenCalledWith('06-01');
    expect(formatRecurringMonthDay).toHaveBeenCalledWith('09-30');
    expect(formatFeeDays).toHaveBeenCalledWith(mockRecurringFee);

    // Verify rendered content
    expect(screen.getByText('Camping fee')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('Fee applies')).toBeInTheDocument();
    expect(screen.getByText('Jun 1 - Sep 30')).toBeInTheDocument();
    expect(screen.getByText('Monday - Sunday')).toBeInTheDocument();
  });

  it('renders multiple fees correctly', () => {
    const fees = [
      mockFee,
      {
        ...mockFee,
        recreation_fee_code: 'PARKING',
        fee_amount: 10.0,
      },
    ] as unknown as RecreationFeeModel[];

    vi.mocked(getFeeTypeLabel)
      .mockReturnValueOnce('Camping')
      .mockReturnValueOnce('Parking');

    render(<RecreationFee data={fees} />);

    expect(screen.getByText('Camping fee')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('Parking fee')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });

  it('renders mix of recurring and non-recurring fees', () => {
    const fees = [mockFee, mockRecurringFee] as unknown as RecreationFeeModel[];

    vi.mocked(getFeeTypeLabel)
      .mockReturnValueOnce('Camping')
      .mockReturnValueOnce('Camping');

    render(<RecreationFee data={fees} />);

    // Should render both fees
    expect(screen.getAllByText('Camping fee')).toHaveLength(2);
    expect(screen.getAllByText('$25.50')).toHaveLength(2);
    expect(screen.getAllByText('Fee applies')).toHaveLength(2);
  });
});
