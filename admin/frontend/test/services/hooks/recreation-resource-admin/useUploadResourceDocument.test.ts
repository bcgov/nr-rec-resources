import { describe, it, beforeEach, vi, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUploadResourceDocument } from '@/services/hooks/recreation-resource-admin/useUploadResourceDocument';
import { RecreationResourceApi } from '@/services/recreation-resource-admin/apis/RecreationResourceApi';
import * as apiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { TestQueryClientProvider } from '@test/test-utils';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

const mockCreateRecreationresourceDocument = vi.fn();

const mockApi: Partial<RecreationResourceApi> = {
  createRecreationresourceDocument: mockCreateRecreationresourceDocument,
};

describe('useUploadResourceDocument (vitest)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (
      apiClientModule.useRecreationResourceAdminApiClient as any
    ).mockReturnValue(mockApi);
  });

  it('calls createRecreationresourceDocument with correct params', async () => {
    const params = {
      recResourceId: '123',
      file: new File(['dummy content'], 'test.pdf', {
        type: 'application/pdf',
      }),
    };
    mockCreateRecreationresourceDocument.mockResolvedValueOnce({
      success: true,
    });

    const { result } = renderHook(() => useUploadResourceDocument(), {
      wrapper: TestQueryClientProvider,
    });

    await act(async () => {
      result.current.mutate(params);
    });

    expect(mockCreateRecreationresourceDocument).toHaveBeenCalledWith({
      recResourceId: params.recResourceId,
      file: params.file,
    });
  });
});
