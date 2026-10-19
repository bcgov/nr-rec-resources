import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useDeleteNote } from '@/services/hooks/recreation-resource-admin/useDeleteNote';
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

describe('useDeleteNote', () => {
  const mockDeleteNote = vi.fn();
  const mockApi = { deleteRecreationResourceNote: mockDeleteNote };

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

  const remove = async (result: any) =>
    act(async () => {
      await result.current
        .mutateAsync({ recResourceId: REC_RESOURCE_ID, noteId: 'n1' })
        .catch(() => undefined);
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

  it('calls the API with the resource and note ids', async () => {
    mockDeleteNote.mockResolvedValueOnce(makeNote('n1'));

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    await remove(result);

    expect(mockDeleteNote).toHaveBeenCalledWith({
      recResourceId: REC_RESOURCE_ID,
      noteId: 'n1',
    });
  });

  it('drops the note from the cached list', async () => {
    queryClient.setQueryData(queryKey, [makeNote('n1'), makeNote('n2')]);
    mockDeleteNote.mockResolvedValueOnce(makeNote('n1'));

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    await remove(result);

    expect(
      (queryClient.getQueryData(queryKey) as any[]).map((n) => n.note_id),
    ).toEqual(['n2']);
  });

  it('leaves an empty list when the cache was empty', async () => {
    mockDeleteNote.mockResolvedValueOnce(makeNote('n1'));

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    await remove(result);

    expect(queryClient.getQueryData(queryKey)).toEqual([]);
  });

  it('explains a 403 as an imported note', async () => {
    mockDeleteNote.mockRejectedValueOnce({ response: { status: 403 } });

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    await remove(result);

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Imported notes cannot be removed, and other notes can only be removed by their author or a super admin',
      'deleteNote-locked',
    );
  });

  it('reports a 404', async () => {
    mockDeleteNote.mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    await remove(result);

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Note not found',
      'deleteNote-notfound',
    );
  });

  it('stays quiet for other error statuses', async () => {
    mockDeleteNote.mockRejectedValueOnce({ response: { status: 500 } });

    const { result } = renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    await remove(result);

    expect(addErrorNotification).not.toHaveBeenCalled();
  });
  it('notifies once the retries are exhausted', () => {
    renderHook(() => useDeleteNote(), { wrapper: Wrapper });
    createRetryHandler.mock.calls[0][0].onFail();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to remove note after multiple attempts. Please try again later.',
      'deleteNote-error',
    );
  });
});
