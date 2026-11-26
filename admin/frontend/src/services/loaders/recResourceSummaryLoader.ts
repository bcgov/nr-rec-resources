import { AuthService } from '@/services/auth';
import { mapRecreationResourceDetail } from '@/services/hooks/recreation-resource-admin/helpers';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import type { RecreationResourceDetailDto } from '@/services';

export async function recResourceSummaryLoader({ context, params }: any) {
  const authService = AuthService.getInstance();

  const recResource = await context.queryClient.ensureQueryData({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.summary(params.id),
    queryFn: async () => {
      const token = (await authService.getToken()) as string;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
      const response = await fetch(
        `${apiBaseUrl.replace(/\/+$/, '')}/recreation-resources/${params.id}/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to load summary (${response.status})`);
      }

      return mapRecreationResourceDetail(
        (await response.json()) as RecreationResourceDetailDto,
      );
    },
  });

  return { recResource };
}
