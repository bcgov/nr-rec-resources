import { handleApiError } from "@/services/utils/errorHandler";
import { addErrorNotification } from "@/store/notificationStore";
import { QueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Global error handler for React Query errors.
 *
 * @param queryClient - The QueryClient instance to subscribe to.
 */
export function useGlobalQueryErrorHandler(queryClient: QueryClient) {
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe(async (event) => {
      if (
        event.query.state.status === "error" &&
        event.query.state.fetchStatus === "idle"
      ) {
        const { statusCode, message, isAuthError } = await handleApiError(
          event.query.state.error,
        );

        // Only show notifications for auth errors in global handler
        if (isAuthError) {
          addErrorNotification(`${statusCode} - ${message}`);
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient]);
}
