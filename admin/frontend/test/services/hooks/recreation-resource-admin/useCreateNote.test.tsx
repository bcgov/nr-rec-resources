import { useCreateNote } from '@/services/hooks/recreation-resource-admin/useCreateNote';
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

describe('useCreateNote', () => {
  const harness = setupNoteHook('createRecreationResourceNote');

  const create = (result: { current: ReturnType<typeof useCreateNote> }) =>
    mutateQuietly(() =>
      result.current.mutateAsync({
        recResourceId: REC_RESOURCE_ID,
        title: 'A title',
        body: '<p>body</p>',
      }),
    );

  it('posts the title and body under the resource id', async () => {
    harness.apiCall.mockResolvedValueOnce(makeNote('n1'));

    const { result } = harness.render(useCreateNote);
    await create(result);

    expect(harness.apiCall).toHaveBeenCalledWith({
      recResourceId: REC_RESOURCE_ID,
      createRecreationNoteDto: { title: 'A title', body: '<p>body</p>' },
    });
  });

  it('puts the new note at the front of the cached list', async () => {
    harness.seed([makeNote('existing')]);
    harness.apiCall.mockResolvedValueOnce(makeNote('new'));

    const { result } = harness.render(useCreateNote);
    await create(result);

    expect(harness.cached().map((n) => n.note_id)).toEqual(['new', 'existing']);
  });

  it('seeds the cache when it was empty', async () => {
    harness.apiCall.mockResolvedValueOnce(makeNote('new'));

    const { result } = harness.render(useCreateNote);
    await create(result);

    expect(harness.cached().map((n) => n.note_id)).toEqual(['new']);
  });

  itReportsErrors({
    harness,
    hook: useCreateNote,
    mutate: create,
    statuses: [
      {
        label: 'notifies on a 404',
        status: 404,
        message: 'Resource not found',
        key: 'createNote-notfound',
      },
    ],
    retry: {
      message:
        'Failed to save note after multiple attempts. Please try again later.',
      key: 'createNote-error',
    },
  });
});
