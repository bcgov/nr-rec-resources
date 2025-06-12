import { Badge, Col, ListGroup, Row } from "react-bootstrap";
import { FC, ReactNode } from "react";
import { Highlighter } from "react-bootstrap-typeahead";

interface SearchItemData {
  searchTerm: string;
  icon: ReactNode;
  title: string;
  resourceType: string; // e.g., "Interpretive Forest", "Trail"
  district: string; // e.g., "Comox, Island", "Rossland, Interior"
  rec_resource_id: string;
}

export const SuggestionListItem: FC<SearchItemData> = ({
  searchTerm,
  rec_resource_id,
  icon,
  title,
  resourceType,
  district,
}) => {
  return (
    <ListGroup.Item
      action
      className="py-3 px-3 border-bottom d-flex align-items-center"
    >
      <Row className="flex-grow-1 align-items-center">
        {/* Left Section: Icon */}
        <Col
          xs="auto"
          className="d-flex align-items-center justify-content-center"
        >
          <div
            className={`rounded-circle d-flex align-items-center justify-content-center`}
            style={{ width: "40px", height: "40px", flexShrink: 0 }} // Fixed size for icon circle
          >
            {icon}
          </div>
        </Col>

        {/* Middle Section: Title and Description */}
        <Col className="ms-2 me-auto">
          <Highlighter search={searchTerm}>{title}</Highlighter>
          <div className="text-muted" style={{ fontSize: "0.9em" }}>
            {resourceType} &bull; {district}{" "}
            {/* Updated to use resourceType and district */}
          </div>
        </Col>

        {/* Right Section: Record ID Badge */}
        <Col xs="auto" className="d-flex align-items-center">
          <Badge bg="light" text="secondary" className="px-3 py-2 rounded-pill">
            {rec_resource_id}
          </Badge>
        </Col>
      </Row>
    </ListGroup.Item>
  );
};
