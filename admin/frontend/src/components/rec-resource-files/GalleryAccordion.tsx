import React from "react";
import { Accordion, Row, Col, Stack } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "./Gallery.scss";

interface GalleryAccordionProps<T> {
  eventKey: string;
  title: string;
  description: string;
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  onUploadClick?: () => void;
  uploadLabel?: string;
}

export function GalleryAccordion<T>({
  eventKey,
  title,
  description,
  items,
  renderItem,
  onUploadClick,
  uploadLabel = "Upload",
}: GalleryAccordionProps<T>) {
  return (
    <Accordion defaultActiveKey={eventKey} className="gallery-accordion">
      <Accordion.Item eventKey={eventKey}>
        <Accordion.Header>
          <span style={{ fontWeight: 600, fontSize: "1.15rem" }}>
            {title} ({items.length})
          </span>
        </Accordion.Header>
        <Accordion.Body>
          <Stack direction="vertical" gap={4}>
            {/* Gallery alert banner */}
            <div className="gallery-alert-banner px-4 py-2">
              <span className="gallery-alert-icon">
                <FontAwesomeIcon icon={faInfoCircle} />
              </span>
              <span className="gallery-alert-text">{description}</span>
            </div>

            <Row className="g-3">
              {/* Upload tile */}
              <Col xs={12} sm={6} md={3} className="gallery-column">
                <div
                  className="upload-tile-dashed d-flex flex-column align-items-center justify-content-center h-100 w-100"
                  onClick={onUploadClick}
                >
                  <span
                    className="fs-1 fw-light text-muted"
                    style={{ lineHeight: 1 }}
                  >
                    +
                  </span>
                  <span className="fs-6 fw-normal text-muted mt-1">
                    {uploadLabel}
                  </span>
                </div>
              </Col>

              {items.map((item, idx) => (
                <Col xs={12} sm={6} md={3} key={idx}>
                  {renderItem(item, idx)}
                </Col>
              ))}
            </Row>
          </Stack>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}
