import { useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import { ResponseError } from "@/services/recreation-resource-admin";
import { addErrorNotification } from "@/store/notificationStore";

/**
 * Global error handler for React Query errors.
 *
 * @param queryClient - The QueryClient instance to subscribe to.
 */
export function useGlobalQueryErrorHandler(queryClient: QueryClient) {
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (
        event.query.state.status === "error" &&
        event.query.state.fetchStatus === "idle" &&
        event.query.state.error instanceof ResponseError
      ) {
        const status = event.query.state.error.response.status;
        const toastId = `${status}-error-${JSON.stringify(event.query.queryKey)}`;
        if (status === 401) {
          addErrorNotification(
            "401 -  Unauthorized access. Please log in again or contact support.",
            toastId,
          );
        } else if (status === 403) {
          addErrorNotification(
            "403 - Forbidden. You do not have permission to perform this action.",
            toastId,
          );
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient]);
}
