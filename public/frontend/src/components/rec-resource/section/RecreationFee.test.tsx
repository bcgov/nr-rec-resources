import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecreationFee from './RecreationFee';
import { RecreationFeeModel } from '@/service/custom-models';
import {
  formatDateFull,
  formatFeeDays,
  formatRecurringMonthDay,
  getFeeTypeLabel,
} from '@shared/utils';

vi.mock('@shared/utils', () => ({
  formatDateFull: vi.fn(),
  formatFeeDays: vi.fn(),
  formatRecurringMonthDay: vi.fn(),
  getFeeTypeLabel: vi.fn(),
}));

describe('RecreationFee', () => {
  const mockFee = {
    recreation_fee_code: 'O',
    recreation_fee_sub_code: 'C',
    fee_sub_type_description: 'Camping',
    fee_amount: 25.5,
    fee_start_date: '2025-06-01',
    fee_end_date: '2025-09-30',
    recurring_ind: false,
  };

  const mockRecurringFee = {
    recreation_fee_code: 'O',
    recreation_fee_sub_code: 'CA',
    fee_sub_type_description: 'Cabins',
    fee_amount: 30,
    recurring_ind: true,
    recurring_start_mmdd: '06-01',
    recurring_end_mmdd: '09-30',
  };

  beforeEach(() => {
    vi.mocked(formatDateFull).mockImplementation((date) => {
      if (typeof date === 'string') return date;
      return null;
    });
    vi.mocked(formatFeeDays).mockReturnValue('Monday - Sunday');
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
      return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}`;
    });
    vi.mocked(getFeeTypeLabel).mockReturnValue('Camping');
  });

  it('renders empty state when no fee data is provided', () => {
    render(<RecreationFee data={[]} />);

    expect(
      screen.getByText('No fees available for this resource.'),
    ).toBeInTheDocument();
  });

  it('renders non-recurring fee information using the sub-type description', () => {
    render(
      <RecreationFee data={[mockFee] as unknown as RecreationFeeModel[]} />,
    );

    expect(
      screen.getByRole('heading', { name: 'Camping fees' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('table', { name: 'Camping fee table' }),
    ).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('2025-06-01 - 2025-09-30')).toBeInTheDocument();
    expect(screen.getByText('Monday - Sunday')).toBeInTheDocument();
    expect(formatDateFull).toHaveBeenCalledWith('2025-06-01');
    expect(formatDateFull).toHaveBeenCalledWith('2025-09-30');
    expect(formatFeeDays).toHaveBeenCalledWith(mockFee);
  });

  it('renders recurring fee information using formatted month/day range', () => {
    render(
      <RecreationFee
        data={[mockRecurringFee] as unknown as RecreationFeeModel[]}
      />,
    );

    expect(screen.getByText('Jun 1 - Sep 30')).toBeInTheDocument();
    expect(formatRecurringMonthDay).toHaveBeenCalledWith('06-01');
    expect(formatRecurringMonthDay).toHaveBeenCalledWith('09-30');
    expect(formatFeeDays).toHaveBeenCalledWith(mockRecurringFee);
  });

  it('falls back to recreation_fee_sub_code when fee_sub_type_description is missing', () => {
    const feeWithoutSubTypeDescription = {
      ...mockFee,
      fee_sub_type_description: undefined,
    };

    render(
      <RecreationFee
        data={[feeWithoutSubTypeDescription] as unknown as RecreationFeeModel[]}
      />,
    );

    expect(screen.getByRole('heading', { name: 'C fees' })).toBeInTheDocument();
  });

  it('falls back to getFeeTypeLabel when both description and sub-code are missing', () => {
    const feeWithoutSubCode = {
      ...mockFee,
      fee_sub_type_description: undefined,
      recreation_fee_sub_code: undefined,
      recreation_fee_code: 'C',
    };

    render(
      <RecreationFee
        data={[feeWithoutSubCode] as unknown as RecreationFeeModel[]}
      />,
    );

    expect(getFeeTypeLabel).toHaveBeenCalledWith('C');
    expect(
      screen.getByRole('heading', { name: 'Camping fees' }),
    ).toBeInTheDocument();
  });

  it('shows "Always" when start, end and recurring dates are all missing', () => {
    const feeWithNoDateRange = {
      ...mockFee,
      fee_start_date: null,
      fee_end_date: null,
    };

    render(
      <RecreationFee
        data={[feeWithNoDateRange] as unknown as RecreationFeeModel[]}
      />,
    );

    expect(screen.getByText('Always')).toBeInTheDocument();
  });
});
