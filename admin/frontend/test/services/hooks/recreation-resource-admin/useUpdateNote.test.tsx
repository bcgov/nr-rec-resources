import { useUpdateNote } from '@/services/hooks/recreation-resource-admin/useUpdateNote';
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

describe('useUpdateNote', () => {
  const harness = setupNoteHook('updateRecreationResourceNote');

  const update = (result: { current: ReturnType<typeof useUpdateNote> }) =>
    mutateQuietly(() =>
      result.current.mutateAsync({
        recResourceId: REC_RESOURCE_ID,
        noteId: 'n1',
        title: 'New title',
        body: '<p>new body</p>',
      }),
    );

  it('sends the note id separately from the payload', async () => {
    harness.apiCall.mockResolvedValueOnce(makeNote('n1'));

    const { result } = harness.render(useUpdateNote);
    await update(result);

    expect(harness.apiCall).toHaveBeenCalledWith({
      recResourceId: REC_RESOURCE_ID,
      noteId: 'n1',
      updateRecreationNoteDto: {
        title: 'New title',
        body: '<p>new body</p>',
      },
    });
  });

  it('replaces the matching note in the cache and leaves the rest', async () => {
    harness.seed([makeNote('n1'), makeNote('n2')]);
    harness.apiCall.mockResolvedValueOnce(makeNote('n1', 'Updated'));

    const { result } = harness.render(useUpdateNote);
    await update(result);

    expect(harness.cached().map((n) => n.title)).toEqual([
      'Updated',
      'Title n2',
    ]);
  });

  it('seeds the cache when it was empty', async () => {
    harness.apiCall.mockResolvedValueOnce(makeNote('n1', 'Updated'));

    const { result } = harness.render(useUpdateNote);
    await update(result);

    expect(harness.cached().map((n) => n.title)).toEqual(['Updated']);
  });

  itReportsErrors({
    harness,
    hook: useUpdateNote,
    mutate: update,
    statuses: [
      {
        label: 'explains a 403 as an imported note',
        status: 403,
        message:
          'Imported notes cannot be changed, and other notes can only be changed by their author or a super admin',
        key: 'updateNote-locked',
      },
      {
        label: 'reports a 404',
        status: 404,
        message: 'Note not found',
        key: 'updateNote-notfound',
      },
    ],
    retry: {
      message:
        'Failed to save note after multiple attempts. Please try again later.',
      key: 'updateNote-error',
    },
  });
});
