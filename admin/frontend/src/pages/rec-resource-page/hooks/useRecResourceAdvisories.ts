import { handleApiError } from '@/services/utils/errorHandler';
import { addErrorNotification } from '@/store/notificationStore';
import { useEffect } from 'react';
import useGetRecreationResourceAdvisories from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceAdvisories';

export function useRecResourceAdvisories(rec_resource_id?: string) {
  const {
    data: advisories,
    isLoading,
    error,
  } = useGetRecreationResourceAdvisories(rec_resource_id);

  const handleError = async (error?: unknown) => {
    if (error) {
      const { message } = await handleApiError(error);
      addErrorNotification(message);
    }
  };

  useEffect(() => {
    handleError(error);
  }, [error]);

  return {
    rec_resource_id,
    advisories,
    isLoading,
    error,
  };
}
