import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { recResourceLoader } from './recResourceLoader';

export async function recResourceReservationLoader(args: any) {
  const parentData = await recResourceLoader(args);
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  const [reservationInfo] = await Promise.all([
    args.context.queryClient.ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.reservation(args.params.id),
      queryFn: async () => {
        try {
          const response = await api.getRecreationResourceReservation({
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
    reservationInfo,
  };
}
