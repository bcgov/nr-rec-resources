import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RecreationResourceGeospatialDto,
  RecreationResourcesApi,
} from '@/services';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface UpdateRecreationResourceMapFeaturesRequest {
  recResourceId: string;
  newFeatures: Array<{
    geometry: Record<string, unknown>;
    sectionId?: string;
    featureAreaHectares?: number;
  }>;
  amendedFeatures: Array<{
    geometry: Record<string, unknown>;
    sectionId?: string;
    featureAreaHectares?: number;
  }>;
  retiredFeatures: Array<{
    geometry: Record<string, unknown>;
    sectionId?: string;
    featureAreaHectares?: number;
  }>;
  recreationTypeCode?: string;
  submittedBy?: string;
}

export function useUpdateRecreationResourceMapFeatures() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<
    RecreationResourceGeospatialDto,
    Error,
    UpdateRecreationResourceMapFeaturesRequest
  >({
    mutationFn: async ({
      recResourceId,
      newFeatures,
      amendedFeatures,
      retiredFeatures,
      recreationTypeCode,
      submittedBy,
    }) =>
      (() => {
        const requestParameters: any = {
          recResourceId,
          updateRecreationResourceGeospatialDto: {
            newFeatures: newFeatures.map((feature) => ({
              geometry: feature.geometry,
              section_id: feature.sectionId,
              ...(typeof feature.featureAreaHectares === 'number'
                ? { feature_area_hectares: feature.featureAreaHectares }
                : {}),
            })),
            amendedFeatures: amendedFeatures.map((feature) => ({
              geometry: feature.geometry,
              section_id: feature.sectionId,
              ...(typeof feature.featureAreaHectares === 'number'
                ? { feature_area_hectares: feature.featureAreaHectares }
                : {}),
            })),
            retiredFeatures: retiredFeatures.map((feature) => ({
              geometry: feature.geometry,
              section_id: feature.sectionId,
              ...(typeof feature.featureAreaHectares === 'number'
                ? { feature_area_hectares: feature.featureAreaHectares }
                : {}),
            })),
            recreation_type_code: recreationTypeCode,
            submitted_by: submittedBy,
          },
        };

        return api.updateRecreationResourceGeospatial(requestParameters);
      })(),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.geospatial(variables.recResourceId),
        () => data,
      );
      void queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(
          variables.recResourceId,
        ),
      });
      // We just claimed this ID, so drop the cached suggestion before the next create flow.
      void queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.nextRecResourceId(),
      });
    },
  });
}
