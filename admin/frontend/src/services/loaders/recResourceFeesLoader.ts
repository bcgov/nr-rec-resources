import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { mapRecreationFee } from '@/services/hooks/recreation-resource-admin/helpers';

export async function recResourceFeesLoader({ context, params }: any) {
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const [fees, recResource] = await Promise.all([
    context.queryClient.ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.fees(params.id),
      queryFn: async () => {
        const response = await api.getRecreationResourceFees({
          recResourceId: params.id,
        });
        return response.map(mapRecreationFee);
      },
    }),
    context.queryClient.ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(params.id),
      queryFn: async () => {
        const data = await api.getRecreationResourceById({
          recResourceId: params.id,
        });
        return data;
      },
    }),
  ]);

  return { fees, recResource };
}
