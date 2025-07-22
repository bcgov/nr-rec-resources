import { useGetRecreationResourceById } from "@/services/hooks/recreation-resource-admin/useGetRecreationResourceById";
import { handleApiError } from "@/services/utils/errorHandler";
import { addErrorNotification } from "@/store/notificationStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

/**
 * Hook to manage recreation resource state and syncing.
 * Handles fetching recreation resource from server and updating the store.
 */
export function useRecResource() {
  const { id: rec_resource_id } = useParams();

  const {
    data: recResource,
    isLoading,
    error,
  } = useGetRecreationResourceById(rec_resource_id);

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
    recResource,
    isLoading,
    error,
  };
}
