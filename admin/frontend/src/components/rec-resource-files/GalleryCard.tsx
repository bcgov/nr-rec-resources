import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudDownload,
  faEllipsisV,
  faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import "./Gallery.scss";

export interface GalleryCardProps<T> {
  topContent?: React.ReactNode;
  filename: string;
  date: string;
  file: T;
  onAction: (action: "view" | "download" | "delete" | "add", file: T) => void;
}

const cardActions = [
  { key: "view", icon: faEye, label: "View", className: "" },
  { key: "download", icon: faCloudDownload, label: "Download", className: "" },
  { key: "delete", icon: faTrash, label: "Delete", className: "text-danger" },
  // Optionally add an 'add' action here if you want a button for it:
  // { key: "add", icon: faPlus, label: "Add", className: "text-success" },
];

export const GalleryCard = <T,>({
  topContent,
  filename,
  date,
  file,
  onAction,
}: GalleryCardProps<T>) => {
  return (
    <Card className="gallery-card p-0">
      <Card.Body className="gallery-card-top d-flex flex-column align-items-center justify-content-center p-0">
        <div className="gallery-card-top-hover">
          {cardActions.map(({ key, icon, label }) => (
            <OverlayTrigger
              key={key}
              placement="bottom"
              overlay={<Tooltip id={`tooltip-${key}`}>{label}</Tooltip>}
            >
              <Button
                variant="link"
                onClick={() =>
                  onAction(key as "view" | "download" | "delete" | "add", file)
                }
              >
                <FontAwesomeIcon icon={icon} />
              </Button>
            </OverlayTrigger>
          ))}
        </div>
        {topContent}
      </Card.Body>
      <Card.Body
        className="gallery-card-body d-flex flex-column gap-1 pt-2 pb-2"
        style={{ borderTop: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Row className="gallery-card-row align-items-start">
          <Col className="gallery-card-filename fw-bold" xs="auto" md={10}>
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip id={`tooltip-filename`}>{filename}</Tooltip>}
            >
              <span className="gallery-card-filename-ellipsis">{filename}</span>
            </OverlayTrigger>
          </Col>
          <Col xs="auto">
            <Dropdown align="start">
              <Dropdown.Toggle
                variant="link"
                className="gallery-card-menu p-0 border-0 shadow-none"
                style={{ color: "inherit" }}
                as="span"
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {cardActions.map(({ key, icon, label, className }) => (
                  <Dropdown.Item
                    eventKey={key}
                    key={key}
                    onClick={() =>
                      onAction(
                        key as "view" | "download" | "delete" | "add",
                        file,
                      )
                    }
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      className={`me-2 ${className}`}
                    />
                    {label}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        <div
          className="gallery-card-date text-muted"
          style={{ fontSize: "0.92rem" }}
        >
          {date}
        </div>
      </Card.Body>
    </Card>
  );
};
