import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { useQuery } from '@tanstack/react-query';
import {
  RecreationResourceDocDto,
  ResponseError,
} from '@/services/recreation-resource-admin';
import { showNotification } from '@/store/notificationStore';
import { transformRecreationResourceDocs } from '../helpers';

export const useGetDocumentsByRecResourceId = (recResourceId: string) => {
  const recreationResourceAdminApiClient =
    useRecreationResourceAdminApiClient();

  return useQuery<RecreationResourceDocDto[], ResponseError>({
    queryKey: ['getDocumentsByRecResourceId', recResourceId],
    initialData: [],
    queryFn: async () => {
      const docs =
        await recreationResourceAdminApiClient.getDocumentsByRecResourceId({
          recResourceId,
        });
      return transformRecreationResourceDocs(docs);
    },
    retry: (retryCount, error) => {
      if (retryCount >= 2) {
        showNotification(
          'Failed to load documents after multiple attempts. Please try again later.',
          'danger',
          'getDocumentsByRecResourceId-error',
        );
        return false; // Stop retrying after 3 attempts
      }
      const { status } = error.response;
      return status >= 500 && status < 600;
    },
  });
};
