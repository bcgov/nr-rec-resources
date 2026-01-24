import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateRecreationResourceReservationDto } from '@/services/recreation-resource-admin';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { RECREATION_RESOURCE_QUERY_KEYS } from './queryKeys';

export interface UpdateRecreationResourceReservationRequest {
  recResourceId: string;
  updateRecreationResourceReservationDto: UpdateRecreationResourceReservationDto;
}

/**
 * Simple hook to update geospatial data and invalidate related queries on success.
 */
export function useUpdateRecreationResourceReservation() {
  const api = useRecreationResourceAdminApiClient();
  const queryClient = useQueryClient();

  return useMutation<
    UpdateRecreationResourceReservationDto,
    Error,
    UpdateRecreationResourceReservationRequest
  >({
    mutationFn: async (request) => {
      const { recResourceId, updateRecreationResourceReservationDto } = request;
      const response = await api.updateRecreationResourceReservation({
        recResourceId,
        updateRecreationResourceReservationDto,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      const recResourceId = variables.recResourceId;
      queryClient.setQueryData(
        RECREATION_RESOURCE_QUERY_KEYS.reservation(recResourceId),
        () => data,
      );
    },
  });
}

export default useUpdateRecreationResourceReservation;
