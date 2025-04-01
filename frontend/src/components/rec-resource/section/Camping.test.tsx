import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Camping from './Camping';
import { RecreationFeeModel } from '@/service/custom-models';

describe('Camping Component', () => {
  const mockFees: RecreationFeeModel[] = [
    {
      fee_amount: 30.0,
      fee_start_date: new Date('2024-06-01'),
      fee_end_date: new Date('2024-06-10'),
      monday_ind: 'y',
      tuesday_ind: 'y',
      wednesday_ind: 'y',
      thursday_ind: 'y',
      friday_ind: 'y',
      saturday_ind: 'n',
      sunday_ind: 'n',
      recreation_fee_code: 'C',
    },
    {
      fee_amount: 15.0,
      fee_start_date: new Date('2024-06-05'),
      fee_end_date: new Date('2024-06-15'),
      monday_ind: 'y',
      tuesday_ind: 'y',
      wednesday_ind: 'y',
      thursday_ind: 'y',
      friday_ind: 'y',
      saturday_ind: 'y',
      sunday_ind: 'n',
      recreation_fee_code: 'D',
    },
    {
      fee_amount: 12.0,
      fee_start_date: new Date('2024-06-05'),
      fee_end_date: new Date('2024-06-15'),
      monday_ind: 'y',
      tuesday_ind: 'y',
      wednesday_ind: 'y',
      thursday_ind: 'y',
      friday_ind: 'y',
      saturday_ind: 'y',
      sunday_ind: 'y',
      recreation_fee_code: 'P',
    },
  ];

  const campsiteCount = 2;

  it('renders the section title and campsite count correctly', () => {
    render(
      <Camping
        id="camping"
        title="Camping"
        campsite_count={campsiteCount}
        fees={mockFees}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: /camping/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/2 campsites/)).toBeInTheDocument();
  });

  it('renders additional fees grouped by type correctly', () => {
    render(
      <Camping
        id="camping"
        title="Camping"
        campsite_count={campsiteCount}
        fees={mockFees}
      />,
    );

    // Use regex or function matcher to handle spacing issues
    expect(screen.getByText(/day use/i)).toBeInTheDocument();

    expect(screen.getByText('$15.00')).toBeInTheDocument();

    expect(screen.getByText(/parking\s+fee/i)).toBeInTheDocument();

    expect(screen.getByText('$12.00')).toBeInTheDocument();
  });

  it('renders fallback text when no fees are available', () => {
    render(
      <Camping
        id="camping"
        title="Camping"
        campsite_count={campsiteCount}
        fees={[]}
      />,
    );

    expect(screen.getByText('No fees available.')).toBeInTheDocument();
  });

  it('renders "All Days" when a fee applies to every day', () => {
    render(
      <Camping
        id="camping"
        title="Camping"
        campsite_count={campsiteCount}
        fees={mockFees}
      />,
    );

    expect(screen.getByText('All Days')).toBeInTheDocument();
  });

  it('renders specific days when not all days apply', () => {
    render(
      <Camping
        id="camping"
        title="Camping"
        campsite_count={campsiteCount}
        fees={mockFees}
      />,
    );

    expect(
      screen.getByText('Monday, Tuesday, Wednesday, Thursday, Friday'),
    ).toBeInTheDocument();
  });
});
