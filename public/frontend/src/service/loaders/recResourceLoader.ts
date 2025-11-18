import { getRecreationResourceById } from '@/service/queries/recreation-resource';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/service/queries/recreation-resource/queryKeys';

const PREVIEW_SIZE_CODE = 'pre';
const FULL_RESOLUTION_SIZE_CODE = 'original';

export async function recResourceLoader({ context, params }: any) {
  const imageSizeCodes = [PREVIEW_SIZE_CODE, FULL_RESOLUTION_SIZE_CODE];
  const recResource = await context.queryClient.ensureQueryData({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.detail(params.id, imageSizeCodes),
    queryFn: async () => {
      const resource = await getRecreationResourceById({
        id: params.id,
        imageSizeCodes,
      });

      if (!resource) {
        const error: any = new Error('Resource not found');
        error.status = 404;
        throw error;
      }

      return resource;
    },
  });

  return { recResource, recResourceId: params.id };
}
