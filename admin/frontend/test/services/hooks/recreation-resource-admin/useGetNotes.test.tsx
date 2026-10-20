import { useGetNotes } from '@/services/hooks/recreation-resource-admin/useGetNotes';
import { addErrorNotification } from '@/store/notificationStore';
import {
  makeNote,
  REC_RESOURCE_ID,
  setupNoteHook,
} from '@test/services/hooks/recreation-resource-admin/noteHookHarness';
import { waitFor } from '@testing-library/react';
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

describe('useGetNotes', () => {
  const harness = setupNoteHook('getRecreationResourceNotes');
  const note = makeNote('n1', 'A title');

  it('fetches notes for the resource', async () => {
    harness.apiCall.mockResolvedValueOnce([note]);

    const { result } = harness.render(() => useGetNotes(REC_RESOURCE_ID));

    await waitFor(() => expect(result.current.data).toEqual([note]));
    expect(harness.apiCall).toHaveBeenCalledWith({
      recResourceId: REC_RESOURCE_ID,
    });
  });

  it('starts with an empty list', () => {
    harness.apiCall.mockResolvedValueOnce([note]);

    const { result } = harness.render(() => useGetNotes(REC_RESOURCE_ID));

    expect(result.current.data).toEqual([]);
  });

  it('is disabled without a resource id', () => {
    const { result } = harness.render(() => useGetNotes(undefined));

    expect(result.current.fetchStatus).toBe('idle');
    expect(harness.apiCall).not.toHaveBeenCalled();
  });

  it('keys the query by resource id', async () => {
    harness.apiCall.mockResolvedValueOnce([note]);

    harness.render(() => useGetNotes(REC_RESOURCE_ID));

    await waitFor(() => expect(harness.cached()).toEqual([note]));
  });

  it('registers a retry handler', () => {
    harness.apiCall.mockResolvedValueOnce([]);

    harness.render(() => useGetNotes(REC_RESOURCE_ID));

    expect(harness.retryHandler).toHaveBeenCalled();
  });

  it('notifies once the retries are exhausted', () => {
    harness.apiCall.mockResolvedValueOnce([]);

    harness.render(() => useGetNotes(REC_RESOURCE_ID));
    harness.exhaustRetries();

    expect(addErrorNotification).toHaveBeenCalledWith(
      'Failed to load notes after multiple attempts. Please try again later.',
      'getNotes-error',
    );
  });
});
