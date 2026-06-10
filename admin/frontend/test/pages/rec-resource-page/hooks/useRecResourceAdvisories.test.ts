import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRecResourceAdvisories } from '@/pages/rec-resource-page/hooks/useRecResourceAdvisories';
import useGetRecreationResourceAdvisories from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceAdvisories';
import { handleApiError } from '@/services/utils/errorHandler';
import { addErrorNotification } from '@/store/notificationStore';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceAdvisories',
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

const mockUseGet = vi.mocked(useGetRecreationResourceAdvisories);
const mockHandleApiError = vi.mocked(handleApiError);
const mockAddErrorNotification = vi.mocked(addErrorNotification);

describe('useRecResourceAdvisories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns advisories data when no error occurs', () => {
    const mockAdvisories = [{ advisory_number: 1001 }];
    mockUseGet.mockReturnValue({
      data: mockAdvisories,
      isLoading: false,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useRecResourceAdvisories('REC1'));

    expect(result.current).toEqual({
      rec_resource_id: 'REC1',
      advisories: mockAdvisories,
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

    const { result } = renderHook(() => useRecResourceAdvisories('REC2'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.advisories).toBeUndefined();
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

    renderHook(() => useRecResourceAdvisories('REC3'));

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

    renderHook(() => useRecResourceAdvisories('REC4'));

    await waitFor(() => {
      expect(mockHandleApiError).not.toHaveBeenCalled();
      expect(mockAddErrorNotification).not.toHaveBeenCalled();
    });
  });

  it('passes undefined rec_resource_id through', () => {
    mockUseGet.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: undefined,
    } as any);

    const { result } = renderHook(() => useRecResourceAdvisories(undefined));

    expect(result.current.rec_resource_id).toBeUndefined();
  });
});
