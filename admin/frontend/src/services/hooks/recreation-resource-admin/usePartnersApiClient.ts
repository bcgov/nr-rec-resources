import { useAuthContext } from '@/contexts/AuthContext';
import {
  PartnersApi,
  Configuration,
} from '@/services/recreation-resource-admin';

export const usePartnersApiClient = () => {
  const { authService } = useAuthContext();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || '';
  return new PartnersApi(
    new Configuration({
      basePath,
      accessToken: async () => {
        const token = await authService.getToken();
        return token as string;
      },
    }),
  );
};
