import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { addErrorNotification } from '@/store/notificationStore';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, expect, it, Mock, vi } from 'vitest';

export const REC_RESOURCE_ID = 'REC0019';

export const notesQueryKey =
  RECREATION_RESOURCE_QUERY_KEYS.notes(REC_RESOURCE_ID);

export const makeNote = (id: string, title = `Title ${id}`) => ({
  note_id: id,
  rec_resource_id: REC_RESOURCE_ID,
  note_type_code: 'NOTE',
  title,
  body: '<p>body</p>',
  date_logged: '2026-05-14',
  created_by: 'IDIR\\jdoe',
  is_editable: true,
});

type Note = ReturnType<typeof makeNote>;

/**
 * Wires the api client, the retry handler and a fresh QueryClient before each
 * test. The vi.mock calls stay in the test files, since those are hoisted per
 * file.
 */
export function setupNoteHook(apiMethod: string) {
  const apiCall = vi.fn();
  const retryHandler = HelpersModule.createRetryHandler as Mock;
  let queryClient: QueryClient;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    (
      ApiClientModule.useRecreationResourceAdminApiClient as Mock
    ).mockReturnValue({ [apiMethod]: apiCall });
    retryHandler.mockReturnValue(() => false);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  return {
    apiCall,
    retryHandler,
    render: <T,>(hook: () => T) => renderHook(hook, { wrapper: Wrapper }),
    seed: (notes: Note[]) => queryClient.setQueryData(notesQueryKey, notes),
    cached: () => (queryClient.getQueryData(notesQueryKey) ?? []) as Note[],
    /** Undefined when the hook never wrote the cache, which `cached` hides. */
    rawCached: () => queryClient.getQueryData(notesQueryKey),
    /** Fires the onFail the hook handed to createRetryHandler. */
    exhaustRetries: () => retryHandler.mock.calls[0][0].onFail(),
  };
}

export type NoteHookHarness = ReturnType<typeof setupNoteHook>;

interface ErrorCase {
  /** The it() name, so each case still reads as its own sentence. */
  label: string;
  status: number;
  message: string;
  key: string;
}

/**
 * The error branches all three note mutations share: a status that notifies, a
 * status that stays silent, and the retry handler giving up.
 */
export function itReportsErrors<T>({
  harness,
  hook,
  mutate,
  statuses,
  retry,
}: {
  harness: NoteHookHarness;
  hook: () => T;
  mutate: (result: { current: T }) => Promise<unknown>;
  statuses: ErrorCase[];
  retry: { message: string; key: string };
}) {
  for (const { label, status, message, key } of statuses) {
    it(label, async () => {
      harness.apiCall.mockRejectedValueOnce({ response: { status } });

      const { result } = harness.render(hook);
      await mutate(result);

      expect(addErrorNotification).toHaveBeenCalledWith(message, key);
    });
  }

  it('stays quiet for other error statuses', async () => {
    harness.apiCall.mockRejectedValueOnce({ response: { status: 500 } });

    const { result } = harness.render(hook);
    await mutate(result);

    expect(addErrorNotification).not.toHaveBeenCalled();
  });

  it('notifies once the retries are exhausted', () => {
    harness.render(hook);
    harness.exhaustRetries();

    expect(addErrorNotification).toHaveBeenCalledWith(retry.message, retry.key);
  });
}

/** mutateAsync, swallowing the rejection so the assertions still run. */
export const mutateQuietly = (fn: () => Promise<unknown>) =>
  act(async () => {
    await fn().catch(() => undefined);
  });
