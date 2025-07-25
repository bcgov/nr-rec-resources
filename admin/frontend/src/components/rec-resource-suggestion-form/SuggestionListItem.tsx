import { Badge, Col, ListGroup, Row } from "react-bootstrap";
import { FC, ReactNode } from "react";
import { Highlighter } from "react-bootstrap-typeahead";
import "@shared/components/suggestion-typeahead/SuggestionListItem.scss";

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
  /** Unique identifier for the recreation resource (e.g.: REC00002). */
  rec_resource_id: string;
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
  rec_resource_id,
  icon,
  title,
  resourceType,
  district,
}) => {
  return (
    <ListGroup.Item action className="suggestion-list-item px-2 py-2">
      <Row className="suggestion-list-row">
        {/* Left Section: Icon */}
        <Col xs="auto" className="icon-col flex-shrink-0">
          <div
            className="icon-wrapper"
            style={{ width: "40px", height: "40px" }}
          >
            {icon}
          </div>
        </Col>

        {/* Middle Section (Desktop/Tablet) */}
        <Col className="desktop-col">
          <span className="rec-name">
            <Highlighter search={searchTerm}>{title}</Highlighter>
          </span>
          <div className="description-text">
            {resourceType} &bull; {district}
          </div>
        </Col>

        {/* Middle Section (Mobile) */}
        <Col className="mobile-col">
          <div className="mobile-inner">
            <span className="rec-name mb-1">
              <Highlighter search={searchTerm}>{title}</Highlighter>
            </span>
            <Badge className="rec-id-badge px-3 py-2 rounded-pill align-self-start">
              {rec_resource_id}
            </Badge>
          </div>
        </Col>

        {/* Right Section (Desktop/Tablet) */}
        <Col
          xs="auto"
          className="d-none d-sm-flex align-items-center flex-shrink-0"
        >
          <Badge className="rec-id-badge px-3 py-2 rounded-pill">
            {rec_resource_id}
          </Badge>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
