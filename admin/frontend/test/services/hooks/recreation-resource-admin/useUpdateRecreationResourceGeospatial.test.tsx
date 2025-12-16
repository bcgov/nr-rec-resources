import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import useUpdateRecreationResourceGeospatial from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceGeospatial';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
);

const mockUseRecreationResourceAdminApiClient = vi.mocked(
  useRecreationResourceAdminApiClient,
);

describe('useUpdateRecreationResourceGeospatial', () => {
  let queryClient: QueryClient;
  const mockApi = {
    updateRecreationResourceGeospatial: vi.fn(),
  };

  const mockUpdateRequest = {
    recResourceId: 'REC123',
    updateRecreationResourceGeospatialDto: { utm_zone: 10 },
  } as any;

  const mockApiResponse = {
    rec_resource_id: 'REC123',
    utm_zone: 10,
    utm_easting: 500000,
    utm_northing: 5480000,
    spatial_feature_geometry: [
      '{"type":"Polygon","coordinates":[[[1,2],[3,4]]]}',
    ],
    site_point_geometry: '{"type":"Point","coordinates":[500000,5480000]}',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
    mockUseRecreationResourceAdminApiClient.mockReturnValue(mockApi as any);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('calls api.updateRecreationResourceGeospatial and updates queries on success', async () => {
    mockApi.updateRecreationResourceGeospatial.mockResolvedValue(
      mockApiResponse,
    );

    const { result } = renderHook(
      () => useUpdateRecreationResourceGeospatial(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockApi.updateRecreationResourceGeospatial).toHaveBeenCalledWith(
      mockUpdateRequest,
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockApiResponse);
  });

  it('updates geospatial cache with mutation response', async () => {
    mockApi.updateRecreationResourceGeospatial.mockResolvedValue(
      mockApiResponse,
    );

    const { result } = renderHook(
      () => useUpdateRecreationResourceGeospatial(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const geospatialData = queryClient.getQueryData(
      RECREATION_RESOURCE_QUERY_KEYS.geospatial('REC123'),
    );

    expect(geospatialData).toEqual(mockApiResponse);
  });

  it('partially updates detail cache with geometry fields from mutation response', async () => {
    mockApi.updateRecreationResourceGeospatial.mockResolvedValue(
      mockApiResponse,
    );

    const existingDetailData = {
      rec_resource_id: 'REC123',
      name: 'Test Site',
      description: 'A test recreation site',
      closest_community: 'Test Town',
      spatial_feature_geometry: ['{"type":"Polygon","coordinates":[[[0,0]]]}'],
      site_point_geometry: '{"type":"Point","coordinates":[0,0]}',
      recreation_activity: [],
      recreation_status: { code: 'OPEN', description: 'Open' },
      rec_resource_type: 'SITE',
      driving_directions: 'Test directions',
      maintenance_standard: 'M',
      campsite_count: 10,
      access_codes: [],
      recreation_structure: {},
    };

    queryClient.setQueryData(
      RECREATION_RESOURCE_QUERY_KEYS.detail('REC123'),
      existingDetailData,
    );

    const { result } = renderHook(
      () => useUpdateRecreationResourceGeospatial(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const updatedDetailData = queryClient.getQueryData(
      RECREATION_RESOURCE_QUERY_KEYS.detail('REC123'),
    );

    expect(updatedDetailData).toEqual({
      ...existingDetailData,
      spatial_feature_geometry: mockApiResponse.spatial_feature_geometry,
      site_point_geometry: mockApiResponse.site_point_geometry,
    });
  });

  it('does not modify detail cache if it does not exist', async () => {
    mockApi.updateRecreationResourceGeospatial.mockResolvedValue(
      mockApiResponse,
    );

    const { result } = renderHook(
      () => useUpdateRecreationResourceGeospatial(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const detailData = queryClient.getQueryData(
      RECREATION_RESOURCE_QUERY_KEYS.detail('REC123'),
    );

    expect(detailData).toBeUndefined();
  });

  it('propagates api errors', async () => {
    const error = new Error('boom');
    mockApi.updateRecreationResourceGeospatial.mockRejectedValue(error);

    const { result } = renderHook(
      () => useUpdateRecreationResourceGeospatial(),
      {
        wrapper,
      },
    );

    await act(async () => {
      result.current.mutate(mockUpdateRequest);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(mockApi.updateRecreationResourceGeospatial).toHaveBeenCalledWith(
      mockUpdateRequest,
    );
    expect(result.current.error).toEqual(error);
  });
});
