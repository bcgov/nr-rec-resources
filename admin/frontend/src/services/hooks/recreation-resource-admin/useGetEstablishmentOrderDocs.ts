import { EstablishmentOrderDocDto } from '@/services';
import { useQuery } from '@tanstack/react-query';
import { useRecreationResourceAdminApiClient } from './useRecreationResourceAdminApiClient';

export function useGetEstablishmentOrderDocs(rec_resource_id?: string) {
  const api = useRecreationResourceAdminApiClient();

  return useQuery<EstablishmentOrderDocDto[]>({
    queryKey: ['establishment-order-docs', rec_resource_id],
    queryFn: async () => {
      if (!rec_resource_id) {
        throw new Error('rec_resource_id is required');
      }
      const response = await api.getAllEstablishmentOrderDocs({
        recResourceId: rec_resource_id,
      });
      return response;
    },
    enabled: !!rec_resource_id,
  });
}
