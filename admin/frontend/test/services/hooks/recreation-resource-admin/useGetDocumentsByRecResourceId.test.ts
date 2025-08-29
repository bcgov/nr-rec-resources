import { describe, it, beforeEach, vi, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGetDocumentsByRecResourceId } from '@/services/hooks/recreation-resource-admin/useGetDocumentsByRecResourceId';
import { reactQueryWrapper } from '@test/test-utils/reactQueryWrapper';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import * as helpers from '@/services/hooks/recreation-resource-admin/helpers';
import * as notificationStore from '@/store/notificationStore';

const mockGetDocumentsByRecResourceId = vi.fn();
const mockTransformDocs = vi.fn();
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
    vi.spyOn(helpers, 'transformRecreationResourceDocs').mockImplementation(
      mockTransformDocs,
    );
    vi.spyOn(notificationStore, 'addErrorNotification').mockImplementation(
      mockAddErrorNotification,
    );
  });

  it('returns transformed documents on success', async () => {
    const docs = [{ id: 1 }];
    const transformed = [{ id: 1, title: 'doc' }];
    mockGetDocumentsByRecResourceId.mockResolvedValueOnce(docs);
    mockTransformDocs.mockReturnValueOnce(transformed);

    const { result } = renderHook(() => useGetDocumentsByRecResourceId('abc'), {
      wrapper: reactQueryWrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual(transformed));
    expect(mockGetDocumentsByRecResourceId).toHaveBeenCalledWith({
      recResourceId: 'abc',
    });
    expect(mockTransformDocs).toHaveBeenCalledWith(docs);
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
      wrapper: reactQueryWrapper,
    });

    expect(mockAddErrorNotification).toHaveBeenCalledWith(
      'Failed to load documents after multiple attempts. Please try again later.',
      'getDocumentsByRecResourceId-error',
    );
  });
});
