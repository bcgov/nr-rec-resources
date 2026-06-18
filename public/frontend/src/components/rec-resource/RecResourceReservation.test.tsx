import { render, screen } from '@testing-library/react';
import RecResourceReservation from './RecResourceReservation';
import { ReservationType } from './RecReservationButton';
import { vi } from 'vitest';
import { RecreationResourceDetailDto } from '@/service/recreation-resource/models/RecreationResourceDetailDto';
import { RecreationResourceReservationInfoDto } from '@/service/recreation-resource';
// Mock RecReservationButton so we can verify props easily
vi.mock('./RecReservationButton', () => ({
  __esModule: true,
  default: ({ type, text }: { type: ReservationType; text: string }) => (
    <div data-testid={`reservation-button-${type}`}>{text}</div>
  ),
  ReservationType: {
    LINK: 'link',
    EMAIL: 'email',
    PHONE: 'phone',
  },
}));

describe('RecResourceReservation', () => {
  const mockFees = [
    {
      recreation_fee_code: 'A',
      fee_amount: 10,
      monday_ind: '',
      tuesday_ind: '',
      wednesday_ind: '',
      thursday_ind: '',
      friday_ind: '',
      saturday_ind: '',
      sunday_ind: '',
      fee_start_date: new Date(),
      fee_end_date: new Date(),
      recurring_ind: false,
    },
  ];
  const mockOvernightFees = [
    {
      recreation_fee_code: 'O',
      recreation_fee_sub_code: 'C',
      fee_amount: 10,
      monday_ind: '',
      tuesday_ind: '',
      wednesday_ind: '',
      thursday_ind: '',
      friday_ind: '',
      saturday_ind: '',
      sunday_ind: '',
      fee_start_date: new Date(),
      fee_end_date: new Date(),
      recurring_ind: false,
    },
  ];
  const baseResource: RecreationResourceDetailDto = {
    rec_resource_id: 'REC123',
    name: 'Resource Name',
    description: 'Resource Description',
    closest_community: 'Resource Location',
    recreation_access: ['Road', 'Boat-in'],
    recreation_activity: [
      {
        recreation_activity_code: 1,
        description: 'Activity Description',
        details: '',
        is_accessible: false,
      },
    ],
    recreation_status: {
      status_code: 1,
      description: 'Open',
      comment: '',
    },
    recreation_resource_images: [
      {
        caption: 'test image',
        recreation_resource_image_variants: [
          {
            size_code: 'scr',
            url: 'preview-url',
            width: 10,
            height: 10,
            extension: 'jpg',
          },
          {
            size_code: 'original',
            url: 'full-url',
            width: 0,
            height: 0,
            extension: '',
          },
        ],
        image_id: '',
      },
    ],
    recreation_resource_reservation_info: undefined,
    rec_resource_type: '',
    driving_directions: '',
    maintenance_standard_code: 'U',
    campsite_count: 0,
    recreation_fee: [],
    overnight_fees: mockOvernightFees,
    additional_fees: mockFees,
    recreation_structure: {
      has_toilet: true,
      has_table: true,
    },
  };

  const recreation_resource_reservation_info: RecreationResourceReservationInfoDto =
    {
      reservation_instructions: 'instructions',
      reservation_website: 'https://example.com',
      reservation_email: 'test@example.com',
      reservation_phone_number: '123-456-7890',
    };

  it('renders website, email and phone reservation buttons when reservation info is present', () => {
    render(
      <RecResourceReservation
        recResource={{ ...baseResource, recreation_resource_reservation_info }}
      />,
    );

    expect(
      screen.getByText(/Reservations available through site operator./i),
    ).toBeInTheDocument();
    expect(screen.getByTestId('reservation-button-link')).toHaveTextContent(
      'https://example.com',
    );
    expect(screen.getByTestId('reservation-button-email')).toHaveTextContent(
      'test@example.com',
    );
    expect(screen.getByTestId('reservation-button-phone')).toHaveTextContent(
      '123-456-7890',
    );
  });

  it('renders first come first served with camping link when campsite_count > 0 with no fees', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          campsite_count: 5,
          overnight_fees: [],
          additional_fees: [],
          recreation_resource_reservation_info: undefined,
        }}
      />,
    );

    expect(
      screen.getByText(/This site is first come first served/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/No fees apply./i)).toBeInTheDocument();
    const campingLink = screen.getByRole('link', { name: 'camping' });
    expect(campingLink).toHaveAttribute('href', '/resource/REC123#camping');
  });

  it('renders first come first served with fees and facilities links when campsite_count > 0 with camping fees', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          campsite_count: 5,
          recreation_resource_reservation_info: undefined,
        }}
      />,
    );

    expect(
      screen.getByText(/This site is first come first served/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Fees apply when arriving on site./i),
    ).toBeInTheDocument();
    const feesLink = screen.getByRole('link', { name: 'fees' });
    expect(feesLink).toHaveAttribute('href', '/resource/REC123#fees');
    const facilitiesLink = screen.getByRole('link', { name: 'facilities' });
    expect(facilitiesLink).toHaveAttribute(
      'href',
      '/resource/REC123#facilities',
    );
  });

  it('renders day-use with fees link when no campsite_count but has fees', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          overnight_fees: mockOvernightFees,
          campsite_count: 0,
          recreation_resource_reservation_info: undefined,
        }}
      />,
    );

    expect(
      screen.getByText(/Fees apply when arriving on site./i),
    ).toBeInTheDocument();
    const feesLink = screen.getByRole('link', { name: 'fees' });
    expect(feesLink).toHaveAttribute('href', '/resource/REC123#fees');
  });

  it('renders facilities link when facilities are available', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          recreation_structure: { has_toilet: true, has_table: false },
          recreation_resource_reservation_info: undefined,
        }}
      />,
    );

    const facilitiesLink = screen.getByRole('link', { name: 'facilities' });
    expect(facilitiesLink).toHaveAttribute(
      'href',
      '/resource/REC123#facilities',
    );
  });

  it('renders facilities link when facilities are available without AdditionalFeesAvailable', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          recreation_structure: { has_toilet: true, has_table: false },
          recreation_resource_reservation_info: undefined,
          additional_fees: [],
        }}
      />,
    );

    const facilitiesLink = screen.getByRole('link', { name: 'facilities' });
    expect(facilitiesLink).toHaveAttribute(
      'href',
      '/resource/REC123#facilities',
    );
  });

  it('does not render facilities link when facilities are not available', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          recreation_structure: { has_toilet: false, has_table: false },
          recreation_resource_reservation_info: undefined,
        }}
      />,
    );

    expect(screen.queryByRole('link', { name: 'facilities' })).toBeNull();
  });

  it('renders no fees apply when there is no camping and fees', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          campsite_count: 0,
          additional_fees: [],
          overnight_fees: [],
          recreation_resource_reservation_info: undefined,
        }}
      />,
    );

    expect(screen.getByText(/No fees apply/i)).toBeInTheDocument();
  });

  it('renders no fees apply when there is camping and no fees', () => {
    render(
      <RecResourceReservation
        recResource={{
          ...baseResource,
          campsite_count: 1,
          additional_fees: [],
          overnight_fees: [],
          recreation_resource_reservation_info: undefined,
        }}
      />,
    );

    expect(screen.getByText(/No fees apply./i)).toBeInTheDocument();
  });
});
