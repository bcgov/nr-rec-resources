import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useGetNotes } from '@/services/hooks/recreation-resource-admin/useGetNotes';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: vi.fn(),
  addSuccessNotification: vi.fn(),
}));

describe('useGetNotes', () => {
  const mockGetNotes = vi.fn();
  const mockApi = { getRecreationResourceNotes: mockGetNotes };

  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as any;
  const createRetryHandler = HelpersModule.createRetryHandler as any;

  let queryClient: QueryClient;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const note = {
    note_id: 'n1',
    rec_resource_id: 'REC0019',
    note_type_code: 'NOTE',
    title: 'A title',
    body: '<p>body</p>',
    date_logged: '2026-05-14',
    created_by: 'IDIR\\jdoe',
    is_editable: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('fetches notes for the resource', async () => {
    mockGetNotes.mockResolvedValueOnce([note]);

    const { result } = renderHook(() => useGetNotes('REC0019'), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.data).toEqual([note]));
    expect(mockGetNotes).toHaveBeenCalledWith({ recResourceId: 'REC0019' });
  });

  it('starts with an empty list', () => {
    mockGetNotes.mockResolvedValueOnce([note]);

    const { result } = renderHook(() => useGetNotes('REC0019'), {
      wrapper: Wrapper,
    });

    expect(result.current.data).toEqual([]);
  });

  it('is disabled without a resource id', () => {
    const { result } = renderHook(() => useGetNotes(undefined), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetNotes).not.toHaveBeenCalled();
  });

  it('keys the query by resource id', async () => {
    mockGetNotes.mockResolvedValueOnce([note]);

    renderHook(() => useGetNotes('REC0019'), { wrapper: Wrapper });

    await waitFor(() =>
      expect(
        queryClient.getQueryData(
          RECREATION_RESOURCE_QUERY_KEYS.notes('REC0019'),
        ),
      ).toEqual([note]),
    );
  });

  it('registers a retry handler', () => {
    mockGetNotes.mockResolvedValueOnce([]);

    renderHook(() => useGetNotes('REC0019'), { wrapper: Wrapper });

    expect(createRetryHandler).toHaveBeenCalled();
  });

  it('notifies once the retries are exhausted', () => {
    mockGetNotes.mockResolvedValueOnce([]);

    renderHook(() => useGetNotes('REC0019'), { wrapper: Wrapper });
    createRetryHandler.mock.calls[0][0].onFail();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to load notes after multiple attempts. Please try again later.',
      'getNotes-error',
    );
  });
});
