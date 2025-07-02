import React from "react";
import { Button, Stack } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export const ResourceHeaderSection = ({
  name,
  recId,
}: {
  name: string;
  recId: string;
}) => (
  <div className="resource-header-section">
    <div className="resource-header-title">
      <h1>{name}</h1>
      <span className="resource-badge px-2">{recId}</span>
    </div>
    <Stack direction="horizontal" gap={3} className="py-2">
      <Button variant="outline-primary">
        <Stack direction="horizontal" gap={2}>
          <FontAwesomeIcon icon={faPlus} />
          Upload image
        </Stack>
      </Button>
      <Button variant="outline-primary">
        <Stack direction="horizontal" gap={2}>
          <FontAwesomeIcon icon={faPlus} />
          Upload document
        </Stack>
      </Button>
    </Stack>
  </div>
);
