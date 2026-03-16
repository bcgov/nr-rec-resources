import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';

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
    const { result } = renderHook(() => useEditReservationForm('REC001', null));

    await result.current.onSubmit({
      has_reservation: true,
      reservation_method: undefined,
      reservation_contact: '',
    });
    expect(mockAddSuccessNotification).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(mockAddErrorNotification).toHaveBeenCalled();
  });

  it('calls update mutation, shows success notification and navigates on success', async () => {
    const returned = {
      reservation_email: undefined,
      reservation_website: 'https://www.website.com',
      reservation_phone_number: undefined,
    };
    mockMutateAsync.mockResolvedValue(returned);

    const { result } = renderHook(() =>
      useEditReservationForm('REC123', {
        rec_resource_id: 'REC123',
        reservation_email: undefined,
        reservation_website: 'https://www.website.com',
        reservation_phone_number: undefined,
      }),
    );

    await result.current.onSubmit({
      has_reservation: true,
      reservation_method: 'reservation_website',
      reservation_contact: 'https://www.website.com',
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      recResourceId: 'REC123',
      updateRecreationResourceReservationDto: {
        reservation_email: undefined,
        reservation_website: 'https://www.website.com',
        reservation_phone_number: undefined,
      },
    });
    expect(mockAddSuccessNotification).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_RESERVATION,
      params: { id: 'REC123' },
    });
  });

  it('defaults to website when multiple reservation methods exist', () => {
    const { result } = renderHook(() =>
      useEditReservationForm('REC123', {
        rec_resource_id: 'REC123',
        reservation_email: 'email@example.com',
        reservation_website: 'https://www.website.com',
        reservation_phone_number: '778-978-7786',
      }),
    );

    expect((result.current.control as any)._defaultValues).toMatchObject({
      has_reservation: true,
      reservation_method: 'reservation_website',
      reservation_contact: 'https://www.website.com',
    });
  });

  it('handles mutation failure by showing error notification and rethrowing', async () => {
    const error = new Error('boom');
    mockMutateAsync.mockRejectedValue(error);
    mockHandleApiError.mockResolvedValue({ message: 'something went wrong' });

    const { result } = renderHook(() => useEditReservationForm('REC123', null));

    await result.current.onSubmit({
      has_reservation: true,
      reservation_method: 'reservation_email',
      reservation_contact: 'email@email.com',
    });

    expect(mockHandleApiError).toHaveBeenCalled();
    expect(mockAddErrorNotification).toHaveBeenCalled();
  });

  it('clears dependent fields when reservations are toggled off', () => {
    const { result } = renderHook(() =>
      useEditReservationForm('REC123', {
        rec_resource_id: 'REC123',
        reservation_email: undefined,
        reservation_website: 'https://www.website.com',
        reservation_phone_number: undefined,
      }),
    );

    act(() => {
      result.current.handleHasReservationChange(false);
    });

    expect((result.current.control as any)._formValues).toMatchObject({
      has_reservation: false,
      reservation_contact: '',
    });
    expect((result.current.control as any)._formValues.reservation_method).toBe(
      undefined,
    );
  });

  it('updates reservation method and resets contact when the method changes', () => {
    const { result } = renderHook(() =>
      useEditReservationForm('REC123', {
        rec_resource_id: 'REC123',
        reservation_email: undefined,
        reservation_website: 'https://www.website.com',
        reservation_phone_number: undefined,
      }),
    );

    act(() => {
      result.current.handleReservationMethodChange('reservation_email');
    });

    expect((result.current.control as any)._formValues).toMatchObject({
      reservation_method: 'reservation_email',
      reservation_contact: '',
    });

    act(() => {
      result.current.handleReservationMethodChange('');
    });

    expect((result.current.control as any)._formValues.reservation_method).toBe(
      undefined,
    );
  });

  it('submits an empty payload when reservations are disabled', async () => {
    mockMutateAsync.mockResolvedValue({});

    const { result } = renderHook(() => useEditReservationForm('REC123', null));

    await result.current.onSubmit({
      has_reservation: false,
      reservation_method: undefined,
      reservation_contact: '',
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      recResourceId: 'REC123',
      updateRecreationResourceReservationDto: {
        reservation_email: undefined,
        reservation_website: undefined,
        reservation_phone_number: undefined,
      },
    });
  });
});
