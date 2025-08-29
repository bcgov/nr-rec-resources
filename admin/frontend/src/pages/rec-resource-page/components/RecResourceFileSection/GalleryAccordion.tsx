import { StyledAccordion } from '@/pages/rec-resource-page/components/StyledAccordion';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ReactNode } from 'react';
import { Col, Row, Spinner, Stack } from 'react-bootstrap';
import { FileUploadTile } from './FileUploadTile';
import './GalleryAccordion.scss';

const GalleryColumn = ({ children }: { children: ReactNode }) => (
  <Col sm={12} md={4} className="gallery-accordion__column">
    {children}
  </Col>
);

interface GalleryAccordionProps<T> {
  eventKey: string;
  title: string;
  description: string;
  items: T[];
  renderItem: (item: T, idx: number) => ReactNode;
  onFileUploadTileClick?: () => void;
  uploadLabel?: string;
  isLoading?: boolean;
  uploadDisabled?: boolean;
}

export function GalleryAccordion<T>({
  eventKey,
  title,
  description,
  items,
  renderItem,
  onFileUploadTileClick,
  uploadLabel = 'Upload',
  isLoading = false,
  uploadDisabled = false,
}: GalleryAccordionProps<T>) {
  return (
    <StyledAccordion eventKey={eventKey} title={`${title} (${items.length})`}>
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
          {/* Gallery alert banner */}
          <div className="gallery-accordion__alert-banner px-4 py-2">
            <span className="gallery-accordion__alert-icon">
              <FontAwesomeIcon icon={faInfoCircle} />
            </span>
            <span className="gallery-accordion__alert-text">{description}</span>
          </div>

          <Row className="gallery-accordion__row g-3">
            {/* Upload tile */}
            <GalleryColumn>
              <FileUploadTile
                disabled={uploadDisabled}
                label={uploadLabel}
                onClick={onFileUploadTileClick}
              />
            </GalleryColumn>

            {items.map((item, idx) => (
              <GalleryColumn key={idx}>{renderItem(item, idx)}</GalleryColumn>
            ))}
          </Row>
        </Stack>
      )}
    </StyledAccordion>
  );
}
