import { useAuthContext } from '@/contexts/AuthContext';
import {
  Configuration,
  RecreationResourcesApi,
} from '@/services/recreation-resource-admin';

export const useRecreationResourceAdminApiClient = () => {
  const { authService } = useAuthContext();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  return new RecreationResourcesApi(
    new Configuration({
      basePath,
      accessToken: async () => {
        const token = await authService.getToken();
        return token as string;
      },
    }),
  );
};
