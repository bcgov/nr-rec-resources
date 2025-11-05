import {
  RecreationResourceApi,
  Configuration,
} from '@/service/recreation-resource';
import { getBasePath } from '@/service/hooks/helpers';
import { AlphabeticalRecreationResourceModel } from '@/service/custom-models';
import { RECREATION_RESOURCE_QUERY_KEYS } from '@/service/queries/recreation-resource/queryKeys';

/**
 * Non-hook function to fetch alphabetical resources for use in loaders.
 * This allows data to be prefetched during route navigation.
 */
export const getAlphabeticalResources = async (
  letter: string,
  type?: string,
): Promise<AlphabeticalRecreationResourceModel[]> => {
  if (!letter) {
    throw new Error('Letter parameter is required');
  }

  const api = new RecreationResourceApi(
    new Configuration({
      basePath: getBasePath(),
    }),
  );

  const response = await api.getRecreationResourcesAlphabetically({
    letter,
    type,
  });

  return response;
};

/**
 * Loader function for the alphabetical list route.
 * Prefetches alphabetical resources using TanStack Router's loader pattern.
 */
export async function alphabeticalLoader({ context, location }: any) {
  const searchParams = location.search;
  const letter = searchParams.letter || '#';
  const type = searchParams.type ?? undefined;

  const resources = await context.queryClient.ensureQueryData({
    queryKey: RECREATION_RESOURCE_QUERY_KEYS.alphabetical(letter, type),
    queryFn: async () => {
      return await getAlphabeticalResources(letter, type);
    },
  });

  return { resources, letter, type };
}
