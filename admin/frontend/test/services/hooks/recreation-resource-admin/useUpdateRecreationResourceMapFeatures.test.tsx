import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUpdateRecreationResourceMapFeatures } from '@/services/hooks/recreation-resource-admin/useUpdateRecreationResourceMapFeatures';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';

// Mock dependencies
vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

describe('useUpdateRecreationResourceMapFeatures', () => {
  let queryClient: QueryClient;
  let mockUpdateRecreationResourceGeospatial: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
      },
    });

    mockUpdateRecreationResourceGeospatial = vi.fn();
    vi.mocked(useRecreationResourceAdminApiClient).mockReturnValue({
      updateRecreationResourceGeospatial:
        mockUpdateRecreationResourceGeospatial,
    } as any);
  });

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  it('calls API with correctly mapped payload and executes success cache updates', async () => {
    const mockResponse = { id: 'REC123', features: [] };
    mockUpdateRecreationResourceGeospatial.mockResolvedValueOnce(mockResponse);

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(
      () => useUpdateRecreationResourceMapFeatures(),
      {
        wrapper: createWrapper(),
      },
    );

    const requestPayload = {
      recResourceId: 'REC123',
      newFeatures: [
        {
          geometry: { type: 'Polygon', coordinates: [] },
          sectionId: 'Sec-1',
          featureAreaHectares: 4.5,
        },
      ],
      amendedFeatures: [
        { geometry: { type: 'Polygon', coordinates: [] }, sectionId: 'Sec-2' },
      ],
      retiredFeatures: [
        { geometry: { type: 'Polygon', coordinates: [] }, sectionId: 'Sec-3' },
      ],
      recreationTypeCode: 'SIT',
      submittedBy: 'test.user@gov.bc.ca',
    };

    let mutationResult: any;
    await waitFor(async () => {
      mutationResult = await result.current.mutateAsync(requestPayload);
    });

    // Verify API payload mapping
    expect(mockUpdateRecreationResourceGeospatial).toHaveBeenCalledTimes(1);
    expect(mockUpdateRecreationResourceGeospatial).toHaveBeenCalledWith({
      recResourceId: 'REC123',
      updateRecreationResourceGeospatialDto: {
        newFeatures: [
          {
            geometry: requestPayload.newFeatures[0].geometry,
            section_id: 'Sec-1',
            feature_area_hectares: 4.5,
          },
        ],
        amendedFeatures: [
          {
            geometry: requestPayload.amendedFeatures[0].geometry,
            section_id: 'Sec-2',
          },
        ],
        retiredFeatures: [
          {
            geometry: requestPayload.retiredFeatures[0].geometry,
            section_id: 'Sec-3',
          },
        ],
        recreation_type_code: 'SIT',
        submitted_by: 'test.user@gov.bc.ca',
      },
    });

    // Verify response
    expect(mutationResult).toEqual(mockResponse);

    // Verify onSuccess QueryClient operations
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      RECREATION_RESOURCE_QUERY_KEYS.geospatial('REC123'),
      expect.any(Function),
    );

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail('REC123'),
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.nextRecResourceId(),
    });
  });

  it('propagates errors when the API call fails', async () => {
    const apiError = new Error('Network Error');
    mockUpdateRecreationResourceGeospatial.mockRejectedValueOnce(apiError);

    const { result } = renderHook(
      () => useUpdateRecreationResourceMapFeatures(),
      {
        wrapper: createWrapper(),
      },
    );

    const requestPayload = {
      recResourceId: 'REC123',
      newFeatures: [],
      amendedFeatures: [],
      retiredFeatures: [],
    };

    await expect(result.current.mutateAsync(requestPayload)).rejects.toThrow(
      'Network Error',
    );
  });
});
