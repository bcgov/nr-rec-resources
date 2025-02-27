import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Camping from './Camping';
import {
  RecreationCampsiteDto,
  RecreationFeeDto,
} from '@/service/recreation-resource';

describe('Camping Component', () => {
  const mockFees: RecreationFeeDto[] = [
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
      fee_description: 'Camping Fee',
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
      fee_description: 'Day Use Fee',
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
      fee_description: 'Parking Fee',
    },
  ];

  const mockCampsite: RecreationCampsiteDto = {
    rec_resource_id: '123',
    campsite_count: 2,
  };

  it('renders the section title and campsite count correctly', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={mockFees} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /camping/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 campsites')).toBeInTheDocument();
  });

  it('renders additional fees grouped by type correctly', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={mockFees} />);
    expect(screen.getByText('Day Use fee')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();

    expect(screen.getByText('Parking fee')).toBeInTheDocument();
    expect(screen.getByText('$12.00')).toBeInTheDocument();
  });

  it('renders fallback text when no fees are available', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={[]} />);
    expect(screen.getByText('No camping fees available.')).toBeInTheDocument();
  });

  it('renders "All Days" for applicable fees', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={mockFees} />);
    expect(screen.getAllByText('All Days')).toHaveLength(1);
  });

  it('renders specific days when not all days apply', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={mockFees} />);
    expect(
      screen.getByText('Monday, Tuesday, Wednesday, Thursday, Friday'),
    ).toBeInTheDocument();
  });
});
