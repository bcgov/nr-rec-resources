import { AuthService } from '@/services/auth';
import { mapRecreationFee } from '@/services/hooks/recreation-resource-admin/helpers';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { recResourceLoader } from './recResourceLoader';

export async function recResourceFeesLoader(args: any) {
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

  const fees = await args.context.queryClient.ensureQueryData({
    queryKey: ['recreation-resource-fees', args.params.id],
    queryFn: async () => {
      const response = await api.getRecreationResourceFees({
        recResourceId: args.params.id,
      });
      return response.map(mapRecreationFee);
    },
  });

  return {
    ...parentData,
    fees,
  };
}
