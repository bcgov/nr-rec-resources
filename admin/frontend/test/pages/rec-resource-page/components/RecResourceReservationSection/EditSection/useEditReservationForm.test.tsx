import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();
const mockAddSuccessNotification = vi.fn();
const mockAddErrorNotification = vi.fn();
const mockHandleApiError = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceReservation',
  () => ({
    default: () => ({ mutateAsync: mockMutateAsync }),
  }),
);

vi.mock('@shared/hooks', () => ({
  useNavigateWithQueryParams: () => ({ navigate: mockNavigate }),
}));

vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: (...args: any[]) =>
    mockAddSuccessNotification(...args),
  addErrorNotification: (...args: any[]) => mockAddErrorNotification(...args),
}));

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: (...args: any[]) => mockHandleApiError(...args),
}));

import { useEditReservationForm } from '@/pages/rec-resource-page/components/RecResourceReservationSection/EditSection/hooks/useEditReservationForm';
import { ROUTE_PATHS } from '@/constants/routes';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useEditReservationForm', () => {
  it('returns error when set requires reservation true but no properties', async () => {
    function Expose() {
      const { onSubmit } = useEditReservationForm('REC001', null);
      (globalThis as any).__onSubmit = onSubmit;
      return null;
    }
    render(<Expose />);
    await (globalThis as any).__onSubmit({
      has_reservation: true,
      reservation_email: '',
      reservation_website: '',
      reservation_phone_number: '',
    });
    expect(mockAddSuccessNotification).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAddErrorNotification).toHaveBeenCalled();
  });

  it('calls update mutation, shows success notification and navigates on success', async () => {
    const returned = {
      reservation_email: 'email@email.com',
      reservation_website: 'www.website.com',
      reservation_phone_number: '7789787786',
    };
    mockMutateAsync.mockResolvedValue(returned);

    function Expose() {
      const { onSubmit } = useEditReservationForm('REC123', {
        rec_resource_id: 'REC123',
        reservation_email: 'email@email.com',
        reservation_website: 'www.website.com',
        reservation_phone_number: '7789787786',
      });
      (globalThis as any).__onSubmit = onSubmit;
      return null;
    }

    render(<Expose />);

    await (globalThis as any).__onSubmit({
      reservation_email: 'email@email.com',
      reservation_website: 'www.website.com',
      reservation_phone_number: '7789787786',
    });

    expect(mockMutateAsync).toHaveBeenCalled();
    expect(mockAddSuccessNotification).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_RESERVATION,
      params: { id: 'REC123' },
    });
  });

  it('handles mutation failure by showing error notification and rethrowing', async () => {
    const error = new Error('boom');
    mockMutateAsync.mockRejectedValue(error);
    mockHandleApiError.mockResolvedValue({ message: 'something went wrong' });

    function Expose() {
      const { onSubmit } = useEditReservationForm('REC123', null);
      (globalThis as any).__onSubmit = onSubmit;
      return null;
    }

    render(<Expose />);

    await (globalThis as any).__onSubmit({
      has_reservation: true,
      reservation_email: 'email@email.com',
      reservation_website: 'www.website.com',
      reservation_phone_number: '7789787786',
    });

    expect(mockHandleApiError).toHaveBeenCalled();
    expect(mockAddErrorNotification).toHaveBeenCalled();
  });

  it('handles mutation failure by sending validation error', async () => {
    const error = new Error('boom');
    mockMutateAsync.mockRejectedValue(error);
    mockHandleApiError.mockResolvedValue({
      message:
        'Validation error: reservation_website: invalid, reservation_phone_number: invalid, reservation_email: invalid',
    });

    function Expose() {
      const { onSubmit } = useEditReservationForm('REC123', null);
      (globalThis as any).__onSubmit = onSubmit;
      return null;
    }

    render(<Expose />);

    await (globalThis as any).__onSubmit({
      has_reservation: true,
      reservation_email: 'a',
      reservation_website: 'b',
      reservation_phone_number: 'c',
    });

    expect(mockHandleApiError).toHaveBeenCalled();
    expect(mockAddErrorNotification).toHaveBeenCalledTimes(3);
  });
});
