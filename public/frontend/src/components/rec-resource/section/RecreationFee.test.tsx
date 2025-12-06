import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecreationFee from './RecreationFee';
import { formatFeeDays, getFeeTypeLabel } from '@shared/utils/feeUtils';
import { formatDateFull } from '@shared/utils';
import { RecreationFeeDto } from '@/service/recreation-resource';

// Mock the utility functions
vi.mock('@shared/utils/feeUtils', () => ({
  formatFeeDays: vi.fn(),
  getFeeTypeLabel: vi.fn(),
}));

vi.mock('@shared/utils/dateUtils', () => ({
  formatDateFull: vi.fn(),
}));

describe('RecreationFee', () => {
  const mockFee = {
    recreation_fee_code: 'CAMPING',
    fee_amount: 25.5,
    fee_start_date: '2025-06-01',
    fee_end_date: '2025-09-30',
  };

  beforeEach(() => {
    // Reset mock implementations
    vi.mocked(formatDateFull).mockImplementation((date: Date) => date);
    vi.mocked(formatFeeDays).mockReturnValue('Monday - Sunday');
    vi.mocked(getFeeTypeLabel).mockReturnValue('Camping');
  });

  it('renders empty state when no data is provided', () => {
    render(<RecreationFee data={[]} />);
    expect(
      screen.getByText('No fees available for this resource.'),
    ).toBeInTheDocument();
  });

  it('renders fee information correctly', () => {
    const fees = [mockFee] as unknown as RecreationFeeDto[];
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

  it('renders multiple fees correctly', () => {
    const fees = [
      mockFee,
      {
        ...mockFee,
        recreation_fee_code: 'PARKING',
        fee_amount: 10.0,
      },
    ] as unknown as RecreationFeeDto[];

    vi.mocked(getFeeTypeLabel)
      .mockReturnValueOnce('Camping')
      .mockReturnValueOnce('Parking');

    render(<RecreationFee data={fees} />);

    expect(screen.getByText('Camping fee')).toBeInTheDocument();
    expect(screen.getByText('$25.50')).toBeInTheDocument();
    expect(screen.getByText('Parking fee')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
  });
});
