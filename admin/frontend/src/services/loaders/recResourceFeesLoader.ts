import { AuthService } from '@/services/auth';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import { mapRecreationFee } from '@/services/hooks/recreation-resource-admin/helpers';

export async function recResourceFeesLoader({ context, params }: any) {
  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  // Fetch fees and resource detail in parallel but handle errors gracefully so the
  // route can render an error state instead of crashing the whole app.
  let fees: any[] = [];
  let recResource: any = null;

  try {
    fees = await context.queryClient.ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.fees(params.id),
      queryFn: async () => {
        const response = await api.getRecreationResourceFees({
          recResourceId: params.id,
        });
        return response.map(mapRecreationFee);
      },
    });
  } catch (err: any) {
    // Log and surface minimal info; the page can show an error message to the user.
    // Don't rethrow here to allow the breadcrumbs and layout to render.
    // eslint-disable-next-line no-console
    console.error(
      'Failed to load recreation resource fees',
      err?.message ?? err,
    );
    fees = [];
  }

  try {
    recResource = await context.queryClient.ensureQueryData({
      queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(params.id),
      queryFn: async () => {
        const data = await api.getRecreationResourceById({
          recResourceId: params.id,
        });
        return data;
      },
    });
  } catch (err: any) {
    // If the resource detail fails we should allow the route to render an error UI,
    // but avoid an uncaught exception here.
    // eslint-disable-next-line no-console
    console.error(
      'Failed to load recreation resource detail',
      err?.message ?? err,
    );
    recResource = null;
  }

  return { fees, recResource };
}
