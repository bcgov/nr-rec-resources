import * as helpers from '@/services/hooks/recreation-resource-admin/helpers';
import { useGetDocumentsByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import * as notificationStore from '@/store/notificationStore';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetDocumentsByRecResourceId = vi.fn();
const mockAddErrorNotification = vi.fn();

const mockApi = {
  getDocumentsByRecResourceId: mockGetDocumentsByRecResourceId,
};

describe('useGetDocumentsByRecResourceId', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(
      apiClientModule,
      'useRecreationResourceAdminApiClient',
    ).mockReturnValue(mockApi as any);
    vi.spyOn(notificationStore, 'addErrorNotification').mockImplementation(
      mockAddErrorNotification,
    );
  });

  it('returns documents directly from API on success', async () => {
    const docs = [{ id: 1, title: 'doc', url: 'https://example.com/doc.pdf' }];
    mockGetDocumentsByRecResourceId.mockResolvedValueOnce(docs);

    const { result } = renderHook(() => useGetDocumentsByRecResourceId('abc'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => expect(result.current.data).toEqual(docs));
    expect(mockGetDocumentsByRecResourceId).toHaveBeenCalledWith({
      recResourceId: 'abc',
    });
  });

  it('calls addErrorNotification when retries are exhausted (onFail)', async () => {
    // Mock createRetryHandler to immediately call onFail
    const mockRetryHandler = vi.fn();
    vi.spyOn(helpers, 'createRetryHandler').mockImplementation(
      (options?: { maxRetries?: number; onFail?: () => void }) => {
        if (options && options.onFail) options.onFail();
        return mockRetryHandler;
      },
    );

    renderHook(() => useGetDocumentsByRecResourceId('fail-id'), {
      wrapper: TestQueryClientProvider,
    });

    expect(mockAddErrorNotification).toHaveBeenCalledWith(
      'Failed to load documents after multiple attempts. Please try again later.',
      'getDocumentsByRecResourceId-error',
    );
  });
});
