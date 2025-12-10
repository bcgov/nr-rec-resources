import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RecreationResourceDetailDto,
  RecreationResourceGeospatialDto,
  UpdateRecreationResourceGeospatialDto,
} from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';
import { RECREATION_RESOURCE_GEOSPATIAL_QUERY_KEY } from '@/services/loaders/recResourceGeospatialLoader';

export interface UpdateRecreationResourceGeospatialRequest {
  recResourceId: string;
  updateRecreationResourceGeospatialDto: UpdateRecreationResourceGeospatialDto;
}

/**
 * Simple hook to update geospatial data and invalidate related queries on success.
 */
export function useUpdateRecreationResourceGeospatial() {
  const api = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    RecreationResourceGeospatialDto,
    Error,
    UpdateRecreationResourceGeospatialRequest
  >({
    mutationFn: async ({
      recResourceId,
      updateRecreationResourceGeospatialDto,
    }) => {
      const response = await api.updateRecreationResourceGeospatial({
        recResourceId,
        updateRecreationResourceGeospatialDto,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      const recResourceId = variables.recResourceId;

      // Immediately update the geospatial cache with the authoritative returned data so components
      // that depend on this query get a new object reference and re-render (e.g., map features).
      queryClient.setQueryData(
        [RECREATION_RESOURCE_GEOSPATIAL_QUERY_KEY, recResourceId],
        () => data,
      );

      // Partially update the detail query cache by merging geometry fields from the mutation response.
      // This avoids a full refetch while keeping geometry data synchronized across queries.
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.detail(recResourceId),
        (oldData: RecreationResourceDetailDto | undefined) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            spatial_feature_geometry: data.spatial_feature_geometry,
            site_point_geometry: data.site_point_geometry,
          };
        },
      );
    },
  });
}

export default useUpdateRecreationResourceGeospatial;
