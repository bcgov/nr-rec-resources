import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecResourceReservation } from '@/pages/rec-resource-page/hooks/useRecResourceReservation';
import useGetRecreationResourceReservation from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceReservation';
import { handleApiError } from '@/services/utils/errorHandler';
import { addErrorNotification } from '@/store/notificationStore';

/* ------------------ mocks ------------------ */

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceReservation',
  () => ({
    default: vi.fn(),
  }),
);

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

const mockUseGet = vi.mocked(useGetRecreationResourceReservation);
const mockHandleApiError = vi.mocked(handleApiError);
const mockAddErrorNotification = vi.mocked(addErrorNotification);

describe('useRecResourceReservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns reservation data when no error occurs', () => {
    mockUseGet.mockReturnValue({
      data: { id: 'RES123' },
      isLoading: false,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useRecResourceReservation('REC1'));

    expect(result.current).toEqual({
      rec_resource_id: 'REC1',
      reservationInfo: { id: 'RES123' },
      isLoading: false,
      error: undefined,
    });

    expect(mockHandleApiError).not.toHaveBeenCalled();
    expect(mockAddErrorNotification).not.toHaveBeenCalled();
  });

  it('returns loading state correctly', () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useRecResourceReservation('REC2'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.reservationInfo).toBeUndefined();
  });

  it('handles error and shows notification', async () => {
    const error = new Error('API failed');

    mockUseGet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error,
    } as any);

    mockHandleApiError.mockResolvedValue({
      message: 'Something went wrong',
    } as any);

    renderHook(() => useRecResourceReservation('REC3'));

    await waitFor(() => {
      expect(mockHandleApiError).toHaveBeenCalledWith(error);
      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        'Something went wrong',
      );
    });
  });

  it('does nothing when error is undefined', async () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as any);

    renderHook(() => useRecResourceReservation('REC4'));

    await waitFor(() => {
      expect(mockHandleApiError).not.toHaveBeenCalled();
      expect(mockAddErrorNotification).not.toHaveBeenCalled();
    });
  });
});
