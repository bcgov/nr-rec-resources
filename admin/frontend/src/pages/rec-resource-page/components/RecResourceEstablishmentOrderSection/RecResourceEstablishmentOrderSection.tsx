import {
  useGetEstablishmentOrderDocs,
  EstablishmentOrderDocDto,
} from '@/services';
import {
  addErrorNotification,
  addSuccessNotification,
} from '@/store/notificationStore';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { Col, Row, Spinner, Stack } from 'react-bootstrap';
import { StyledAccordion } from '../StyledAccordion/StyledAccordion';
import {
  EstablishmentOrderAction,
  EstablishmentOrderCard,
} from './EstablishmentOrderCard';
import '@/pages/rec-resource-page/components/RecResourceFileSection/GalleryAccordion.scss';

interface RecResourceEstablishmentOrderSectionProps {
  recResourceId: string;
}

const GalleryColumn = ({ children }: { children: React.ReactNode }) => (
  <Col sm={12} md={4} className="gallery-accordion__column">
    {children}
  </Col>
);

export const RecResourceEstablishmentOrderSection = ({
  recResourceId,
}: RecResourceEstablishmentOrderSectionProps) => {
  const { data: docs = [], isLoading } =
    useGetEstablishmentOrderDocs(recResourceId);
  const [downloadingDocs, setDownloadingDocs] = useState<Set<string>>(
    new Set(),
  );

  const downloadFile = async (doc: EstablishmentOrderDocDto) => {
    setDownloadingDocs((prev) => new Set(prev).add(doc.s3_key));

    // Ensure filename has proper extension
    const fileName = doc.extension
      ? `${doc.title}.${doc.extension}`
      : doc.title.endsWith('.pdf')
        ? doc.title
        : `${doc.title}.pdf`;

    try {
      addSuccessNotification(`Downloading "${fileName}"...`);

      // Simple direct download
      const link = document.createElement('a');
      link.href = doc.url;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      addErrorNotification(
        `Failed to download "${fileName}". Please try again.`,
      );
    } finally {
      // Remove downloading state
      setTimeout(() => {
        setDownloadingDocs((prev) => {
          const next = new Set(prev);
          next.delete(doc.s3_key);
          return next;
        });
      }, 1000);
    }
  };

  const handleAction = (
    action: EstablishmentOrderAction,
    doc: EstablishmentOrderDocDto,
  ) => {
    switch (action) {
      case 'view':
        // Open in new tab for viewing
        window.open(doc.url, '_blank');
        break;
      case 'download':
        downloadFile(doc);
        break;
    }
  };

  return (
    <StyledAccordion
      eventKey="establishment-orders"
      title={`Establishment Order(s) (${docs.length})`}
    >
      {isLoading ? (
        <div className="gallery-accordion__loading d-flex align-items-center justify-content-center w-100">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Stack
          direction="vertical"
          gap={4}
          className="gallery-accordion__stack"
        >
          {/* Info banner */}
          <div className="gallery-accordion__alert-banner px-4 py-2">
            <span className="gallery-accordion__alert-icon">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
            <span className="gallery-accordion__alert-text">
              These are official establishment order documents for this
              recreation resource.
            </span>
          </div>

          {docs.length > 0 ? (
            <Row className="gallery-accordion__row g-3">
              {docs.map((doc) => (
                <GalleryColumn key={doc.s3_key}>
                  <EstablishmentOrderCard
                    doc={doc}
                    onAction={handleAction}
                    isDownloading={downloadingDocs.has(doc.s3_key)}
                  />
                </GalleryColumn>
              ))}
            </Row>
          ) : (
            <div className="gallery-accordion__empty text-muted text-center py-4">
              No establishment order documents available.
            </div>
          )}
        </Stack>
      )}
    </StyledAccordion>
  );
};
