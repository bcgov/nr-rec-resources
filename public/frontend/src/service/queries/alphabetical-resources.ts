import { useQuery } from '@tanstack/react-query';
import { useRecreationResourceApi } from '@/service/hooks/useRecreationResourceApi';
import { AlphabeticalRecreationResourceModel } from '@/service/custom-models';

export const useAlphabeticalResources = (letter: string) => {
  const api = useRecreationResourceApi();

  return useQuery({
    queryKey: ['alphabetical-resources', letter],
    queryFn: async (): Promise<AlphabeticalRecreationResourceModel[]> => {
      if (!letter) {
        throw new Error('Letter parameter is required');
      }
      const response = await api.getRecreationResourcesAlphabetically({
        letter,
      });
      return response;
    },
    enabled: !!letter && letter.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
