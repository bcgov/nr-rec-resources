import { useGetRecreationResourceById } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceById';
import { useGetRecreationResourceSummaryById } from '@/services/hooks/recreation-resource-admin/useGetRecreationResourceSummaryById';
import { handleApiError } from '@/services/utils/errorHandler';
import { addErrorNotification } from '@/store/notificationStore';
import { useEffect } from 'react';
import { useLocation, useParams } from '@tanstack/react-router';

/**
 * Hook to manage recreation resource state and syncing.
 * Handles fetching recreation resource from server and updating the store.
 */
export function useRecResource() {
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });
  const { pathname } = useLocation();
  const isGeospatialRoute = pathname.includes('/geospatial');

  const fullResourceQuery = useGetRecreationResourceById(rec_resource_id, {
    enabled: !isGeospatialRoute,
  });
  const summaryResourceQuery = useGetRecreationResourceSummaryById(
    rec_resource_id,
    {
      enabled: isGeospatialRoute,
    },
  );

  const recResource = isGeospatialRoute
    ? summaryResourceQuery.data
    : fullResourceQuery.data;
  const isLoading = isGeospatialRoute
    ? summaryResourceQuery.isLoading
    : fullResourceQuery.isLoading;
  const error = isGeospatialRoute
    ? summaryResourceQuery.error
    : fullResourceQuery.error;

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
