import { resolveAdminSearchRouteState } from '@/pages/search/utils/searchSchema';
import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { getAdminSearchQueryOptions } from '@/services/hooks/recreation-resource-admin/searchQueryOptions';

export async function adminSearchLoader({ context, deps }: any) {
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );
  const search = resolveAdminSearchRouteState(deps.search);

  const searchResults = await context.queryClient.ensureQueryData(
    getAdminSearchQueryOptions(api, search),
  );

  return { searchResults };
}
