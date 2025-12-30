import { useFeatureOptions } from '@/pages/rec-resource-page/components/RecResourceFeatureSection/EditSection/hooks/useFeatureOptions';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
);

describe('useFeatureOptions', () => {
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

  it('calls useGetRecreationResourceOptions with FeatureCode type', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    renderHook(() => useFeatureOptions(), { wrapper: Wrapper });

    expect(useGetRecreationResourceOptions).toHaveBeenCalledWith([
      GetOptionsByTypesTypesEnum.FeatureCode,
    ]);
  });

  it('returns empty options array when data is undefined', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty options array when featureOptions is undefined', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('returns options sorted alphabetically by ID', () => {
    const mockOptions = [
      { id: 'TRAIL', label: 'Trail' },
      { id: 'BOAT', label: 'Boat Launch' },
      { id: 'CAMP', label: 'Camping' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toHaveLength(3);
    expect(result.current.options[0].id).toBe('BOAT');
    expect(result.current.options[1].id).toBe('CAMP');
    expect(result.current.options[2].id).toBe('TRAIL');
  });

  it('formats labels as "ID - Label"', () => {
    const mockOptions = [
      { id: 'BOAT', label: 'Boat Launch' },
      { id: 'CAMP', label: 'Camping' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options[0].label).toBe('BOAT - Boat Launch');
    expect(result.current.options[1].label).toBe('CAMP - Camping');
  });

  it('returns loading state when isLoading is true', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.options).toEqual([]);
  });

  it('returns empty array when options is undefined in featureOptions', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: undefined,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('handles empty options array', () => {
    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: [],
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toEqual([]);
  });

  it('memoizes options when featureOptions does not change', () => {
    const mockOptions = [
      { id: 'BOAT', label: 'Boat Launch' },
      { id: 'CAMP', label: 'Camping' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result, rerender } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    const firstOptions = result.current.options;

    rerender();

    expect(result.current.options).toBe(firstOptions);
  });

  it('updates options when featureOptions changes', () => {
    const initialOptions = [{ id: 'BOAT', label: 'Boat Launch' }];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: initialOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result, rerender } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toHaveLength(1);
    expect(result.current.options[0].label).toBe('BOAT - Boat Launch');

    const newOptions = [
      { id: 'BOAT', label: 'Boat Launch' },
      { id: 'CAMP', label: 'Camping' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: newOptions,
        },
      ],
      isLoading: false,
    } as any);

    rerender();

    expect(result.current.options).toHaveLength(2);
    expect(result.current.options[1].label).toBe('CAMP - Camping');
  });

  it('preserves original option properties while adding formatted label', () => {
    const mockOptions = [
      { id: 'BOAT', label: 'Boat Launch', someOtherProp: 'value' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options[0]).toMatchObject({
      id: 'BOAT',
      label: 'BOAT - Boat Launch',
      someOtherProp: 'value',
    });
  });

  it('sorts and formats multiple options correctly', () => {
    const mockOptions = [
      { id: 'ZULU', label: 'Zulu Feature' },
      { id: 'ALPHA', label: 'Alpha Feature' },
      { id: 'MIKE', label: 'Mike Feature' },
    ];

    vi.mocked(useGetRecreationResourceOptions).mockReturnValue({
      data: [
        {
          type: GetOptionsByTypesTypesEnum.FeatureCode,
          options: mockOptions,
        },
      ],
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useFeatureOptions(), {
      wrapper: Wrapper,
    });

    expect(result.current.options).toHaveLength(3);
    expect(result.current.options[0].label).toBe('ALPHA - Alpha Feature');
    expect(result.current.options[1].label).toBe('MIKE - Mike Feature');
    expect(result.current.options[2].label).toBe('ZULU - Zulu Feature');
  });
});
