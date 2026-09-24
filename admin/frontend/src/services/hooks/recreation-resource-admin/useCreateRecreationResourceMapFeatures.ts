import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RecreationResourceGeospatialDto,
  RecreationResourcesApi,
} from '@/services';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface CreateRecreationResourceMapFeaturesRequest {
  recResourceId: string;
  features: Array<{
    geometry: Record<string, unknown>;
    sectionId?: string;
  }>;
  recreationTypeCode?: string;
  naturalResourceDistrictCode?: string;
  recreationDistrictCode?: string;
  submittedBy?: string;
}

export function useCreateRecreationResourceMapFeatures() {
  const api = useRecreationResourceAdminApiClient() as RecreationResourcesApi;
  const queryClient = useQueryClient();

  return useMutation<
    RecreationResourceGeospatialDto,
    Error,
    CreateRecreationResourceMapFeaturesRequest
  >({
    mutationFn: async ({
      recResourceId,
      features,
      recreationTypeCode,
      naturalResourceDistrictCode,
      recreationDistrictCode,
      submittedBy,
    }) =>
      api.createRecreationResourceMapFeatures({
        recResourceId,
        createRecreationMapFeaturesDto: {
          features: features.map((feature) => ({
            geometry: feature.geometry,
            section_id: feature.sectionId,
          })),
          recreation_type_code: recreationTypeCode,
          natural_resource_district_code: naturalResourceDistrictCode,
          recreation_district_code: recreationDistrictCode,
          submitted_by: submittedBy,
        },
      }),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.geospatial(variables.recResourceId),
        () => data,
      );
      queryClient.invalidateQueries({
        queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(
          variables.recResourceId,
        ),
      });
    },
  });
}
