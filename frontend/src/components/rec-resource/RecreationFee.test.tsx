import React from 'react';
import { render, screen } from '@testing-library/react';
import RecreationFee from './RecreationFee';

describe('RecreationFee Component', () => {
  const mockData = {
    fee_amount: 25.5,
    fee_start_date: new Date('2024-02-01'),
    fee_end_date: new Date('2024-02-10'),
    monday_ind: 'y',
    tuesday_ind: 'y',
    wednesday_ind: 'y',
    thursday_ind: 'y',
    friday_ind: 'y',
    saturday_ind: 'y',
    sunday_ind: 'y',
    recreation_fee_code: 1,
    fee_description: 'Park Entry Fee',
  };

  test('renders the fee amount and description correctly', () => {
    render(<RecreationFee data={mockData} />);
    expect(screen.getByText('$25.50 Park Entry Fee')).toBeInTheDocument();
  });

  test('renders the fee start and end dates correctly', () => {
    render(<RecreationFee data={mockData} />);

    expect(screen.queryByText(/February/i)).toBeTruthy();
  });

  test('renders specific days when not all are selected', () => {
    const partialData = { ...mockData, saturday_ind: 'n', sunday_ind: 'n' };
    render(<RecreationFee data={partialData} />);
    expect(
      screen.getByText('Monday, Tuesday, Wednesday, Thursday, Friday'),
    ).toBeInTheDocument();
  });

  test('renders only one day correctly', () => {
    const singleDayData = {
      ...mockData,
      monday_ind: 'n',
      tuesday_ind: 'n',
      wednesday_ind: 'n',
      thursday_ind: 'n',
      friday_ind: 'n',
      saturday_ind: 'n',
      sunday_ind: 'y',
    };
    render(<RecreationFee data={singleDayData} />);
    expect(screen.getByText('Sunday')).toBeInTheDocument();
  });
});
