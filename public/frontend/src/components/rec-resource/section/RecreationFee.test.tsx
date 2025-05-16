import { render, screen } from '@testing-library/react';
import RecreationFee from './RecreationFee';

describe('RecreationFee Component', () => {
  const mockData = [
    {
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
      recreation_fee_code: 'P',
      fee_description: 'Park Entry Fee',
    },
  ];

  test('renders the fee amount correctly', () => {
    render(<RecreationFee data={mockData} />);
    expect(screen.getByText('$25.50')).toBeInTheDocument();
  });

  test('renders fee type based on recreation_fee_code', () => {
    render(<RecreationFee data={mockData} />);
    expect(screen.getByText('Parking fee')).toBeInTheDocument();
  });

  test('renders "Unknown Fee Type" when recreation_fee_code is not in feeTypeMap', () => {
    const unknownFeeData = [{ ...mockData[0], recreation_fee_code: 'Z' }];
    render(<RecreationFee data={unknownFeeData} />);
    expect(screen.getByText('Unknown Fee Type fee')).toBeInTheDocument();
  });

  test('formats and displays the fee dates correctly', () => {
    render(<RecreationFee data={mockData} />);

    expect(
      screen.getByText(
        (content) =>
          content.includes('January') || content.includes('February'),
      ),
    ).toBeInTheDocument();
  });

  test('renders correctly when fee_end_date is missing', () => {
    const partialDateData = [{ ...mockData[0], fee_end_date: null }];
    render(<RecreationFee data={partialDateData as any} />);

    expect(screen.getByText(/January|February/)).toBeInTheDocument();
    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
  });

  test('renders "All Days" when all days are selected', () => {
    render(<RecreationFee data={mockData} />);
    expect(screen.getByText('All Days')).toBeInTheDocument();
  });

  test('renders specific days when not all are selected', () => {
    const partialData = [
      { ...mockData[0], saturday_ind: 'n', sunday_ind: 'n' },
    ];
    render(<RecreationFee data={partialData} />);
    expect(
      screen.getByText('Monday, Tuesday, Wednesday, Thursday, Friday'),
    ).toBeInTheDocument();
  });

  test('renders only one selected day correctly', () => {
    const singleDayData = [
      {
        ...mockData[0],
        monday_ind: 'n',
        tuesday_ind: 'n',
        wednesday_ind: 'n',
        thursday_ind: 'n',
        friday_ind: 'n',
        saturday_ind: 'n',
        sunday_ind: 'y',
      },
    ];
    render(<RecreationFee data={singleDayData} />);
    expect(screen.getByText('Sunday')).toBeInTheDocument();
  });

  test('renders correctly when fee_start_date is missing', () => {
    const partialDateData = [{ ...mockData[0], fee_start_date: null }];
    render(<RecreationFee data={partialDateData as any} />);

    expect(screen.getByText(/N\/A/)).toBeInTheDocument();
    expect(screen.getByText(/February/)).toBeInTheDocument();
  });

  test('displays "No fees available for this resource." when data is empty', () => {
    render(<RecreationFee data={[]} />);
    expect(
      screen.getByText('No fees available for this resource.'),
    ).toBeInTheDocument();
  });
});
