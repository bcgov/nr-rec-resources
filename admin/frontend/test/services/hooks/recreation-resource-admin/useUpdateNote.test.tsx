import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useUpdateNote } from '@/services/hooks/recreation-resource-admin/useUpdateNote';
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

describe('useUpdateNote', () => {
  const mockUpdateNote = vi.fn();
  const mockApi = { updateRecreationResourceNote: mockUpdateNote };

  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as any;
  const createRetryHandler = HelpersModule.createRetryHandler as any;

  let queryClient: QueryClient;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const REC_RESOURCE_ID = 'REC0019';
  const queryKey = RECREATION_RESOURCE_QUERY_KEYS.notes(REC_RESOURCE_ID);

  const makeNote = (id: string, title = `Title ${id}`) => ({
    note_id: id,
    rec_resource_id: REC_RESOURCE_ID,
    note_type_code: 'NOTE',
    title,
    body: '<p>body</p>',
    date_logged: '2026-05-14',
    created_by: 'IDIR\\jdoe',
    is_editable: true,
  });

  const update = async (result: any) =>
    act(async () => {
      await result.current
        .mutateAsync({
          recResourceId: REC_RESOURCE_ID,
          noteId: 'n1',
          title: 'New title',
          body: '<p>new body</p>',
        })
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

  it('sends the note id separately from the payload', async () => {
    mockUpdateNote.mockResolvedValueOnce(makeNote('n1'));

    const { result } = renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    await update(result);

    expect(mockUpdateNote).toHaveBeenCalledWith({
      recResourceId: REC_RESOURCE_ID,
      noteId: 'n1',
      updateRecreationNoteDto: {
        title: 'New title',
        body: '<p>new body</p>',
      },
    });
  });

  it('replaces the matching note in the cache and leaves the rest', async () => {
    queryClient.setQueryData(queryKey, [makeNote('n1'), makeNote('n2')]);
    mockUpdateNote.mockResolvedValueOnce(makeNote('n1', 'Updated'));

    const { result } = renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    await update(result);

    expect(
      (queryClient.getQueryData(queryKey) as any[]).map((n) => n.title),
    ).toEqual(['Updated', 'Title n2']);
  });

  it('seeds the cache when it was empty', async () => {
    mockUpdateNote.mockResolvedValueOnce(makeNote('n1', 'Updated'));

    const { result } = renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    await update(result);

    expect(
      (queryClient.getQueryData(queryKey) as any[]).map((n) => n.title),
    ).toEqual(['Updated']);
  });

  it('explains a 403 as an imported note', async () => {
    mockUpdateNote.mockRejectedValueOnce({ response: { status: 403 } });

    const { result } = renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    await update(result);

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Imported notes cannot be changed, and other notes can only be changed by their author or a super admin',
      'updateNote-locked',
    );
  });

  it('reports a 404', async () => {
    mockUpdateNote.mockRejectedValueOnce({ response: { status: 404 } });

    const { result } = renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    await update(result);

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Note not found',
      'updateNote-notfound',
    );
  });

  it('stays quiet for other error statuses', async () => {
    mockUpdateNote.mockRejectedValueOnce({ response: { status: 500 } });

    const { result } = renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    await update(result);

    expect(addErrorNotification).not.toHaveBeenCalled();
  });
  it('notifies once the retries are exhausted', () => {
    renderHook(() => useUpdateNote(), { wrapper: Wrapper });
    createRetryHandler.mock.calls[0][0].onFail();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to save note after multiple attempts. Please try again later.',
      'updateNote-error',
    );
  });
});
