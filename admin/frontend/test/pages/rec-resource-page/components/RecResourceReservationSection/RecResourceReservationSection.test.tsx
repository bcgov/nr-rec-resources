import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

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

    expect(screen.getByText('Reservations')).toBeInTheDocument();

    expect(screen.getByText('Reservable')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();

    expect(screen.getByText('Reservation method')).toBeInTheDocument();
    expect(screen.getByText('Reservation contact')).toBeInTheDocument();

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

    expect(screen.getByText('No')).toBeInTheDocument();
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

    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows website when multiple reservation methods exist', () => {
    render(
      <RecResourceReservationSection
        reservationInfo={
          {
            reservation_email: 'test@example.com',
            reservation_phone_number: '778-978-7786',
            reservation_website: 'https://example.com',
          } as any
        }
      />,
    );

    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
});
