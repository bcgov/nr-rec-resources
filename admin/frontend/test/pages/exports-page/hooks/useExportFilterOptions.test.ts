import { useExportFilterOptions } from '@/pages/exports-page/hooks/useExportFilterOptions';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import * as ServicesModule from '@/services';
import { renderHook } from '@testing-library/react';
import { Mock, vi } from 'vitest';

vi.mock('@/services', async () => {
  const actual = await vi.importActual<object>('@/services');

  return {
    ...actual,
    useGetRecreationResourceOptions: vi.fn(),
  };
});

describe('useExportFilterOptions', () => {
  const useGetRecreationResourceOptions =
    ServicesModule.useGetRecreationResourceOptions as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps district and resource type options', () => {
    useGetRecreationResourceOptions.mockReturnValue({
      data: [
        { options: [{ id: 'RDKA', label: 'Kootenay Boundary' }] },
        { options: [{ id: 'SIT', label: 'Recreation site' }] },
      ],
      isLoading: true,
    });

    const { result } = renderHook(() => useExportFilterOptions());

    expect(useGetRecreationResourceOptions).toHaveBeenCalledWith([
      GetOptionsByTypesTypesEnum.District,
      GetOptionsByTypesTypesEnum.ResourceType,
    ]);
    expect(result.current).toEqual({
      districtOptions: [{ id: 'RDKA', label: 'Kootenay Boundary' }],
      resourceTypeOptions: [{ id: 'SIT', label: 'Recreation site' }],
      isLoading: true,
    });
  });

  it('falls back to empty arrays when options are unavailable', () => {
    useGetRecreationResourceOptions.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => useExportFilterOptions());

    expect(result.current).toEqual({
      districtOptions: [],
      resourceTypeOptions: [],
      isLoading: false,
    });
  });
});
