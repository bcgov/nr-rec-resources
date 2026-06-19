import { useAdaptiveActivitiesOptions } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useAdaptiveActivitiesOptions';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
);

describe('useAdaptiveActivitiesOptions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('calls useGetRecreationResourceOptions with AccessibleActivities type', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useAdaptiveActivitiesOptions(), { wrapper: Wrapper });

    expect(useGetRecreationResourceOptions).toHaveBeenCalledWith([
      GetOptionsByTypesTypesEnum.AccessibleActivities,
    ]);
  });

  it('returns empty options when data is undefined', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAdaptiveActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty options when data is an empty array', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAdaptiveActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('returns options from the first item in data', () => {
    const mockOptions = [
      { id: 34, label: 'Adaptive Mountain Biking' },
      { id: 35, label: 'Adaptive Hiking' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.AccessibleActivities,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAdaptiveActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual(mockOptions);
  });

  it('returns empty options when options field is undefined in first item', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.AccessibleActivities,
          options: undefined,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useAdaptiveActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('reflects isLoading: true from the underlying hook', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useAdaptiveActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.options).toEqual([]);
  });

  it('memoizes options reference across re-renders when data does not change', () => {
    const mockOptions = [{ id: 34, label: 'Adaptive Hiking' }];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.AccessibleActivities,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result, rerender } = renderHook(
      () => useAdaptiveActivitiesOptions(),
      { wrapper: Wrapper },
    );

    const first = result.current.options;
    rerender();

    expect(result.current.options).toBe(first);
  });
});
