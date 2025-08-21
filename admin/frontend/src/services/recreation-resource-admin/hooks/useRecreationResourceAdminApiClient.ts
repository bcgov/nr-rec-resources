import {
  Configuration,
  RecreationResourceApi,
} from "@/services/recreation-resource-admin";
import { useAuthContext } from "@/contexts/AuthContext";

export const useRecreationResourceAdminApiClient = () => {
  const { authService } = useAuthContext();
  const basePath = import.meta.env.VITE_API_BASE_URL?.replace("/api", "") || "";
  return new RecreationResourceApi(
    new Configuration({
      basePath,
      accessToken: async () => {
        const token = await authService.getToken();
        return token as string;
      },
    }),
  );
};
