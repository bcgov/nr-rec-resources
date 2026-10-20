import { useDeleteNote } from '@/services/hooks/recreation-resource-admin/useDeleteNote';
import {
  itReportsErrors,
  makeNote,
  mutateQuietly,
  REC_RESOURCE_ID,
  setupNoteHook,
} from '@test/services/hooks/recreation-resource-admin/noteHookHarness';
import { describe, expect, it, vi } from 'vitest';

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
  const harness = setupNoteHook('deleteRecreationResourceNote');

  const remove = (result: { current: ReturnType<typeof useDeleteNote> }) =>
    mutateQuietly(() =>
      result.current.mutateAsync({
        recResourceId: REC_RESOURCE_ID,
        noteId: 'n1',
      }),
    );

  it('calls the API with the resource and note ids', async () => {
    harness.apiCall.mockResolvedValueOnce(makeNote('n1'));

    const { result } = harness.render(useDeleteNote);
    await remove(result);

    expect(harness.apiCall).toHaveBeenCalledWith({
      recResourceId: REC_RESOURCE_ID,
      noteId: 'n1',
    });
  });

  it('drops the note from the cached list', async () => {
    harness.seed([makeNote('n1'), makeNote('n2')]);
    harness.apiCall.mockResolvedValueOnce(makeNote('n1'));

    const { result } = harness.render(useDeleteNote);
    await remove(result);

    expect(harness.cached().map((n) => n.note_id)).toEqual(['n2']);
  });

  it('leaves an empty list when the cache was empty', async () => {
    harness.apiCall.mockResolvedValueOnce(makeNote('n1'));

    const { result } = harness.render(useDeleteNote);
    await remove(result);

    expect(harness.rawCached()).toEqual([]);
  });

  itReportsErrors({
    harness,
    hook: useDeleteNote,
    mutate: remove,
    statuses: [
      {
        label: 'explains a 403 as an imported note',
        status: 403,
        message:
          'Imported notes cannot be removed, and other notes can only be removed by their author or a super admin',
        key: 'deleteNote-locked',
      },
      {
        label: 'reports a 404',
        status: 404,
        message: 'Note not found',
        key: 'deleteNote-notfound',
      },
    ],
    retry: {
      message:
        'Failed to remove note after multiple attempts. Please try again later.',
      key: 'deleteNote-error',
    },
  });
});
