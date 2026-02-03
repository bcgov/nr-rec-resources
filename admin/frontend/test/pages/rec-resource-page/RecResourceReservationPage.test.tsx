import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourceReservationPage } from '@/pages/rec-resource-page/RecResourceReservationPage';
import { useRecResourceReservation } from '@/pages/rec-resource-page/hooks/useRecResourceReservation';
import { Route } from '@/routes/rec-resource/$id/reservation';

// 1. Mock the hook and route
vi.mock('@/pages/rec-resource-page/hooks/useRecResourceReservation', () => ({
  useRecResourceReservation: vi.fn(),
}));

vi.mock('@/routes/rec-resource/$id/reservation', () => ({
  Route: { useParams: vi.fn() },
}));

// 2. Mock the child component to avoid rendering its internals
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceReservationSection',
  () => ({
    RecResourceReservationSection: ({ reservationInfo }: any) => (
      <div data-testid="reservation-section">
        {reservationInfo ? 'Has Data' : 'No Data'}
      </div>
    ),
  }),
);

describe('RecResourceReservationPage', () => {
  const mockId = '123';

  beforeEach(() => {
    vi.clearAllMocks();
    (vi.mocked(Route.useParams) as any).mockReturnValue({ id: mockId });
  });

  it('renders LoadingSpinner when isLoading is true', () => {
    (vi.mocked(useRecResourceReservation) as any).mockReturnValue({
      reservationInfo: undefined,
      isLoading: true,
      error: null,
    });

    render(<RecResourceReservationPage />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Loading recreation resource'),
    ).toBeInTheDocument();
  });

  it('returns null when there is an error', () => {
    (vi.mocked(useRecResourceReservation) as any).mockReturnValue({
      reservationInfo: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    const { container } = render(<RecResourceReservationPage />);

    // Coverage for the "if (error)" branch
    expect(container.firstChild).toBeNull();
  });

  it('renders RecResourceReservationSection when data is loaded', () => {
    const mockData = { id: 1, name: 'Test Site' };
    (vi.mocked(useRecResourceReservation) as any).mockReturnValue({
      reservationInfo: mockData,
      isLoading: false,
      error: null,
    });

    render(<RecResourceReservationPage />);

    expect(screen.getByTestId('reservation-section')).toBeInTheDocument();
    expect(screen.getByText('Has Data')).toBeInTheDocument();
  });

  it('passes null to section if reservationInfo is undefined', () => {
    (vi.mocked(useRecResourceReservation) as any).mockReturnValue({
      reservationInfo: undefined,
      isLoading: false,
      error: null,
    });

    render(<RecResourceReservationPage />);

    // Coverage for the ternary (reservationInfo !== undefined ? info : null)
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });
});
