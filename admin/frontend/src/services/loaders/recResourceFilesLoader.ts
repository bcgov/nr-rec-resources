import { AuthService } from '@/services/auth';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/services/hooks/recreation-resource-admin/queryKeys';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';
import { GetOptionsByTypesTypesEnum } from '@/services/recreation-resource-admin/apis/RecreationResourcesApi';
import { recResourceLoader } from './recResourceLoader';

export async function recResourceFilesLoader(args: any) {
  const parentData = await recResourceLoader(args);

  const authService = AuthService.getInstance();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';

  const api = new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => (await authService.getToken()) as string,
    }),
  );

  await args.context.queryClient.ensureQueryData({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.options([
      GetOptionsByTypesTypesEnum.PhotographerType,
    ]),
    queryFn: () =>
      api.getOptionsByTypes({
        types: [GetOptionsByTypesTypesEnum.PhotographerType],
      }),
  });

  return parentData;
}
