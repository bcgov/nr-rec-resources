import { RecreationFeeUIModel } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';
import { mapRecreationFee } from './helpers';

export function useGetRecreationResourceFees(rec_resource_id?: string) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery<RecreationFeeUIModel[]>({
    queryKey: ['recreation-resource-fees', rec_resource_id],
    queryFn: async () => {
      if (!rec_resource_id) {
        throw new Error('rec_resource_id is required');
      }
      const response = await api.getRecreationResourceFees({
        recResourceId: rec_resource_id,
      });
      return response.map(mapRecreationFee);
    },
    enabled: !!rec_resource_id,
  });
}
