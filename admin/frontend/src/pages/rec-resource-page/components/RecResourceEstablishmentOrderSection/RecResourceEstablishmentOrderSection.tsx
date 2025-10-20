import { useGetEstablishmentOrderDocs } from '@/services';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { useCallback, useMemo, useState } from 'react';
import { GalleryAccordion } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryAccordion';
import { GalleryFileCard } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard';
import { GalleryFile } from '@/pages/rec-resource-page/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { COLOR_RED } from '@/styles/colors';
import {
  downloadUrlAsFile,
  buildFileNameWithExtension,
} from '@/utils/fileUtils';
import { ACTION_TYPES } from '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryFileCard/constants';
import { ESTABLISHMENT_ORDER_ACTIONS } from '@/pages/rec-resource-page/components/RecResourceEstablishmentOrderSection/constants';
import { formatDateReadable } from '@shared/utils';

interface RecResourceEstablishmentOrderSectionProps {
  recResourceId: string;
}

export const RecResourceEstablishmentOrderSection = ({
  recResourceId,
}: RecResourceEstablishmentOrderSectionProps) => {
  const { data: docs = [], isLoading } =
    useGetEstablishmentOrderDocs(recResourceId);
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(
    new Set(),
  );

  const galleryFiles: GalleryFile[] = useMemo(
    () =>
      docs.map((doc) => ({
        id: doc.s3_key,
        name: doc.title,
        date: formatDateReadable(doc.created_at) ?? '-',
        url: doc.url,
        extension: doc.extension || 'pdf',
        type: 'document' as const,
        isDownloading: downloadingDocs.has(doc.s3_key),
      })),
    [docs, downloadingDocs],
  );

  const handleAction = useCallback(
    (action: string, file: GalleryFile) => () => {
      const doc = docs.find((d) => d.s3_key === file.id);
      if (!doc) return;

      if (action === ACTION_TYPES.VIEW) {
        window.open(doc.url, '_blank');
      } else if (action === ACTION_TYPES.DOWNLOAD) {
        setDownloadingDocs((prev) => new Set(prev).add(doc.s3_key));

        const fileName = buildFileNameWithExtension(
          doc.title,
          doc.extension ?? 'pdf',
        );

        addSuccessNotification(`Downloading "${fileName}"...`);
        return downloadUrlAsFile(doc.url, fileName)
          .catch((error) => {
            console.error('Download failed:', error);
            addErrorNotification(
              `Failed to download "${fileName}". Please try again.`,
            );
          })
          .finally(() => {
            setDownloadingDocs((prev) => {
              const next = new Set(prev);
              next.delete(doc.s3_key);
              return next;
            });
          });
      }
    },
    [docs],
  );

  return (
    <section>
      <h2 className="my-3">Establishment orders</h2>
      <GalleryAccordion
        eventKey="establishment-orders"
        title="Documents"
        description="These are official establishment order documents for this recreation resource."
        items={galleryFiles}
        renderItem={(file) => (
          <GalleryFileCard
            file={file}
            getFileActionHandler={handleAction}
            actions={ESTABLISHMENT_ORDER_ACTIONS}
            topContent={
              <FontAwesomeIcon icon={faFilePdf} size="2x" color={COLOR_RED} />
            }
          />
        )}
        isLoading={isLoading}
      />
    </section>
  );
};
