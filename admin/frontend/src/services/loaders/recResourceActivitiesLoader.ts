import { AuthService } from '@/services/auth';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { recResourceLoader } from './recResourceLoader';

export async function recResourceActivitiesLoader(args: any) {
  // Ensure parent loader data is available for breadcrumbs
  const parentData = await recResourceLoader(args);

  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const activities = await args.context.queryClient.ensureQueryData({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.activities(args.params.id),
    queryFn: async () => {
      const response = await api.getActivitiesByRecResourceId({
        recResourceId: args.params.id,
      });
      return response;
    },
  });

  return {
    ...parentData,
    activities,
  };
}
