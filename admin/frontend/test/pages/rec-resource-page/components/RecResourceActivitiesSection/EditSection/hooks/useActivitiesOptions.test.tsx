import { useActivitiesOptions } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useActivitiesOptions';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
);

describe('useActivitiesOptions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('calls useGetRecreationResourceOptions with Activities type', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useActivitiesOptions(), { wrapper: Wrapper });

    expect(useGetRecreationResourceOptions).toHaveBeenCalledWith([
      GetOptionsByTypesTypesEnum.Activities,
    ]);
  });

  it('returns empty options array when data is undefined', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty options array when activitiesOptions is undefined', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('returns options from activitiesOptions', () => {
    const mockOptions = [
      { id: 1, label: 'Hiking' },
      { id: 2, label: 'Camping' },
      { id: 3, label: 'Fishing' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.Activities,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual(mockOptions);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns loading state when isLoading is true', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.options).toEqual([]);
  });

  it('returns empty array when options is undefined in activitiesOptions', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.Activities,
          options: undefined,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('handles empty options array', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.Activities,
          options: [],
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('memoizes options when activitiesOptions does not change', () => {
    const mockOptions = [
      { id: 1, label: 'Hiking' },
      { id: 2, label: 'Camping' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.Activities,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result, rerender } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    const firstOptions = result.current.options;

    rerender();

    expect(result.current.options).toBe(firstOptions);
  });

  it('updates options when activitiesOptions changes', () => {
    const initialOptions = [{ id: 1, label: 'Hiking' }];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.Activities,
          options: initialOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result, rerender } = renderHook(() => useActivitiesOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual(initialOptions);

    const newOptions = [
      { id: 1, label: 'Hiking' },
      { id: 2, label: 'Camping' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.Activities,
          options: newOptions,
        },
      ],
      isLoading: false,
    } as any);

    rerender();

    expect(result.current.options).toEqual(newOptions);
  });
});
