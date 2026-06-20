import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceLoader } from './recResourceLoader';

export async function recResourceAdvisoriesLoader(args: any) {
  const parentData = await recResourceLoader(args);
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const [advisories] = await Promise.all([
    args.context.queryClient.ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.advisories(args.params.id),
      queryFn: async () => {
        try {
          return await api.getRecreationResourceAdvisories({
            recResourceId: args.params.id,
          });
        } catch (err) {
          if (err) return [];
        }
      },
    }),
  ]);

  return {
    ...parentData,
    advisories,
  };
}
