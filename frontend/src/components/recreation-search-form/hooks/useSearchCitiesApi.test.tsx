import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSearchCitiesApi } from './useSearchCitiesApi';
import { TestQueryClientProvider } from '@/test-utils';

const mockCitiesResponse = {
  data: [
    {
      id: '1',
      attributes: {
        cityName: 'Vancouver',
        rank: 1,
        provinceCode: 'BC',
        lat: 49.2827,
        lon: -123.1207,
      },
    },
    {
      id: '2',
      attributes: {
        cityName: 'Victoria',
        rank: 2,
        provinceCode: 'BC',
        lat: 48.4284,
        lon: -123.3656,
      },
    },
  ],
};

describe('useSearchCitiesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fetch and return city data successfully', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCitiesResponse),
        }),
      ),
    );

    const { result } = renderHook(() => useSearchCitiesApi(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      {
        id: 1,
        cityName: 'Vancouver',
        rank: 1,
        provinceCode: 'BC',
        lat: 49.2827,
        lon: -123.1207,
      },
      {
        id: 2,
        cityName: 'Victoria',
        rank: 2,
        provinceCode: 'BC',
        lat: 48.4284,
        lon: -123.3656,
      },
    ]);

    expect(fetch).toHaveBeenCalledOnce();
  });

  it('should handle error when fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          statusText: 'Internal Server Error',
          json: () => Promise.resolve({}),
        }),
      ),
    );

    const { result } = renderHook(() => useSearchCitiesApi(), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Failed to fetch cities');
  });
});
