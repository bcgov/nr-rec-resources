import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

/* =====================================================
   Mocks — MUST be declared before component import
   ===================================================== */

vi.mock('@/routes/rec-resource/$id/reservation', () => ({
  Route: {
    useParams: vi.fn(),
  },
}));

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ children, to, params }: any) => (
    <a href={`${to}/${params?.id}`}>{children}</a>
  ),
}));

vi.mock('@/contexts/feature-flags', () => ({
  FeatureFlagGuard: ({ children }: any) => <>{children}</>,
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceReservationSection/components',
  () => ({
    HasReservation: ({ value }: { value: boolean }) => (
      <div data-testid="has-reservation">{String(value)}</div>
    ),
  }),
);

vi.mock('@/pages/rec-resource-page/components/shared/FieldItem', () => ({
  FieldItem: ({ label, value }: { label: string; value?: string | null }) => (
    <div data-testid={`reservation-item-${label}`}>
      {label}:{value ?? ''}
    </div>
  ),
}));

vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    REC_RESOURCE_RESERVATION_EDIT: '/edit',
  },
}));

/* =====================================================
   Imports (after mocks)
   ===================================================== */

import { RecResourceReservationSection } from '@/pages/rec-resource-page/components/RecResourceReservationSection/RecResourceReservationSection';
import { Route } from '@/routes/rec-resource/$id/reservation';

/* =====================================================
   Tests
   ===================================================== */

describe('RecResourceReservationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Route.useParams).mockReturnValue({ id: 'REC123' });
  });

  it('renders correctly when reservationInfo is null', () => {
    render(<RecResourceReservationSection reservationInfo={null} />);

    expect(screen.getByText('Reservation')).toBeInTheDocument();

    expect(screen.getByTestId('has-reservation')).toHaveTextContent('false');

    expect(screen.getByTestId('reservation-item-Email')).toBeInTheDocument();
    expect(screen.getByTestId('reservation-item-Website')).toBeInTheDocument();
    expect(
      screen.getByTestId('reservation-item-Phone Number'),
    ).toBeInTheDocument();

    expect(screen.getByText('Edit')).toHaveAttribute('href', '/edit/REC123');
  });

  it('is not reservable when all reservation fields are empty', () => {
    render(
      <RecResourceReservationSection
        reservationInfo={
          {
            reservation_email: null,
            reservation_phone_number: null,
            reservation_website: null,
          } as any
        }
      />,
    );

    expect(screen.getByTestId('has-reservation')).toHaveTextContent('false');
  });

  it('is reservable when at least one reservation field exists', () => {
    render(
      <RecResourceReservationSection
        reservationInfo={
          {
            reservation_email: 'test@example.com',
            reservation_phone_number: null,
            reservation_website: null,
          } as any
        }
      />,
    );

    expect(screen.getByTestId('has-reservation')).toHaveTextContent('true');

    expect(screen.getByTestId('reservation-item-Email')).toHaveTextContent(
      'test@example.com',
    );
  });
});
