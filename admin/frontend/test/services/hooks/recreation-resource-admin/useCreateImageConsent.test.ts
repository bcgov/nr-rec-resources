import { Mock, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { TestQueryClientProvider } from '@test/test-utils';
import { createRetryHandler } from '@/services/hooks/recreation-resource-admin/helpers';
import { useCreateImageConsent } from '@/services/hooks/recreation-resource-admin/useCreateImageConsent';
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

describe('useCreateImageConsent', () => {
  const mockApi = {
    createImageConsent: vi.fn(),
  };
  const mockRetryHandler = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceAdminApiClient as Mock).mockReturnValue(mockApi);
    (createRetryHandler as Mock).mockReturnValue(mockRetryHandler);
  });

  it('should return a mutation function', () => {
    const { result } = renderHook(() => useCreateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current).toHaveProperty('mutateAsync');
    expect(result.current).toHaveProperty('isPending');
  });

  it('should configure retry with createRetryHandler', () => {
    renderHook(() => useCreateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it('should use the API client for creation', () => {
    renderHook(() => useCreateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    expect(useRecreationResourceAdminApiClient).toHaveBeenCalled();
  });

  it('should call createImageConsent with correct parameters', async () => {
    const mockParams = {
      recResourceId: 'test-resource-id',
      imageId: 'test-image-id',
      fileName: 'test.jpg',
      dateTaken: '2024-06-15',
      containsPii: true,
      photographerType: 'STAFF',
      photographerName: 'Jane Doe',
      consentForm: new File(['x'], 'consent.pdf'),
    };

    mockApi.createImageConsent.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useCreateImageConsent(), {
      wrapper: TestQueryClientProvider,
    });

    await result.current.mutateAsync(mockParams);

    expect(mockApi.createImageConsent).toHaveBeenCalledWith({
      recResourceId: 'test-resource-id',
      imageId: 'test-image-id',
      fileName: 'test.jpg',
      dateTaken: '2024-06-15',
      containsPii: true,
      photographerType: 'STAFF',
      photographerName: 'Jane Doe',
      consentForm: mockParams.consentForm,
    });
  });
});
