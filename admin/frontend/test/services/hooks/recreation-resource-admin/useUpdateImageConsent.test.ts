import { Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { TestQueryClientProvider } from '@test/test-utils';
import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useUpdateImageConsent } from '@/services/hooks/recreation-resource-admin/useUpdateImageConsent';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

describe('useUpdateImageConsent', () => {
  const mockApi = {
    updateImageConsent: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('should return a mutation function', () => {
    const { result } = renderHook(() => useUpdateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('should configure retry with createRetryHandler', () => {
    renderHook(() => useUpdateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it('should use the API client for updates', () => {
    renderHook(() => useUpdateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });

  it('should call updateImageConsent with correct parameters', async () => {
    const mockParams = {
      recResourceId: 'test-resource-id',
      imageId: 'test-image-id',
      fileName: 'test.jpg',
      dateTaken: '2024-06-15',
    };

    mockApi.updateImageConsent.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useUpdateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    await result.current.mutateAsync(mockParams);

    expect(mockApi.updateImageConsent).toHaveBeenCalledWith({
      recResourceId: 'test-resource-id',
      imageId: 'test-image-id',
      updateImageConsentDto: {
        file_name: 'test.jpg',
        date_taken: '2024-06-15',
      },
    });
  });
});
