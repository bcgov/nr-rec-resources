import { handleApiError } from '@/services/utils/errorHandler';
import { addErrorNotification } from '@/store/notificationStore';
import { useEffect } from 'react';
import useGetRecreationResourceReservation from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceReservation';

/**
 * Hook to manage recreation resource state and syncing.
 * Handles fetching recreation resource from server and updating the store.
 */
export function useRecResourceReservation(rec_resource_id?: string) {
  const {
    data: reservationInfo,
    isLoading,
    error,
  } = useGetRecreationResourceReservation(rec_resource_id);

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
    reservationInfo,
    isLoading,
    error,
  };
}
