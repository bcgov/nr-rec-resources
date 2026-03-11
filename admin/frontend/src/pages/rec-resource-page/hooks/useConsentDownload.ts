import { useRecreationResourceAdminApiClient } from '@/services/hooks';
import { useMutation } from '@tanstack/react-query';

/**
 * Hook to download consent form for an image.
 * Fetches presigned URL from backend and opens it for download.
 */
export function useConsentDownload() {
  const apiClient = useRecreationResourceAdminApiClient();

  return useMutation({
    mutationFn: async ({
      recResourceId,
      imageId,
    }: {
      recResourceId: string;
      imageId: string;
    }) => {
      const response = await apiClient.getConsentFormDownloadUrl({
        recResourceId,
        imageId,
      });
      return response.url;
    },
    onSuccess: (url: string | undefined) => {
      if (url) {
        // Open the presigned URL in a new tab to trigger download
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    },
  });
}
