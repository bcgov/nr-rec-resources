import { useResourceOptions } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useResourceOptions';
import {
  GetOptionsByTypeTypeEnum,
  RecreationResourceOptionUIModel,
} from '@/services';
import { useGetRecreationResourceOptions } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useGetRecreationResourceOptions',
);

const mockUseGetRecreationResourceOptions = vi.mocked(
  useGetRecreationResourceOptions,
);

// Helper to create mock return value with options in the correct order
const createMockOptions = (
  options: [
    any[]?, // access
    any[]?, // controlAccessCode
    any[]?, // maintenance
    any[]?, // recreationStatus
    any[]?, // riskRatingCode
    any[]?, // district
  ] = [],
) => ({
  data: [
    { options: options[0] ?? [] },
    { options: options[1] ?? [] },
    { options: options[2] ?? [] },
    { options: options[3] ?? [] },
    { options: options[4] ?? [] },
    { options: options[5] ?? [] },
  ],
  isLoading: false,
  error: null,
  refetch: vi.fn(),
});

const createMockReturn = (
  overrides: Partial<ReturnType<typeof createMockOptions>> = {},
) => ({
  ...createMockOptions(),
  ...overrides,
});

describe('useResourceOptions', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should return empty arrays when no data is available', () => {
    mockUseGetRecreationResourceOptions.mockReturnValue(
      createMockReturn({ data: undefined }) as any,
    );

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.districtOptions).toEqual([{ id: '', label: 'None' }]);
    expect(result.current.maintenanceOptions).toEqual([]);
    expect(result.current.accessOptions).toEqual([]);
    expect(result.current.recreationStatusOptions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.controlAccessCodeTypeOptions[0].label).toBe('None');
  });

  it('should return data when available', () => {
    const mockData = {
      access: [{ id: '4', label: 'Access 1' }],
      controlAccess: [{ id: '3', label: 'Control Access 1' }],
      maintenance: [{ id: '2', label: 'Maintenance 1' }],
      recreationStatus: [{ id: '5', label: 'Active' }],
      riskRating: [{ id: 'L', label: 'Low' }],
      district: [{ id: 'CHWK', label: 'Chilliwack', disabled: false }],
    };

    mockUseGetRecreationResourceOptions.mockReturnValue(
      createMockOptions([
        mockData.access,
        mockData.controlAccess,
        mockData.maintenance,
        mockData.recreationStatus,
        mockData.riskRating,
        mockData.district,
      ]) as any,
    );

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.districtOptions.slice(1)).toEqual(mockData.district);
    expect(result.current.maintenanceOptions).toEqual(mockData.maintenance);
    expect(result.current.controlAccessCodeTypeOptions.slice(1)).toEqual(
      mockData.controlAccess,
    );
    expect(result.current.accessOptions).toEqual(mockData.access);
    expect(result.current.recreationStatusOptions).toEqual(
      mockData.recreationStatus,
    );
    expect(result.current.riskRatingCodeTypeOptions.slice(1)).toEqual(
      mockData.riskRating,
    );
    expect(result.current.isLoading).toBe(false);
  });

  it('should call useGetRecreationResourceOptions with correct parameters', () => {
    mockUseGetRecreationResourceOptions.mockReturnValue(
      createMockReturn() as any,
    );
    renderHook(() => useResourceOptions(), { wrapper });

    expect(mockUseGetRecreationResourceOptions).toHaveBeenCalledTimes(1);
    expect(mockUseGetRecreationResourceOptions.mock.calls[0][0]).toEqual([
      GetOptionsByTypeTypeEnum.Access,
      GetOptionsByTypeTypeEnum.ControlAccessCode,
      GetOptionsByTypeTypeEnum.Maintenance,
      GetOptionsByTypeTypeEnum.RecreationStatus,
      GetOptionsByTypeTypeEnum.RiskRatingCode,
      GetOptionsByTypeTypeEnum.District,
    ]);
  });

  it.each([
    { isLoading: true, expected: true },
    { isLoading: false, expected: false },
  ])('should handle loading state: $isLoading', ({ isLoading, expected }) => {
    mockUseGetRecreationResourceOptions.mockReturnValue(
      createMockReturn({ isLoading }) as any,
    );

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.isLoading).toBe(expected);
  });

  it('should include recreation status options in the returned data', () => {
    const mockRecreationStatusData = [
      { id: '1', label: 'Active' },
      { id: '2', label: 'Inactive' },
    ];

    mockUseGetRecreationResourceOptions.mockReturnValue(
      createMockOptions([[], [], [], mockRecreationStatusData, [], []]) as any,
    );

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

    expect(result.current.recreationStatusOptions).toEqual(
      mockRecreationStatusData,
    );
  });

  it('should handle access options with null/undefined values', () => {
    const mockAccessData = [
      {
        id: 'access1',
        label: 'Access Group 1',
        children: [
          { id: 'child1', label: 'Child 1' },
          { id: null, label: 'Child 2' },
          { id: 'child3', label: null },
          { id: undefined, label: undefined },
        ],
      },
      {
        id: null,
        label: null,
        children: [{ id: 'child4', label: 'Child 4' }],
      },
    ];

    mockUseGetRecreationResourceOptions.mockReturnValue(
      createMockOptions([mockAccessData]) as any,
    );

    const { result } = renderHook(() => useResourceOptions(), { wrapper });

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
            value: '',
            group: 'access1',
            groupLabel: 'Access Group 1',
          },
          {
            label: '',
            value: 'child3',
            group: 'access1',
            groupLabel: 'Access Group 1',
          },
          {
            label: '',
            value: '',
            group: 'access1',
            groupLabel: 'Access Group 1',
          },
        ],
      },
      {
        label: null,
        options: [
          { label: 'Child 4', value: 'child4', group: '', groupLabel: '' },
        ],
      },
    ]);
  });

  describe('archived district options filtering', () => {
    const baseDistrictData = [
      { id: 'CHWK', label: 'Chilliwack', is_archived: false },
      { id: 'NEW', label: 'New District', is_archived: false },
    ];

    const setupMock = (districtData: typeof baseDistrictData) => {
      mockUseGetRecreationResourceOptions.mockReturnValue(
        createMockOptions([[], [], [], [], [], districtData]) as any,
      );
    };

    const getDisabledOption = (option: RecreationResourceOptionUIModel) =>
      option.disabled;

    it('should filter out archived options when no current value is provided', () => {
      setupMock([
        ...baseDistrictData,
        { id: 'OLD', label: 'Old District', is_archived: true },
      ]);

      const { result } = renderHook(() => useResourceOptions(), { wrapper });
      const { districtOptions } = result.current;

      expect(districtOptions).toHaveLength(3); // None + 2 non-archived
      expect(districtOptions[0].label).toBe('None');
      expect(districtOptions.find((opt) => opt.id === 'CHWK')).toBeDefined();
      expect(districtOptions.find((opt) => opt.id === 'NEW')).toBeDefined();
      expect(districtOptions.find((opt) => opt.id === 'OLD')).toBeUndefined();
    });

    it('should show archived option with asterisk and disabled when it matches current value', () => {
      setupMock([
        ...baseDistrictData,
        { id: 'OLD', label: 'Old District', is_archived: true },
      ]);

      const { result } = renderHook(
        () => useResourceOptions({ currentDistrictCode: 'OLD' }),
        { wrapper },
      );

      const archivedOption = result.current.districtOptions.find(
        (opt) => opt.id === 'OLD',
      ) as RecreationResourceOptionUIModel;
      expect(archivedOption).toBeDefined();
      expect(archivedOption?.label).toBe('Old District (Archived**)');
      expect(getDisabledOption(archivedOption)).toBe(true);
    });

    it('should filter out archived options that do not match current value', () => {
      setupMock([
        ...baseDistrictData,
        { id: 'OLD1', label: 'Old District 1', is_archived: true },
        { id: 'OLD2', label: 'Old District 2', is_archived: true },
      ]);

      const { result } = renderHook(
        () => useResourceOptions({ currentDistrictCode: 'OLD1' }),
        { wrapper },
      );

      const { districtOptions } = result.current;
      expect(districtOptions).toHaveLength(4); // None + 2 non-archived + 1 archived
      const archivedOption = districtOptions.find(
        (opt) => opt.id === 'OLD1',
      ) as RecreationResourceOptionUIModel;
      expect(archivedOption?.label).toBe('Old District 1 (Archived**)');
      expect(getDisabledOption(archivedOption)).toBe(true);
      expect(districtOptions.find((opt) => opt.id === 'OLD2')).toBeUndefined();
    });

    it('should set disabled field correctly for archived and non-archived options', () => {
      setupMock([
        ...baseDistrictData,
        { id: 'OLD', label: 'Old District', is_archived: true },
      ]);

      const { result } = renderHook(
        () => useResourceOptions({ currentDistrictCode: 'OLD' }),
        { wrapper },
      );

      const { districtOptions } = result.current;
      const archivedOption = districtOptions.find(
        (opt) => opt.id === 'OLD',
      ) as RecreationResourceOptionUIModel;
      const nonArchivedOption = districtOptions.find(
        (opt) => opt.id === 'CHWK',
      ) as RecreationResourceOptionUIModel;

      expect(archivedOption).toBeDefined();
      expect(nonArchivedOption).toBeDefined();
      expect(getDisabledOption(archivedOption)).toBe(true);
      expect(getDisabledOption(nonArchivedOption)).toBe(false);
    });
  });
});
