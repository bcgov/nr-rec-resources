import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';

export const RECREATION_RESOURCE_GEOSPATIAL_QUERY_KEY = 'geospatial';

export async function recResourceGeospatialLoader({ context, params }: any) {
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const [geospatialData, recResource] = await Promise.all([
    context.queryClient.ensureQueryData({
      queryKey: [RECREATION_RESOURCE_GEOSPATIAL_QUERY_KEY, params.id],
      queryFn: async () => {
        return await api.getRecreationResourceGeospatial({
          recResourceId: params.id,
        });
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

  return { geospatialData, recResource };
}
