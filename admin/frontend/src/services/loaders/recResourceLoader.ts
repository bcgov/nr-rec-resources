import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { mapRecreationResourceDetail } from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';

export async function recResourceLoader({ context, params }: any) {
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const recResource = await context.queryClient.ensureQueryData({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(params.id),
    queryFn: async () => {
      const data = await api.getRecreationResourceById({
        recResourceId: params.id,
      });
      return mapRecreationResourceDetail(data);
    },
  });

  return { recResource };
}
