import { Col, ListGroup, Row } from 'react-bootstrap';
import { FC, ReactNode } from 'react';
import { Highlighter } from 'react-bootstrap-typeahead';

/**
 * Props for the SuggestionListItem component.
 */
interface SearchItemData {
  /** The current search term to highlight in the title. */
  searchTerm: string;
  /** Icon to display for the resource. */
  icon: ReactNode;
  /** Title or name of the resource. */
  title: string;
  /** Type of the recreation resource (e.g.: Recreation site, Recreation trail, etc). */
  resourceType: string;
  /** District where the resource is located (e.g.: Chilliwack, Squamish, etc). */
  district: string;
}

/**
 * Renders a single suggestion item for a recreation resource in the typeahead dropdown.
 * Displays an icon, title (with highlighted search term), resource type, district, and record ID.
 *
 * - On desktop/tablet: shows icon, title, type, district, and record ID badge.
 * - On mobile: shows icon, title, and record ID badge.
 */
export const SuggestionListItem: FC<SearchItemData> = ({
  searchTerm,
  icon,
  title,
  resourceType,
  district,
}) => {
  return (
    <ListGroup.Item action className={`d-flex align-items-center`}>
      <Row className="flex-grow-1 align-items-center w-100 g-3">
        {/* Left Section: Icon */}
        <Col
          xs="auto"
          className="d-flex align-items-center justify-content-center"
        >
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center`}
          >
            {icon}
          </div>
        </Col>

        {/* Middle Section: Title and Description (desktop/tablet) */}
        <Col className="ms-1 me-auto d-none d-sm-block">
          <span className="rec-name">
            <Highlighter search={searchTerm}>{title}</Highlighter>
          </span>
          <div className="text-muted" style={{ fontSize: '0.9em' }}>
            {resourceType} &bull; {district}
          </div>
        </Col>

        {/* Middle Section: Title and Rec ID (mobile) */}
        <Col className="ms-1 me-auto d-block d-sm-none">
          <div className="d-flex flex-column">
            <span className="rec-name mb-1">
              <Highlighter search={searchTerm}>{title}</Highlighter>
            </span>
          </div>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
