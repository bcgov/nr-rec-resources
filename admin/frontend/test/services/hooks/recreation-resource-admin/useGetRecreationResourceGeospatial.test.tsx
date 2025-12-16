import * as HelpersModule from '@/services/hooks/recreation-resource-admin/helpers';
import { useGetRecreationResourceGeospatial } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceGeospatial';
import * as ApiClientModule from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { TestQueryClientProvider } from '@test/test-utils';
import { renderHook, waitFor } from '@testing-library/react';
import { Mock, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@/services/hooks/recreation-resource-admin/helpers', () => ({
  createRetryHandler: vi.fn(),
}));

describe('useGetRecreationResourceGeospatial', () => {
  const mockGetRecreationResourceGeospatial = vi.fn();
  const mockApi = {
    getRecreationResourceGeospatial: mockGetRecreationResourceGeospatial,
  };
  const useRecreationResourceAdminApiClient =
    ApiClientModule.useRecreationResourceAdminApiClient as Mock;
  const createRetryHandler = HelpersModule.createRetryHandler as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClient.mockReturnValue(mockApi);
    createRetryHandler.mockReturnValue(() => false);
  });

  it('should not run query if no recResourceId is provided', () => {
    const { result } = renderHook(
      () => useGetRecreationResourceGeospatial(undefined),
      { wrapper: TestQueryClientProvider },
    );
    expect(result.current.status).toBe('pending');
    expect(mockGetRecreationResourceGeospatial).not.toHaveBeenCalled();
  });

  it('should call api.getRecreationResourceGeospatial with correct recResourceId when enabled', async () => {
    mockGetRecreationResourceGeospatial.mockResolvedValueOnce({
      rec_resource_id: 'REC123',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
      latitude: 49.123456,
      longitude: -123.654321,
    });
    const { result } = renderHook(
      () => useGetRecreationResourceGeospatial('REC123'),
      {
        wrapper: TestQueryClientProvider,
      },
    );
    await waitFor(() =>
      expect(result.current.data).toEqual({
        rec_resource_id: 'REC123',
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5480000,
        latitude: 49.123456,
        longitude: -123.654321,
      }),
    );
    expect(mockGetRecreationResourceGeospatial).toHaveBeenCalledWith({
      recResourceId: 'REC123',
    });
  });

  it('should return geospatial data on success', async () => {
    const mockGeospatialData = {
      rec_resource_id: 'REC456',
      utm_zone: 10,
      utm_easting: 500000,
      utm_northing: 5480000,
    };

    mockGetRecreationResourceGeospatial.mockResolvedValueOnce(
      mockGeospatialData,
    );
    const { result } = renderHook(
      () => useGetRecreationResourceGeospatial('REC456'),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(mockGeospatialData);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  it('should handle 404 errors by returning null', async () => {
    const error404 = {
      status: 404,
      response: { status: 404 },
    };

    mockGetRecreationResourceGeospatial.mockRejectedValueOnce(error404);
    const { result } = renderHook(
      () => useGetRecreationResourceGeospatial('REC789'),
      {
        wrapper: TestQueryClientProvider,
      },
    );

    await waitFor(() => {
      expect(result.current.data).toBeNull();
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
