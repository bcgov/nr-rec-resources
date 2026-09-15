import { AuthService } from '@/services/auth';
import {
  Configuration,
  PartnersApi,
} from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceLoader } from './recResourceLoader';

export async function recResourcePartnersLoader(args: any) {
  const parentData = await recResourceLoader(args);
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new PartnersApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const [partnersInfo] = await Promise.all([
    args.context.queryClient.ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.partners(args.params.id),
      queryFn: async () => {
        try {
          const response = await api.getPartnersByRecreationResourceId({
            recResourceId: args.params.id,
          });
          return response;
        } catch (err) {
          if (err) return null;
        }
      },
    }),
  ]);

  return {
    ...parentData,
    partnersInfo,
  };
}
