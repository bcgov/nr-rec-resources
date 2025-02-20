import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Camping from './Camping';
import {
  RecreationCampsiteDto,
  RecreationFeeDto,
} from '@/service/recreation-resource';

describe('Camping Component', () => {
  const mockFees: RecreationFeeDto = {
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
    recreation_fee_code: 2,
    fee_description: 'Camping Fee',
  };

  const mockCampsite: RecreationCampsiteDto = {
    rec_resource_id: '123',
    campsite_count: 2,
  };

  it('renders the section title and campsite count correctly', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={mockFees} />);
    expect(
      screen.getByRole('heading', { level: 2, name: /camping/i }),
    ).toBeInTheDocument();
  });

  it('renders fallback text when no fees are available', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={null as any} />);
    expect(screen.getByText('No camping fees available.')).toBeInTheDocument();
  });

  it('renders correct campsite count', () => {
    render(<Camping recreation_campsite={mockCampsite} fees={mockFees} />);
    expect(screen.getByText('2 campsites')).toBeInTheDocument();
  });
});
