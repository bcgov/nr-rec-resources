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
      // No initialData here on purpose: it would seed the cache with a value,
      // and ensureQueryData skips the fetch whenever the cache already holds one
      queryFn: async () => {
        try {
          return await api.getPartnersByRecreationResourceId({
            recResourceId: args.params.id,
          });
        } catch (err: any) {
          // Fall back to an empty list rather than null: a null would survive
          // the `= []` default in the consuming components and blow up on
          // .map().
          console.error(
            'Failed to load recreation resource partners',
            err?.message ?? err,
          );
          return [];
        }
      },
    }),
  ]);

  return {
    ...parentData,
    partnersInfo,
  };
}
