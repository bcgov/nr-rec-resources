import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { useGetRecreationResourceById } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceById';
import { handleApiError } from '@/services/utils/errorHandler';
import * as notificationStore from '@/store/notificationStore';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useParams: vi.fn(),
  };
});

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceById',
  () => ({
    useGetRecreationResourceById: vi.fn(),
  }),
);

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
}));

import { useParams } from '@tanstack/react-router';

const mockRecResource = {
  rec_resource_id: 'test-resource-123',
  name: 'Test Resource',
  closest_community: 'Test Community',
  recreation_activity: [],
  recreation_status: { status_code: 1, comment: '', description: 'Open' },
  rec_resource_type: 'RR',
  description: 'Test description',
  driving_directions: 'Test directions',
  maintenance_standard_code: 'U' as const,
  campsite_count: 0,
  recreation_access: [],
  recreation_structure: { has_toilet: false, has_table: false },
};

describe('useRecResource', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useParams to return a test ID
    vi.mocked(useParams).mockReturnValue({ id: 'test-resource-123' });

    // Mock handleApiError to return expected error format
    vi.mocked(handleApiError).mockResolvedValue({
      statusCode: 500,
      message: 'Failed to load resource',
      isResponseError: false,
      isAuthError: false,
    });
  });

  it('returns the correct data structure when resource is loaded successfully', () => {
    vi.mocked(useGetRecreationResourceById).mockReturnValue({
      data: mockRecResource,
      isLoading: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useRecResource());

    expect(result.current).toEqual({
      rec_resource_id: 'test-resource-123',
      recResource: mockRecResource,
      isLoading: false,
      error: null,
    });
  });

  it('returns loading state when data is being fetched', () => {
    vi.mocked(useGetRecreationResourceById).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    const { result } = renderHook(() => useRecResource());

    expect(result.current).toEqual({
      rec_resource_id: 'test-resource-123',
      recResource: undefined,
      isLoading: true,
      error: null,
    });
  });

  it('returns error state when fetch fails', () => {
    const mockError = new Error('Network error');
    vi.mocked(useGetRecreationResourceById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    } as any);

    const { result } = renderHook(() => useRecResource());

    expect(result.current).toEqual({
      rec_resource_id: 'test-resource-123',
      recResource: undefined,
      isLoading: false,
      error: mockError,
    });
  });

  it('handles undefined rec_resource_id from useParams', () => {
    vi.mocked(useParams).mockReturnValue({ id: undefined });
    vi.mocked(useGetRecreationResourceById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    const { result } = renderHook(() => useRecResource());

    expect(result.current.rec_resource_id).toBeUndefined();
    expect(useGetRecreationResourceById).toHaveBeenCalledWith(undefined);
  });

  it('calls useGetRecreationResourceById with the correct resource ID', () => {
    vi.mocked(useGetRecreationResourceById).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    } as any);

    renderHook(() => useRecResource());

    expect(useGetRecreationResourceById).toHaveBeenCalledWith(
      'test-resource-123',
    );
  });

  describe('error handling', () => {
    it('shows error notification when there is an error', async () => {
      const mockError = new Error('Network error');
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      } as any);

      renderHook(() => useRecResource());

      // Wait for useEffect to run
      await vi.waitFor(() => {
        expect(handleApiError).toHaveBeenCalledWith(mockError);
        expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
          'Failed to load resource',
        );
      });
    });

    it('does not show error notification when there is no error', async () => {
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: mockRecResource,
        isLoading: false,
        error: null,
      } as any);

      renderHook(() => useRecResource());

      // Wait a bit to ensure useEffect doesn't run
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(handleApiError).not.toHaveBeenCalled();
      expect(notificationStore.addErrorNotification).not.toHaveBeenCalled();
    });

    it('handles error that becomes null (error resolution)', async () => {
      const mockError = new Error('Network error');

      // Initial render with error
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      } as any);

      const { rerender } = renderHook(() => useRecResource());

      await vi.waitFor(() => {
        expect(handleApiError).toHaveBeenCalledWith(mockError);
        expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
          'Failed to load resource',
        );
      });

      // Clear mocks
      vi.clearAllMocks();

      // Re-render with no error
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: mockRecResource,
        isLoading: false,
        error: null,
      } as any);

      rerender();

      // Wait a bit to ensure useEffect doesn't run again
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(handleApiError).not.toHaveBeenCalled();
      expect(notificationStore.addErrorNotification).not.toHaveBeenCalled();
    });

    it('handles multiple different errors', async () => {
      const firstError = new Error('First error');

      // Initial render with first error
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: firstError,
      } as any);

      const { rerender } = renderHook(() => useRecResource());

      await vi.waitFor(() => {
        expect(handleApiError).toHaveBeenCalledWith(firstError);
      });

      // Mock different error response for second error
      vi.mocked(handleApiError).mockResolvedValue({
        statusCode: 404,
        message: 'Resource not found',
        isResponseError: true,
        isAuthError: false,
      });

      const secondError = new Error('Second error');

      // Re-render with second error
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: secondError,
      } as any);

      rerender();

      await vi.waitFor(() => {
        expect(handleApiError).toHaveBeenCalledWith(secondError);
        expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
          'Resource not found',
        );
      });
    });
  });

  describe('integration scenarios', () => {
    it('handles complete loading to success flow', async () => {
      // Start with loading
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { result, rerender } = renderHook(() => useRecResource());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.recResource).toBeUndefined();

      // Transition to success
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: mockRecResource,
        isLoading: false,
        error: null,
      } as any);

      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.recResource).toEqual(mockRecResource);
      expect(result.current.error).toBeNull();
    });

    it('handles complete loading to error flow', async () => {
      // Start with loading
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);

      const { result, rerender } = renderHook(() => useRecResource());

      expect(result.current.isLoading).toBe(true);

      // Transition to error
      const mockError = new Error('Load failed');
      vi.mocked(useGetRecreationResourceById).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: mockError,
      } as any);

      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(mockError);

      await vi.waitFor(() => {
        expect(notificationStore.addErrorNotification).toHaveBeenCalledWith(
          'Failed to load resource',
        );
      });
    });
  });
});
