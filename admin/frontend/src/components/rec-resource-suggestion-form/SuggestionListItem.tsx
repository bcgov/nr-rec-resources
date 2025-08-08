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

        {/* Combined Middle Section */}
        <Col className="content-col d-flex flex-column">
          <span className="rec-name mb-1 capitalize">
            <Highlighter search={searchTerm}>{title.toLowerCase()}</Highlighter>
          </span>

          {/* Desktop / Tablet description */}
          <div className="description-text d-none d-sm-block">
            {resourceType} &bull; {district}
          </div>

          {/* Mobile badge */}
          <Badge className="rec-id-badge px-3 py-2 rounded-pill align-self-start d-sm-none">
            {rec_resource_id}
          </Badge>
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
