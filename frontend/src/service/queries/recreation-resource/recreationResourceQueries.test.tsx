import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecreationResourceApi } from '@/service/hooks/useRecreationResourceApi';
import {
  transformRecreationResourceBase,
  transformRecreationResourceDetail,
} from '@/service/queries/recreation-resource/helpers';
import {
  useGetRecreationResourceById,
  useSearchRecreationResourcesPaginated,
} from '@/service/queries/recreation-resource/recreationResourceQueries';
import { TestQueryClientProvider } from '@/test-utils';

// Mock the API hook and transform functions
vi.mock('@/service/hooks/useRecreationResourceApi');
vi.mock('@/service/queries/recreation-resource/helpers', () => ({
  transformRecreationResourceBase: vi.fn((data) => data),
  transformRecreationResourceDetail: vi.fn((data) => data),
}));

describe('useGetRecreationResourceById', () => {
  const mockApi = {
    getRecreationResourceById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
    (transformRecreationResourceDetail as any).mockImplementation(
      (data: any) => data,
    );
  });

  it('should return undefined when no id is provided', async () => {
    const { result } = renderHook(
      () => useGetRecreationResourceById({ imageSizeCodes: ['llc'] }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.data).toBeUndefined();
    expect(mockApi.getRecreationResourceById).not.toHaveBeenCalled();
    expect(transformRecreationResourceDetail).not.toHaveBeenCalled();
  });

  it('should fetch and transform recreation resource data', async () => {
    const mockResponse = {
      id: '123',
      name: 'Test Resource',
      images: [{ url: 'test.jpg' }],
    };

    mockApi.getRecreationResourceById.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceById({
          id: '123',
          imageSizeCodes: ['llc'],
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockApi.getRecreationResourceById).toHaveBeenCalledWith({
      id: '123',
      imageSizeCodes: ['llc'],
    });
    expect(transformRecreationResourceDetail).toHaveBeenCalledWith(
      mockResponse,
    );
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockApi.getRecreationResourceById.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceById({
          id: '123',
          imageSizeCodes: ['llc'],
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
    expect(transformRecreationResourceDetail).not.toHaveBeenCalled();
  });
});

describe('useSearchRecreationResourcesPaginated', () => {
  const mockApi = {
    searchRecreationResources: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
    (transformRecreationResourceBase as any).mockImplementation(
      (data: any) => data,
    );
  });

  it('should fetch first page of resources', async () => {
    const mockResponse = {
      data: [
        { id: '1', name: 'Resource 1' },
        { id: '2', name: 'Resource 2' },
      ],
      page: 1,
      limit: 10,
      total: 20,
      filters: [],
    };

    mockApi.searchRecreationResources.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 10 }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.data?.pages[0].data).toHaveLength(2);
    });

    expect(result.current.data?.totalCount).toBe(20);
    expect(result.current.data?.currentPage).toBe(1);
    expect(transformRecreationResourceBase).toHaveBeenCalledTimes(2);
  });

  it('should handle pagination correctly', async () => {
    const mockFirstPage = {
      data: [{ id: '1' }],
      page: 1,
      limit: 10,
      total: 20,
      filters: [],
    };

    const mockSecondPage = {
      data: [{ id: '2' }],
      page: 2,
      limit: 10,
      total: 20,
      filters: [],
    };

    mockApi.searchRecreationResources
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 10 }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.data?.pages[0]).toBeDefined();
    });

    // Fetch next page
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });

    expect(transformRecreationResourceBase).toHaveBeenCalledTimes(2);
  });

  it('should handle API errors in pagination', async () => {
    const error = new Error('API Error');
    mockApi.searchRecreationResources.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 10 }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(transformRecreationResourceBase).not.toHaveBeenCalled();
  });
});
