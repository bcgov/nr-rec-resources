import { useStore } from "@tanstack/react-store";
import { recResourceDetailStore } from "../store/recResourceDetailStore";
import { Alert, Stack } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import "./RecResourcePageContent.scss";
import { RecResourceFileSection } from "./RecResourceFileSection";
import { ResourceHeaderSection } from "./ResourceHeaderSection";

export const RecResourcePageContent = () => {
  const { recResource } = useStore(recResourceDetailStore);

  if (!recResource) {
    return <div>Error: Recreation Resource data is not available.</div>;
  }

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-files-page py-4"
    >
      <ResourceHeaderSection recResource={recResource} />

      {/* Info banner */}
      <Alert variant="warning" className="rec-resource-files-page__info-banner">
        <Stack direction="horizontal" gap={2}>
          <FontAwesomeIcon
            className="rec-resource-files-page__info-banner-icon"
            icon={faInfoCircle}
          />
          <span className="rec-resource-files-page__info-banner-text">
            All images and documents will be published to the beta website
            immediately.
          </span>
        </Stack>
      </Alert>

      <RecResourceFileSection rec_resource_id={recResource.rec_resource_id} />
    </Stack>
  );
};
