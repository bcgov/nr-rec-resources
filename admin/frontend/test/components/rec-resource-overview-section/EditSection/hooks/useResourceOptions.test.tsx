import { useResourceOptions } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useResourceOptions';
import { GetOptionsByTypeTypeEnum } from '@/services';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the service hook
vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
);

const mockUseGetRecreationResourceOptions = vi.mocked(
  useGetRecreationResourceOptions,
);

describe('useResourceOptions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return empty arrays when no data is available', () => {
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.regionOptions).toEqual([]);
    expect(result.current.maintenanceOptions).toEqual([]);
    const firstOption = result.current.controlAccessCodeTypeOptions[0];
    expect(firstOption.label).toBe('None');
    expect([null, '']).toContain(firstOption.id);
    expect(result.current.accessOptions).toEqual([]);
    expect(result.current.recreationStatusOptions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return data when available', () => {
    const mockRegionData = [{ id: '1', label: 'Region 1' }];
    const mockMaintenanceData = [{ id: '2', label: 'Maintenance 1' }];
    const mockControlAccessData = [{ id: '3', label: 'Control Access 1' }];
    const mockAccessData = [{ id: '4', label: 'Access 1' }];
    const mockRecreationStatusData = [{ id: '5', label: 'Active' }];
    const mockRiskRatingData = [{ id: 'L', label: 'Low' }];

    // The hook expects a single call that returns an array in the order:
    // [access, controlAccessCode, maintenance, recreationStatus, regions]
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [
        { options: mockAccessData },
        { options: mockControlAccessData },
        { options: mockMaintenanceData },
        { options: mockRecreationStatusData },
        { options: mockRegionData },
        { options: mockRiskRatingData },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.regionOptions).toEqual(mockRegionData);
    expect(result.current.maintenanceOptions).toEqual(mockMaintenanceData);
    const first = result.current.controlAccessCodeTypeOptions[0];
    expect(first.label).toBe('None');
    expect([null, '']).toContain(first.id);
    // remaining options should match the mocked control access data
    expect(result.current.controlAccessCodeTypeOptions.slice(1)).toEqual(
      mockControlAccessData,
    );
    expect(result.current.accessOptions).toEqual(mockAccessData);
    expect(result.current.recreationStatusOptions).toEqual(
      mockRecreationStatusData,
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.riskRatingCodeTypeOptions.slice(1)).toEqual(
      mockRiskRatingData,
    );
  });

  it('should handle loading states correctly', () => {
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('should call useGetRecreationResourceOptions with correct parameters', () => {
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);
    renderHook(() => useResourceOptions(), { wrapper });

    // The hook calls the service hook once with an array of enum values
    expect(mockUseGetRecreationResourceOptions).toHaveBeenCalledTimes(1);
    const callArg = mockUseGetRecreationResourceOptions.mock.calls[0][0];
    expect(callArg).toEqual([
      GetOptionsByTypeTypeEnum.Access,
      GetOptionsByTypeTypeEnum.ControlAccessCode,
      GetOptionsByTypeTypeEnum.Maintenance,
      GetOptionsByTypeTypeEnum.RecreationStatus,
      GetOptionsByTypeTypeEnum.Regions,
      GetOptionsByTypeTypeEnum.RiskRatingCode,
    ]);
  });

  it('should aggregate loading states from all queries', () => {
    // The underlying hook returns an aggregated isLoading flag; emulate it
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle all queries completed successfully', () => {
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.isLoading).toBe(false);
  });

  it('should include recreation status options in the returned data', () => {
    const mockRecreationStatusData = [
      { id: '1', label: 'Active' },
      { id: '2', label: 'Inactive' },
    ];
    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [
        { options: [] },
        { options: [] },
        { options: [] },
        { options: mockRecreationStatusData },
        { options: [] },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.recreationStatusOptions).toEqual(
      mockRecreationStatusData,
    );
  });

  it('should handle access options with children that have null/undefined values', () => {
    const mockAccessDataWithNulls = [
      {
        id: 'access1',
        label: 'Access Group 1',
        children: [
          { id: 'child1', label: 'Child 1' },
          { id: null, label: 'Child 2' }, // null id
          { id: 'child3', label: null }, // null label
          { id: undefined, label: undefined }, // undefined values
        ],
      },
      {
        id: null, // null parent id
        label: null, // null parent label
        children: [{ id: 'child4', label: 'Child 4' }],
      },
    ];

    mockUseGetRecreationResourceOptions.mockReturnValue({
      data: [
        { options: mockAccessDataWithNulls },
        { options: [] },
        { options: [] },
        { options: [] },
        { options: [] },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    // Should handle nulls gracefully by converting to empty strings in groupedAccessOptions
    expect(result.current.groupedAccessOptions).toEqual([
      {
        label: 'Access Group 1',
        options: [
          {
            label: 'Child 1',
            value: 'child1',
            group: 'access1',
            groupLabel: 'Access Group 1',
          },
          {
            label: 'Child 2',
            value: '', // null id becomes empty string
            group: 'access1',
            groupLabel: 'Access Group 1',
          },
          {
            label: '', // null label becomes empty string
            value: 'child3',
            group: 'access1',
            groupLabel: 'Access Group 1',
          },
          {
            label: '', // undefined label becomes empty string
            value: '', // undefined id becomes empty string
            group: 'access1',
            groupLabel: 'Access Group 1',
          },
        ],
      },
      {
        label: null,
        options: [
          {
            label: 'Child 4',
            value: 'child4',
            group: '', // null parent id becomes empty string
            groupLabel: '', // null parent label becomes empty string
          },
        ],
      },
    ]);
  });
});
