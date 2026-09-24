import { useCreateRecreationResourceMapFeatures } from '@/services/hooks/recreation-resource-admin/useCreateRecreationResourceMapFeatures';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { Mock, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient',
  () => ({
    useRecreationResourceAdminApiClient: vi.fn(),
  }),
);

vi.mock('@tanstack/react-query', () => ({
  useMutation: vi.fn(),
  useQueryClient: vi.fn(),
}));

describe('useCreateRecreationResourceMapFeatures', () => {
  const mockCreateRecreationResourceMapFeatures = vi.fn();
  const mockSetQueryData = vi.fn();
  const mockInvalidateQueries = vi.fn();
  const useRecreationResourceAdminApiClientMock =
    useRecreationResourceAdminApiClient as Mock;
  const useMutationMock = useMutation as Mock;
  const useQueryClientMock = useQueryClient as Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    useRecreationResourceAdminApiClientMock.mockReturnValue({
      createRecreationResourceMapFeatures:
        mockCreateRecreationResourceMapFeatures,
    });
    useQueryClientMock.mockReturnValue({
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries,
    });
    useMutationMock.mockImplementation((options: any) => ({
      options,
      mutateAsync: vi.fn(),
      isPending: false,
    }));
  });

  it('maps the request payload and invalidates the relevant cache keys on success', async () => {
    const { result } = renderHook(() =>
      useCreateRecreationResourceMapFeatures(),
    );
    const mutationOptions = result.current.options as {
      mutationFn: (variables: any) => Promise<any>;
      onSuccess: (data: any, variables: any) => void;
    };

    const request = {
      recResourceId: 'REC0001',
      recResourceName: 'Example Resource',
      features: [
        {
          geometry: { type: 'Point', coordinates: [1, 2] },
          sectionId: 'S1',
        },
        {
          geometry: {
            type: 'LineString',
            coordinates: [
              [3, 4],
              [5, 6],
            ],
          },
        },
      ],
      recreationTypeCode: 'TRAIL',
      naturalResourceDistrictCode: 'NRD',
      recreationDistrictCode: 'RD',
      submittedBy: 'user@example.com',
    };
    const createdDto = { rec_resource_id: 'REC0001' };
    mockCreateRecreationResourceMapFeatures.mockResolvedValueOnce(createdDto);

    await expect(mutationOptions.mutationFn(request)).resolves.toEqual(
      createdDto,
    );

    expect(mockCreateRecreationResourceMapFeatures).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      createRecreationMapFeaturesDto: {
        features: [
          {
            geometry: { type: 'Point', coordinates: [1, 2] },
            section_id: 'S1',
          },
          {
            geometry: {
              type: 'LineString',
              coordinates: [
                [3, 4],
                [5, 6],
              ],
            },
            section_id: undefined,
          },
        ],
        recreation_type_code: 'TRAIL',
        rec_resource_name: 'Example Resource',
        natural_resource_district_code: 'NRD',
        recreation_district_code: 'RD',
        submitted_by: 'user@example.com',
      },
    });

    mutationOptions.onSuccess(createdDto, request);

    expect(mockSetQueryData).toHaveBeenCalledWith(
      RECREATION_RESOURCE_QUERY_KEYS.geospatial('REC0001'),
      expect.any(Function),
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail('REC0001'),
    });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.nextRecResourceId(),
    });
  });
});
