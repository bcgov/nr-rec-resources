import { useFeeOptions } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/hooks/useFeeOptions';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
);

describe('useFeeOptions', () => {
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

  it('calls useGetRecreationResourceOptions with FeeType enum', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useFeeOptions(), { wrapper: Wrapper });

    expect(useGetRecreationResourceOptions).toHaveBeenCalledWith([
      GetOptionsByTypesTypesEnum.FeeType,
    ]);
  });

  it('returns empty options array when data is undefined', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeeOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty options array when feeTypeOptions is undefined', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeeOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('returns options from feeTypeOptions', () => {
    const mockOptions = [
      { id: 'D', label: 'Day use' },
      { id: 'C', label: 'Camping' },
      { id: 'T', label: 'Trail use' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeeType,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeeOptions(), {
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

    const { result } = renderHook(() => useFeeOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.options).toEqual([]);
  });

  it('returns empty array when options is undefined in feeTypeOptions', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeeType,
          options: undefined,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeeOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('updates options when feeTypeOptions changes', () => {
    const initialOptions = [{ id: 'D', label: 'Day use' }];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeeType,
          options: initialOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result, rerender } = renderHook(() => useFeeOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual(initialOptions);

    const newOptions = [
      { id: 'D', label: 'Day use' },
      { id: 'C', label: 'Camping' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeeType,
          options: newOptions,
        },
      ],
      isLoading: false,
    } as any);

    rerender();

    expect(result.current.options).toEqual(newOptions);
  });
});
