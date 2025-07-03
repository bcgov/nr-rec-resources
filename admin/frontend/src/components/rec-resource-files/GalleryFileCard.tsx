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
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import "./Gallery.scss";
import { GalleryFile, GalleryAction } from "./types";

export interface GalleryFileCardProps<T extends GalleryFile> {
  topContent?: React.ReactNode;
  file: T;
  onAction: (action: GalleryAction, file: T) => void;
}

const cardActions: {
  key: GalleryAction;
  icon: any;
  label: string;
  className: string;
}[] = [
  { key: "view", icon: faEye, label: "View", className: "" },
  { key: "download", icon: faCloudDownload, label: "Download", className: "" },
  { key: "delete", icon: faTrash, label: "Delete", className: "text-danger" },
];

export const GalleryFileCard = <T extends GalleryFile>({
  topContent,
  file,
  onAction,
}: GalleryFileCardProps<T>) => {
  const isFileUploadError = file.uploadFailed;
  const isFileDownloadPending = file.isUploading;
  const filename = file.name || "Untitled";
  const date = file.date || "-";
  return (
    <Card
      className={[
        "gallery-card p-0",
        isFileUploadError ? "gallery-card-error" : "",
      ].join(" ")}
    >
      <Card.Body
        className={[
          "gallery-card-top d-flex flex-column align-items-center justify-content-center p-0",
          isFileUploadError
            ? "gallery-card-top-error"
            : isFileDownloadPending
              ? "gallery-card-top-pending"
              : "",
        ].join(" ")}
        style={{
          minHeight: 120,
          position: "relative",
        }}
      >
        {isFileUploadError ? (
          <div className="gallery-card-upload-error">
            <FontAwesomeIcon
              icon={faFilePdf}
              size="2x"
              className="fa-file-pdf"
            />
            <div className="gallery-card-upload-failed">Upload Failed</div>
          </div>
        ) : isFileDownloadPending ? (
          <div className="gallery-card-upload-pending">
            <span
              className="spinner-border text-dark mb-2"
              style={{ width: 36, height: 36 }}
              role="status"
              aria-hidden="true"
            />
            <div style={{ fontWeight: 500, marginBottom: 8 }}>Uploading</div>
          </div>
        ) : (
          <>
            <div className="gallery-card-top-hover">
              {cardActions.map(({ key, icon, label }) => (
                <OverlayTrigger
                  key={key}
                  placement="bottom"
                  overlay={<Tooltip id={`tooltip-${key}`}>{label}</Tooltip>}
                >
                  <Button variant="link" onClick={() => onAction(key, file)}>
                    <FontAwesomeIcon icon={icon} />
                  </Button>
                </OverlayTrigger>
              ))}
            </div>
            {topContent}
          </>
        )}
      </Card.Body>
      <Card.Body
        className="gallery-card-body d-flex flex-column gap-1 pt-2 pb-2"
        style={{ borderTop: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Row className="gallery-card-row align-items-center">
          <Col
            className={[
              "gallery-card-filename fw-bold",
              isFileUploadError ? "gallery-card-filename-error" : "",
            ].join(" ")}
            xs="auto"
            md={10}
          >
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
                disabled={isFileDownloadPending || isFileUploadError}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {cardActions.map(({ key, icon, label, className }) => (
                  <Dropdown.Item
                    eventKey={key}
                    key={key}
                    onClick={() => onAction(key, file)}
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
          className={[
            "gallery-card-date",
            isFileUploadError ? "gallery-card-date-error" : "text-muted",
          ].join(" ")}
          style={{ fontSize: "0.92rem" }}
        >
          {date}
        </div>
      </Card.Body>
    </Card>
  );
};
