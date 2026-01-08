import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useRecreationResourceApi } from '@/service/hooks/useRecreationResourceApi';
import {
  useGetRecreationResourceById,
  useGetSiteOperatorById,
  useSearchRecreationResourcesPaginated,
  useAlphabeticalResources,
  useRecreationResourcesWithGeometryMutation,
} from '@/service/queries/recreation-resource/recreationResourceQueries';
import { TestQueryClientProvider } from '@/test-utils';

// Mock the API hook
vi.mock('@/service/hooks/useRecreationResourceApi');

describe('useGetRecreationResourceById', () => {
  const mockApi = {
    getRecreationResourceById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
  });

  it('should return undefined when no id is provided', async () => {
    const { result } = renderHook(
      () => useGetRecreationResourceById({ imageSizeCodes: ['llc'] }),
      { wrapper: TestQueryClientProvider },
    );

    expect(result.current.data).toBeUndefined();
    expect(mockApi.getRecreationResourceById).not.toHaveBeenCalled();
  });

  it('should fetch and transform recreation resource data', async () => {
    const mockResponse = {
      id: '123',
      name: 'Test Resource',
      images: [{ url: 'test.jpg' }],
    };

    mockApi.getRecreationResourceById.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceById({
          id: '123',
          imageSizeCodes: ['llc'],
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockApi.getRecreationResourceById).toHaveBeenCalledWith({
      id: '123',
      imageSizeCodes: ['llc'],
    });
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockApi.getRecreationResourceById.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () =>
        useGetRecreationResourceById({
          id: '123',
          imageSizeCodes: ['llc'],
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});

describe('useGetSiteOperatorById', () => {
  const mockApi = {
    getSiteOperatorById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
  });

  it('should return undefined when no id is provided', async () => {
    const { result } = renderHook(() => useGetSiteOperatorById({}), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.data).toBeUndefined();
    expect(mockApi.getSiteOperatorById).not.toHaveBeenCalled();
  });

  it('should fetch site operator data', async () => {
    const mockResponse = {
      acronym: undefined,
      clientName: 'SITE OPERATOR NAME',
      clientNumber: '0001',
      clientStatusCode: 'ACT',
      clientTypeCode: 'C',
      legalFirstName: undefined,
      legalMiddleName: undefined,
    };

    mockApi.getSiteOperatorById.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () =>
        useGetSiteOperatorById({
          id: '123',
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(mockApi.getSiteOperatorById).toHaveBeenCalledWith({
      id: '123',
    });
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockApi.getSiteOperatorById.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () =>
        useGetSiteOperatorById({
          id: '123',
        }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
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

  it('should fetch first page of resources', async () => {
    const mockResponse = {
      data: [
        { id: '1', name: 'Resource 1' },
        { id: '2', name: 'Resource 2' },
      ],
      page: 1,
      limit: 10,
      total: 20,
      filters: [],
    };

    mockApi.searchRecreationResources.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 10 }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.data?.pages[0].data).toHaveLength(2);
    });

    expect(result.current.data?.totalCount).toBe(20);
    expect(result.current.data?.currentPage).toBe(1);
  });

  it('should handle pagination correctly', async () => {
    const mockFirstPage = {
      data: [{ id: '1' }],
      page: 1,
      limit: 10,
      total: 20,
      filters: [],
    };

    const mockSecondPage = {
      data: [{ id: '2' }],
      page: 2,
      limit: 10,
      total: 20,
      filters: [],
    };

    mockApi.searchRecreationResources
      .mockResolvedValueOnce(mockFirstPage)
      .mockResolvedValueOnce(mockSecondPage);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 10 }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.data?.pages[0]).toBeDefined();
    });

    // Fetch next page
    result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages).toHaveLength(2);
    });
  });

  it('should handle API errors in pagination', async () => {
    const error = new Error('API Error');
    mockApi.searchRecreationResources.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useSearchRecreationResourcesPaginated({ limit: 10 }),
      { wrapper: TestQueryClientProvider },
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});

