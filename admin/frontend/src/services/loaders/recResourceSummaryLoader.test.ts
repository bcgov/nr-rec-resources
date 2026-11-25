import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { recResourceSummaryLoader } from './recResourceSummaryLoader';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';

const { getTokenMock, mapDetailMock } = vi.hoisted(() => ({
  getTokenMock: vi.fn<() => Promise<string>>(),
  mapDetailMock: vi.fn(),
}));

vi.mock('@/services/auth', () => ({
  AuthService: {
    getInstance: () => ({
      getToken: getTokenMock,
    }),
  },
}));

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  mapRecreationResourceDetail: mapDetailMock,
}));

describe('recResourceSummaryLoader', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    getTokenMock.mockResolvedValue('test-token');
    mapDetailMock.mockImplementation((value) => ({ mapped: true, value }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('loads and maps summary data with trimmed base URL', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://example.test/api///');

    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ rec_resource_id: 'REC-1' }),
    } as unknown as Response);

    const ensureQueryData = vi.fn(async ({ queryFn }) => queryFn());
    const result = await recResourceSummaryLoader({
      context: { queryClient: { ensureQueryData } },
      params: { id: 'REC-1' },
    });

    expect(ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.summary('REC-1'),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      'https://example.test/api/recreation-resources/REC-1/summary',
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer test-token',
          Accept: 'application/json',
        },
      }),
    );
    expect(mapDetailMock).toHaveBeenCalledWith({ rec_resource_id: 'REC-1' });
    expect(result).toEqual({
      recResource: { mapped: true, value: { rec_resource_id: 'REC-1' } },
    });
  });

  it('falls back to /api when base URL is not set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '');

    fetchMock.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ rec_resource_id: 'REC-2' }),
    } as unknown as Response);

    await recResourceSummaryLoader({
      context: {
        queryClient: {
          ensureQueryData: async ({
            queryFn,
          }: {
            queryFn: () => Promise<unknown>;
          }) => queryFn(),
        },
      },
      params: { id: 'REC-2' },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/recreation-resources/REC-2/summary',
      expect.any(Object),
    );
  });

  it('throws a useful error when request fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn(),
    } as unknown as Response);

    await expect(
      recResourceSummaryLoader({
        context: {
          queryClient: {
            ensureQueryData: async ({
              queryFn,
            }: {
              queryFn: () => Promise<unknown>;
            }) => queryFn(),
          },
        },
        params: { id: 'REC-3' },
      }),
    ).rejects.toThrow('Failed to load summary (503)');
  });
});
