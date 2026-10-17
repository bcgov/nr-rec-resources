import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useCreateNote } from '@/services/hooks/recreation-resource-admin/useCreateNote';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
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

describe('useCreateNote', () => {
  const mockCreateNote = vi.fn();
  const mockApi = { createRecreationResourceNote: mockCreateNote };

  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as any;
  const createRetryHandler = HelpersModule.createRetryHandler as any;

  let queryClient: QueryClient;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const REC_RESOURCE_ID = 'REC0019';
  const queryKey = RECREATION_RESOURCE_QUERY_KEYS.notes(REC_RESOURCE_ID);

  const makeNote = (id: string) => ({
    note_id: id,
    rec_resource_id: REC_RESOURCE_ID,
    note_type_code: 'NOTE',
    title: `Title ${id}`,
    body: '<p>body</p>',
    date_logged: '2026-05-14',
    created_by: 'IDIR\\jdoe',
    is_editable: true,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('posts the title and body under the resource id', async () => {
    mockCreateNote.mockResolvedValueOnce(makeNote('n1'));

    const { result } = renderHook(() => useCreateNote(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recResourceId: REC_RESOURCE_ID,
        title: 'A title',
        body: '<p>body</p>',
      });
    });

    expect(mockCreateNote).toHaveBeenCalledWith({
      recResourceId: REC_RESOURCE_ID,
      createRecreationNoteDto: { title: 'A title', body: '<p>body</p>' },
    });
  });

  it('puts the new note at the front of the cached list', async () => {
    queryClient.setQueryData(queryKey, [makeNote('existing')]);
    mockCreateNote.mockResolvedValueOnce(makeNote('new'));

    const { result } = renderHook(() => useCreateNote(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recResourceId: REC_RESOURCE_ID,
        title: 'A title',
        body: '<p>body</p>',
      });
    });

    expect(
      (queryClient.getQueryData(queryKey) as any[]).map((n) => n.note_id),
    ).toEqual(['new', 'existing']);
  });

  it('seeds the cache when it was empty', async () => {
    mockCreateNote.mockResolvedValueOnce(makeNote('new'));

    const { result } = renderHook(() => useCreateNote(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync({
        recResourceId: REC_RESOURCE_ID,
        title: 'A title',
        body: '<p>body</p>',
      });
    });

    expect(
      (queryClient.getQueryData(queryKey) as any[]).map((n) => n.note_id),
    ).toEqual(['new']);
  });

  it('notifies on a 404', async () => {
    mockCreateNote.mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useCreateNote(), { wrapper: Wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({
          recResourceId: REC_RESOURCE_ID,
          title: 'A title',
          body: '<p>body</p>',
        })
        .catch(() => undefined);
    });

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Resource not found',
      'createNote-notfound',
    );
  });

  it('stays quiet for other error statuses', async () => {
    mockCreateNote.mockRejectedValueOnce({ response: { status: 500 } });

    const { result } = renderHook(() => useCreateNote(), { wrapper: Wrapper });

    await act(async () => {
      await result.current
        .mutateAsync({
          recResourceId: REC_RESOURCE_ID,
          title: 'A title',
          body: '<p>body</p>',
        })
        .catch(() => undefined);
    });

    expect(addErrorNotification).not.toHaveBeenCalled();
  });
  it('notifies once the retries are exhausted', () => {
    renderHook(() => useCreateNote(), { wrapper: Wrapper });
    createRetryHandler.mock.calls[0][0].onFail();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to save note after multiple attempts. Please try again later.',
      'createNote-error',
    );
  });
});
