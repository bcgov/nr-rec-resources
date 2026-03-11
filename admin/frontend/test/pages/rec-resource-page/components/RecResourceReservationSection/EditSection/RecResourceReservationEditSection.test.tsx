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

vi.mock('@shared/components/link-with-query-params', () => ({
  LinkWithQueryParams: ({ children }: any) => <a>{children}</a>,
}));

vi.mock('../components', () => ({
  HasReservation: ({ onChange, value }: any) => (
    <button data-testid="toggle-res" onClick={() => onChange(!value)}>
      {value ? 'Has Res' : 'No Res'}
    </button>
  ),
  FormErrorBanner: () => null,
}));

describe('RecResourceReservationEditSection', () => {
  const mockParams = { id: '123' };
  const mockReservationInfo = {
    reservation_email: 'test@example.com',
    reservation_website: 'https://test.com',
    reservation_phone_number: '1234567890',
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
    setValue: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Use type casting to avoid the ".mockReturnValue" error if TypeScript complains
    (vi.mocked(Route.useParams) as any).mockReturnValue(mockParams);
    (vi.mocked(useRecResourceReservation) as any).mockReturnValue({
      reservationInfo: mockReservationInfo,
    });
    (vi.mocked(useEditReservationForm) as any).mockReturnValue(mockFormHooks);
    (vi.mocked(useWatch) as any).mockReturnValue('');
  });

  const renderComponent = () => render(<RecResourceReservationEditSection />);

  it('renders correctly', () => {
    renderComponent();
    expect(screen.getByText('Edit Reservation')).toBeInTheDocument();
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
    // Mocking useWatch returning a value
    (vi.mocked(useWatch) as any).mockReturnValue('valid@email.com');
    renderComponent();
    expect(screen.getByText('Reservable')).toBeInTheDocument();
  });

  it('clears fields when toggling off reservation', () => {
    const setValue = vi.fn();
    (vi.mocked(useEditReservationForm) as any).mockReturnValue({
      ...mockFormHooks,
      setValue,
    });

    renderComponent();
    const toggle = screen.getByTestId('toggle-res');

    // The component logic calls handleRequireReservation
    fireEvent.click(toggle);
    expect(setValue).toHaveBeenCalled();
    fireEvent.click(toggle);
    expect(setValue).toHaveBeenCalled();
  });
});
