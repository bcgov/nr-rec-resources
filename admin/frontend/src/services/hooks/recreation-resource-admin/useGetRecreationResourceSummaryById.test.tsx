import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetRecreationResourceSummaryById } from './useGetRecreationResourceSummaryById';

const {
  getTokenMock,
  createRetryHandlerMock,
  retryHandlerMock,
  mapDetailMock,
} = vi.hoisted(() => ({
  getTokenMock: vi.fn<() => Promise<string>>(),
  createRetryHandlerMock: vi.fn(),
  retryHandlerMock: vi.fn(),
  mapDetailMock: vi.fn(),
}));

vi.mock('@/services/auth', () => ({
  AuthService: {
    getInstance: () => ({
      getToken: getTokenMock,
    }),
  },
}));

vi.mock('./helpers', () => ({
  createRetryHandler: createRetryHandlerMock,
  mapRecreationResourceDetail: mapDetailMock,
}));

describe('useGetRecreationResourceSummaryById', () => {
  const fetchMock = vi.fn<typeof fetch>();

  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    getTokenMock.mockResolvedValue('summary-token');
    retryHandlerMock.mockReturnValue(false);
    createRetryHandlerMock.mockReturnValue(retryHandlerMock);
    mapDetailMock.mockImplementation((value) => ({ ...value, mapped: true }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('fetches summary and maps data when id is provided', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.test/api/');

    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ rec_resource_id: 'REC-99' }),
    } as unknown as Response);

    const { result } = renderHook(
      () => useGetRecreationResourceSummaryById('REC-99'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/api/recreation-resources/REC-99/summary',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer summary-token',
          Accept: 'application/json',
        },
      }),
    );
    expect(result.current.data).toEqual({
      rec_resource_id: 'REC-99',
      mapped: true,
    });
    expect(createRetryHandlerMock.mock.calls.length).toBeGreaterThanOrEqual(1);
  });

  it('does not run query when id is missing', async () => {
    const { result } = renderHook(
      () => useGetRecreationResourceSummaryById(undefined),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('does not run query when explicitly disabled', async () => {
    const { result } = renderHook(
      () => useGetRecreationResourceSummaryById('REC-100', { enabled: false }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.fetchStatus).toBe('idle'));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });

  it('returns an error when API response is not ok', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    } as unknown as Response);

    const { result } = renderHook(
      () => useGetRecreationResourceSummaryById('REC-101'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recreation-resources/REC-101/summary',
      expect.any(Object),
    );
    expect((result.current.error as Error).message).toBe(
      'Failed to load summary (500)',
    );
  });
});
