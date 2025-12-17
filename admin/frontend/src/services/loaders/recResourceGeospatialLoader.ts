import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceLoader } from './recResourceLoader';

export async function recResourceGeospatialLoader(args: any) {
  const parentData = await recResourceLoader(args);

  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const geospatialData = await args.context.queryClient
    .ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.geospatial(args.params.id),
      queryFn: async () => {
        return await api.getRecreationResourceGeospatial({
          recResourceId: args.params.id,
        });
      },
    })
    .catch((error: any) => {
      // If geospatial data doesn't exist return null
      if (error?.status === 404 || error?.response?.status === 404) {
        return null;
      }
      throw error;
    });

  return {
    ...parentData,
    geospatialData,
  };
}
