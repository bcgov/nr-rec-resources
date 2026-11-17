import { useCallback } from 'react';
import { useRecreationResourceAdminApiClient } from '@/services/hooks/recreation-resource-admin/useRecreationResourceAdminApiClient';
import { addErrorNotification } from '@/store/notificationStore';

/** Opens a submission's adjudication report PDF in a new tab. */
export const useAdjudicationReport = () => {
  const apiClient = useRecreationResourceAdminApiClient();

  const fetchBytes = useCallback(
    async (applicationGuid: string) => {
      const response = await apiClient.getPendingRequestAdjudicationReportRaw(
        { applicationGuid },
        ({ init }) => ({
          ...init,
          headers: {
            ...(init.headers as Record<string, string> | undefined),
            Accept: 'application/pdf, application/octet-stream',
          },
        }),
      );

      if (!response.raw.ok) {
        const errorText = await response.raw.text();
        throw new Error(
          `Adjudication report fetch failed: ${response.raw.status} ${response.raw.statusText} ${errorText}`,
        );
      }

      const bytes = await response.raw.arrayBuffer();
      if (bytes.byteLength === 0) {
        throw new Error('Adjudication report response was empty.');
      }
      return bytes;
    },
    [apiClient],
  );

  const viewAdjudicationReport = useCallback(
    async (applicationGuid?: string | null) => {
      if (!applicationGuid) return;

      // Open the tab synchronously so popup blockers allow it.
      const popup = window.open('about:blank', '_blank');
      try {
        const bytes = await fetchBytes(applicationGuid);

        // Upstream may return octet-stream/attachment; force PDF for the viewer.
        const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
        const objectUrl = URL.createObjectURL(pdfBlob);

        if (popup && !popup.closed) {
          popup.location.replace(objectUrl);
        } else {
          window.open(objectUrl, '_blank', 'noopener,noreferrer');
        }

        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      } catch (error) {
        popup?.close();
        console.error('Adjudication report view failed:', error);
        addErrorNotification(
          'Unable to open adjudication report. Please try again.',
        );
      }
    },
    [fetchBytes],
  );

  return { viewAdjudicationReport } as const;
};
