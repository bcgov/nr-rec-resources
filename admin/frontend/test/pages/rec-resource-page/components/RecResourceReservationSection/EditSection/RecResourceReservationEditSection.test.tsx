import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecResourceReservationEditSection } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection';
import { Route } from '@/routes/rec-resource/$id/reservation/edit';
import { useRecResourceReservation } from '@/pages/rec-resource-page/hooks/useRecResourceReservation';
import { useEditReservationForm } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/hooks/useEditReservationForm';
import { useWatch } from 'react-hook-form';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/hooks/useEditReservationForm',
  () => ({
    useEditReservationForm: vi.fn(),
  }),
);

vi.mock('@/pages/rec-resource-page/hooks/useRecResourceReservation', () => ({
  useRecResourceReservation: vi.fn(),
}));

vi.mock('@/routes/rec-resource/$id/reservation/edit', () => ({
  Route: { useParams: vi.fn() },
}));

vi.mock('react-hook-form', () => ({
  useWatch: vi.fn(),
  Controller: ({ render }: any) =>
    render({ field: { onChange: vi.fn(), value: false } }),
}));

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: any) => <a>{children}</a>,
}));

describe('RecResourceReservationEditSection', () => {
  const mockParams = { id: '123' };
  const mockReservationInfo = {
    reservation_email: 'test@example.com',
    reservation_website: 'https://test.com',
    reservation_phone_number: '123-456-7890',
  };

  const mockFormHooks = {
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault();
      fn();
    },
    control: {},
    register: vi.fn(),
    errors: {},
    isDirty: false,
    updateMutation: { isPending: false },
    onSubmit: vi.fn(),
    handleHasReservationChange: vi.fn(),
    handleReservationMethodChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Use type casting to avoid the ".mockReturnValue" error if TypeScript complains
    (vi.mocked(Route.useParams) as any).mockReturnValue(mockParams);
    (vi.mocked(useRecResourceReservation) as any).mockReturnValue({
      reservationInfo: mockReservationInfo,
    });
    (vi.mocked(useEditReservationForm) as any).mockReturnValue(mockFormHooks);
    (vi.mocked(useWatch) as any).mockImplementation(({ name }: any) => {
      if (name === 'has_reservation') {
        return true;
      }

      if (name === 'reservation_method') {
        return 'reservation_website';
      }

      return undefined;
    });
  });

  const renderComponent = () => render(<RecResourceReservationEditSection />);

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Edit Reservations')).toBeInTheDocument();
  });

  it('handles the "Saving..." button state', () => {
    (vi.mocked(useEditReservationForm) as any).mockReturnValue({
      ...mockFormHooks,
      updateMutation: { isPending: true },
    });
    renderComponent();
    expect(screen.getByText('Saving...')).toBeDisabled();
  });

  it('triggers onSubmit on save click', () => {
    const onSubmit = vi.fn();
    (vi.mocked(useEditReservationForm) as any).mockReturnValue({
      ...mockFormHooks,
      isDirty: true,
      onSubmit,
    });
    renderComponent();
    fireEvent.click(screen.getByText('Save'));
    expect(onSubmit).toHaveBeenCalled();
  });

  it('updates state based on field values (useWatch)', () => {
    renderComponent();
    expect(screen.getByLabelText('Reservation method')).toBeInTheDocument();
    expect(screen.getByLabelText(/Reservation contact/i)).toBeInTheDocument();
  });

  it('clears method and contact when toggling off reservation', () => {
    const handleHasReservationChange = vi.fn();
    (vi.mocked(useEditReservationForm) as any).mockReturnValue({
      ...mockFormHooks,
      handleHasReservationChange,
    });

    renderComponent();
    const toggle = screen.getByTestId('reservable-no');

    fireEvent.click(toggle);
    expect(handleHasReservationChange).toHaveBeenCalledWith(false);
  });

  it('hides reservation method and contact fields when not reservable', () => {
    (vi.mocked(useWatch) as any).mockImplementation(({ name }: any) => {
      if (name === 'has_reservation') {
        return false;
      }

      return undefined;
    });

    renderComponent();

    expect(
      screen.queryByLabelText('Reservation method'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/Reservation contact/i),
    ).not.toBeInTheDocument();
  });

  it('renders email contact input settings when email is selected', () => {
    (vi.mocked(useEditReservationForm) as any).mockReturnValue({
      ...mockFormHooks,
      isDirty: true,
      register: () => ({}),
    });
    (vi.mocked(useWatch) as any).mockImplementation(({ name }: any) => {
      if (name === 'has_reservation') {
        return true;
      }

      if (name === 'reservation_method') {
        return 'reservation_email';
      }

      return undefined;
    });

    renderComponent();

    expect(screen.getByLabelText(/Reservation contact/i)).toHaveAttribute(
      'type',
      'email',
    );
    expect(
      screen.getByPlaceholderText(/name@example.com/i),
    ).toBeInTheDocument();
  });
});
