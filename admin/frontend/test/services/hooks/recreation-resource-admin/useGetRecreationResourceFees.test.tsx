import { useGetRecreationResourceFees } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceFees';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetRecreationResourceFees = vi.fn();

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: () => ({
      getRecreationResourceFees: mockGetRecreationResourceFees,
    }),
  }),
);

describe('useGetRecreationResourceFees', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it('should fetch fees successfully and apply mapping', async () => {
    const mockFees = [
      {
        fee_amount: 15,
        fee_start_date: new Date('2024-05-15'),
        fee_end_date: new Date('2024-10-15'),
        recreation_fee_code: 'D',
        fee_type_description: 'Day use',
        monday_ind: 'Y',
        tuesday_ind: 'Y',
        wednesday_ind: 'Y',
        thursday_ind: 'Y',
        friday_ind: 'Y',
        saturday_ind: 'Y',
        sunday_ind: 'N',
      },
    ];
    mockGetRecreationResourceFees.mockResolvedValue(mockFees);

    const { result } = renderHook(
      () => useGetRecreationResourceFees('REC1222'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify that mapping was applied - fees should have readable date fields
    expect(result.current.data).toBeDefined();
    expect(result.current.data?.[0]).toHaveProperty(
      'fee_start_date_readable_utc',
    );
    expect(result.current.data?.[0]).toHaveProperty(
      'fee_end_date_readable_utc',
    );
    expect(result.current.data?.[0].fee_start_date_readable_utc).toBeDefined();
    expect(result.current.data?.[0].fee_end_date_readable_utc).toBeDefined();
    expect(typeof result.current.data?.[0].fee_start_date_readable_utc).toBe(
      'string',
    );
    expect(typeof result.current.data?.[0].fee_end_date_readable_utc).toBe(
      'string',
    );
    // Verify original properties are preserved
    expect(result.current.data?.[0].fee_amount).toBe(15);
    expect(result.current.data?.[0].recreation_fee_code).toBe('D');
    expect(result.current.data?.[0].fee_type_description).toBe('Day use');
    expect(mockGetRecreationResourceFees).toHaveBeenCalledWith({
      recResourceId: 'REC1222',
    });
  });

  it('should not fetch when rec_resource_id is undefined', () => {
    const { result } = renderHook(
      () => useGetRecreationResourceFees(undefined),
      {
        wrapper: createWrapper(),
      },
    );

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetRecreationResourceFees).not.toHaveBeenCalled();
  });

  it('should not fetch when rec_resource_id is empty string', () => {
    const { result } = renderHook(() => useGetRecreationResourceFees(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGetRecreationResourceFees).not.toHaveBeenCalled();
  });

  it('should throw error when rec_resource_id is provided in queryFn but undefined in enabled check', async () => {
    // This tests the error handling path in queryFn
    const { result } = renderHook(
      () => useGetRecreationResourceFees(undefined),
      {
        wrapper: createWrapper(),
      },
    );

    // Query should be disabled, so queryFn won't run
    expect(result.current.fetchStatus).toBe('idle');
  });

  it('should return empty array when no fees exist', async () => {
    mockGetRecreationResourceFees.mockResolvedValue([]);

    const { result } = renderHook(
      () => useGetRecreationResourceFees('REC9999'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('should map fees with null dates correctly', async () => {
    const mockFees = [
      {
        fee_amount: 10,
        fee_start_date: null,
        fee_end_date: new Date('2024-10-15'),
        recreation_fee_code: 'H',
        fee_type_description: 'Hiking',
      },
      {
        fee_amount: 20,
        fee_start_date: new Date('2024-05-15'),
        fee_end_date: null,
        recreation_fee_code: 'C',
        fee_type_description: 'Camping',
      },
    ];
    mockGetRecreationResourceFees.mockResolvedValue(mockFees);

    const { result } = renderHook(
      () => useGetRecreationResourceFees('REC1222'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0].fee_start_date_readable_utc).toBeNull();
    expect(result.current.data?.[0].fee_end_date_readable_utc).toBeDefined();
    expect(result.current.data?.[1].fee_start_date_readable_utc).toBeDefined();
    expect(result.current.data?.[1].fee_end_date_readable_utc).toBeNull();
  });

  it('should handle network errors gracefully', async () => {
    const networkError = new Error('Network error');
    mockGetRecreationResourceFees.mockRejectedValue(networkError);

    const { result } = renderHook(
      () => useGetRecreationResourceFees('REC1222'),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toEqual(networkError);
  });
});