describe('useAlphabeticalResources', () => {
  const mockApi = {
    getRecreationResourcesAlphabetically: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
  });

  it('should not fetch when no letter is provided', async () => {
    const { result } = renderHook(() => useAlphabeticalResources(''), {
      wrapper: TestQueryClientProvider,
    });

    expect(result.current.data).toBeUndefined();
    expect(mockApi.getRecreationResourcesAlphabetically).not.toHaveBeenCalled();
  });

  it('should fetch alphabetical resources for a letter', async () => {
    const mockResponse = [
      {
        rec_resource_id: 'REC123',
        name: 'Abbott Creek',
        recreation_resource_type: 'Recreation site',
        recreation_resource_type_code: 'SIT',
      },
      {
        rec_resource_id: 'REC456',
        name: 'Alpine Lake',
        recreation_resource_type: 'Recreation site',
        recreation_resource_type_code: 'SIT',
      },
    ];

    mockApi.getRecreationResourcesAlphabetically.mockResolvedValue(
      mockResponse,
    );

    const { result } = renderHook(() => useAlphabeticalResources('A'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.getRecreationResourcesAlphabetically).toHaveBeenCalledWith({
      letter: 'A',
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should fetch alphabetical resources for numerical (#)', async () => {
    const mockResponse = [
      {
        rec_resource_id: 'REC789',
        name: '0 K Snowmobile Parking Lot',
        recreation_resource_type: 'Recreation site',
        recreation_resource_type_code: 'SIT',
      },
    ];

    mockApi.getRecreationResourcesAlphabetically.mockResolvedValue(
      mockResponse,
    );

    const { result } = renderHook(() => useAlphabeticalResources('#'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApi.getRecreationResourcesAlphabetically).toHaveBeenCalledWith({
      letter: '#',
    });
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockApi.getRecreationResourcesAlphabetically.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useAlphabeticalResources('A'), {
      wrapper: TestQueryClientProvider,
    });

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});

describe('useRecreationResourcesWithGeometry', () => {
  const mockApi = {
    getResourcesWithGeometry: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecreationResourceApi as any).mockReturnValue(mockApi);
  });

  it('should fetch resources with geometry', async () => {
    const mockResponse = [
      {
        rec_resource_id: 'REC2328',
        name: 'Canyon Flats',
        closest_community: 'WESTBRIDGE',
        description:
          ' Three small, heavily used camping sites along the Kettle River.  Good swimming hole and sandy beach 300m downstreem from site.',
        driving_directions:
          ' Turn off Highway 33 onto Highway 43 (Christian Valley Road) at Westbridge.  Reset odometer and follow Highway 43 for 30 km to the recreation site on the right.',
        maintenance_standard_code: 'M',
        rec_resource_type: 'Recreation site',
        recreation_access: ['Road'],
        recreation_activity: [
          {
            description: 'Angling',
            recreation_activity_code: 1,
          },
          {
            description: 'Swimming & bathing',
            recreation_activity_code: 7,
          },
          {
            description: 'Camping',
            recreation_activity_code: 32,
          },
        ],
        recreation_status: {
          description: 'Open',
          comment:
            'On May 14, 2020 day-use activities are permitted at recreation sites. Camping will be permitted on June 1, 2020 subject to Covid-19 health and safety concerns.',
          status_code: 1,
        },
        campsite_count: 3,
        recreation_resource_images: [],
        recreation_fee: [],
        recreation_structure: {
          has_toilet: false,
          has_table: false,
        },
        additional_fees: [],
        recreation_resource_docs: [],
        spatial_feature_geometry: [
          '{"type":"Polygon","coordinates":[[[1517288.676,514063.775],[1517290.771,514064.696],[1517291.757,514070.005],[1517292.473,514080.242],[1517292.462,514080.672],[1517295.79,514088.305],[1517299.596,514097.55],[1517299.751,514107.621],[1517311.772,514118.944],[1517314.429,514137.421],[1517323.126,514149.582],[1517327.655,514161.099],[1517331.87,514167.78],[1517347.957,514184.823],[1517348.694,514187.134],[1517349.353,514187.275],[1517357.782,514196.791],[1517364.035,514204.948],[1517374.095,514219.087],[1517387.146,514234.041],[1517391.225,514248.451],[1517391.769,514263.134],[1517397.206,514276.456],[1517398.369,514289.003],[1517401.389,514312.542],[1517401.462,514320.481],[1517401.912,514339.851],[1517401.589,514358.92],[1517398.779,514381.646],[1517397.148,514385.503],[1517382.466,514397.869],[1517377.465,514406.187],[1517368.161,514423.119],[1517361.052,514431.336],[1517347.081,514446.79],[1517339.621,514457.765],[1517317.943,514477.243],[1517306.168,514491.914],[1517297.595,514495.85],[1517277.124,514506.29],[1517274.582,514509.049],[1517256.911,514530.05],[1517251.261,514535.398],[1517232.859,514544.149],[1517224.923,514551.166],[1517209.152,514556.273],[1517201.519,514560.305],[1517186.447,514576.542],[1517179.958,514580.8],[1517175.953,514587.209],[1517173.791,514597.044],[1517165.387,514615.184],[1517152.903,514626.768],[1517144.684,514643.809],[1517131.318,514661.224],[1517122.887,514680.366],[1517111.879,514696.121],[1517105.226,514716.448],[1517093.581,514737.053],[1517086.235,514757.725],[1517084.504,514757.293],[1517027.957,514751.421],[1517099.11,514044.698],[1517288.676,514063.775]]]}',
        ],
        site_point_geometry:
          '{"type":"Point","coordinates":[1517313.7088,514447.53]}',
        recreation_district: {
          description: 'Boundary-South Okanagan',
          district_code: 'RDBO',
        },
        recreation_resource_reservation_info: null,
      },
    ];

    mockApi.getResourcesWithGeometry.mockResolvedValue(mockResponse);

    const { result } = renderHook(
      () => useRecreationResourcesWithGeometryMutation(),
      { wrapper: TestQueryClientProvider },
    );

    // Act: trigger the mutation
    await act(async () => {
      await result.current.mutateAsync({ ids: ['REC2328'] });
    });

    await waitFor(() => {
      // Assert
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.length).toBe(1);
    });
  });

  it('should handle API errors', async () => {
    const error = new Error('API Error');
    mockApi.getResourcesWithGeometry.mockRejectedValueOnce(error);

    const { result } = renderHook(
      () => useRecreationResourcesWithGeometryMutation(),
      { wrapper: TestQueryClientProvider },
    );

    // Act
    await act(async () => {
      try {
        await result.current.mutateAsync({ ids: ['REC2328'] });
      } catch {
        // mutateAsync throws, so swallow it to let state update
      }
    });

    await waitFor(() => {
      // Assert
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toEqual(error);
    });
  });
});
