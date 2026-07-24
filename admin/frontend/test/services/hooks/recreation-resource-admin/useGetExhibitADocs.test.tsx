import { useGetExhibitADocs } from '@/services/hooks/recreation-resource-admin/useGetExhibitADocs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetExhibitADocsByRecResourceId = vi.fn();
const mockAddErrorNotification = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: () => ({
      getExhibitADocsByRecResourceId: mockGetExhibitADocsByRecResourceId,
    }),
  }),
);

vi.mock('@/store/notificationStore', () => ({
  addErrorNotification: (...args: any[]) => mockAddErrorNotification(...args),
}));

describe('useGetExhibitADocs', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  it('returns initial empty array before data is loaded', () => {
    mockGetExhibitADocsByRecResourceId.mockResolvedValue([]);

    const { result } = renderHook(() => useGetExhibitADocs('REC123'), {
      wrapper: createWrapper(),
    });

    // initialData is [] so data should be available immediately
    expect(result.current.data).toEqual([]);
  });

  it('fetches exhibit A docs successfully', async () => {
    const mockDocs = [
      {
        document_id: 'doc-1',
        file_name: 'exhibit-a.pdf',
        url: 'https://s3.example.com/exhibit-a.pdf',
        extension: 'pdf',
        created_at: '2024-01-01',
      },
    ];
    mockGetExhibitADocsByRecResourceId.mockResolvedValue(mockDocs);

    const { result } = renderHook(() => useGetExhibitADocs('REC123'), {
      wrapper: createWrapper(),
    });

    // Wait for the API call to be made (initialData makes isSuccess true immediately,
    // so we wait for the actual fetch to complete by checking the data changes)
    await waitFor(() =>
      expect(mockGetExhibitADocsByRecResourceId).toHaveBeenCalled(),
    );
    await waitFor(() => expect(result.current.data).toEqual(mockDocs));
    expect(mockGetExhibitADocsByRecResourceId).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
  });

  it('does not fetch when recResourceId is undefined', () => {
    const { result } = renderHook(() => useGetExhibitADocs(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetExhibitADocsByRecResourceId).not.toHaveBeenCalled();
  });

  it('does not fetch when recResourceId is empty string', () => {
    const { result } = renderHook(() => useGetExhibitADocs(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetExhibitADocsByRecResourceId).not.toHaveBeenCalled();
  });

  it('handles fetch errors', async () => {
    const error = new Error('fetch failed');
    mockGetExhibitADocsByRecResourceId.mockRejectedValue(error);

    const { result } = renderHook(() => useGetExhibitADocs('REC123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(error);
  });

  it('returns empty array when no docs exist', async () => {
    mockGetExhibitADocsByRecResourceId.mockResolvedValue([]);

    const { result } = renderHook(() => useGetExhibitADocs('REC999'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('uses the correct query key', async () => {
    mockGetExhibitADocsByRecResourceId.mockResolvedValue([]);

    const { result } = renderHook(() => useGetExhibitADocs('REC456'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData([
      'recreation-resource-admin',
      'exhibit-a-docs',
      'REC456',
    ]);
    expect(cached).toEqual([]);
  });
});
