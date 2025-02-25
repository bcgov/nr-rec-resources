import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRecreationResourceApi } from '@/service/hooks/useRecreationResourceApi';
import {
  useGetRecreationResourceById,
  useSearchRecreationResourcesPaginated,
} from '@/service/queries/recreation-resource/recreationResourceQueries';
import { ReactNode } from 'react';

vi.mock('@/service/hooks/useRecreationResourceApi', () => ({
  useRecreationResourceApi: vi.fn(),
}));

// Create wrapper with QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useGetRecreationResourceById', () => {
  const mockApi = {
    getRecreationResourceById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
  });

  it('should throw error when id is not provided', async () => {
    renderHook(
      () => useGetRecreationResourceById({ imageSizeCodes: ['llc'] }),
      { wrapper: createWrapper() },
    );

    expect(mockApi.getRecreationResourceById).not.toHaveBeenCalled();
  });

  it('should fetch and transform recreation resource', async () => {
    const mockResource = {
      id: '123',
      name: 'Test Resource',
      recreation_resource_images: [],
    };
    mockApi.getRecreationResourceById.mockResolvedValue(mockResource);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceById({ id: '123', imageSizeCodes: ['llc'] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toBeDefined();
    });
  });

  it('should retry on 5xx errors', async () => {
    const serverError = new Error('Server Error');
    (serverError as any).response = { status: 503 };

    mockApi.getRecreationResourceById
      .mockRejectedValueOnce(serverError)
      .mockResolvedValueOnce({
        id: '123',
        name: 'Test Resource',
        recreation_resource_images: [],
      });

    const { result } = renderHook(
      () =>
        useGetRecreationResourceById({ id: '123', imageSizeCodes: ['llc'] }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(
      () => {
        expect(result.current.isSuccess).toBe(true);
        expect(mockApi.getRecreationResourceById).toHaveBeenCalledTimes(2);
      },
      { timeout: 2000 },
    );
  });

  it('should not retry on 4xx errors', async () => {
    const clientError = new Error('Not Found');
    (clientError as any).response = { status: 404 };

    mockApi.getRecreationResourceById.mockRejectedValue(clientError);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceById({ id: '123', imageSizeCodes: ['llc'] }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(mockApi.getRecreationResourceById).toHaveBeenCalledTimes(1);
    });
  });
});

describe('useSearchRecreationResourcesPaginated', () => {
  const mockApi = {
    searchRecreationResources: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
  });

  it('should handle initial page load', async () => {
    const mockResponse = {
      data: [{ id: '1', name: 'Resource 1', recreation_resource_images: [] }],
      total: 10,
      limit: 5,
      page: 1,
    };
    mockApi.searchRecreationResources.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 5 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.data?.pages[0].data).toHaveLength(1);
      expect(result.current.data?.totalCount).toBe(10);
      expect(result.current.data?.currentPage).toBe(1);
    });
  });

  it('should handle pagination', async () => {
    const mockFirstPage = {
      data: [{ id: '1', name: 'Resource 1', recreation_resource_images: [] }],
      limit: 5,
      page: 1,
    };
    const mockSecondPage = {
      data: [{ id: '2', name: 'Resource 2', recreation_resource_images: [] }],
      limit: 5,
      page: 2,
    };

    mockApi.searchRecreationResources
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 5 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.hasNextPage).toBe(true);
    });

    // Fetch next page
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
      expect(result.current.data?.totalCount).toBe(0);
      expect(result.current.data?.currentPage).toBe(2);
    });
  });

  it('should handle error cases', async () => {
    const error = new Error('API Error');
    mockApi.searchRecreationResources.mockRejectedValue(error);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 5 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
    });
  });

  describe('pagination parameters', () => {
    it('should return undefined for previous page when on first page', async () => {
      const mockResponse = {
        data: [],
        total: 10,
        limit: 5,
        page: 1,
      };
      mockApi.searchRecreationResources.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useSearchRecreationResourcesPaginated({ limit: 5 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.hasPreviousPage).toBe(false);
      });
    });

    it('should handle previous page navigation when not on first page', async () => {
      const mockResponse = {
        data: [],
        total: 10,
        limit: 5,
        page: 2,
      };
      mockApi.searchRecreationResources.mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () => useSearchRecreationResourcesPaginated({ page: 2, limit: 5 }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => {
        expect(result.current.hasPreviousPage).toBe(true);
      });
    });
  });
});
