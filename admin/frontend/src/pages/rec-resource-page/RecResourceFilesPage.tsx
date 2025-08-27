import { RecResourceFileSection } from "@/pages/rec-resource-page/components/RecResourceFileSection";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Stack } from "react-bootstrap";
import "./RecResourcePageLayout.scss";

const InfoBanner = () => (
  <Alert variant="warning" className="rec-resource-page__info-banner">
    <Stack direction="horizontal" gap={2}>
      <FontAwesomeIcon
        className="rec-resource-page__info-banner-icon"
        icon={faInfoCircle}
        aria-label="Information"
      />
      <span className="rec-resource-page__info-banner-text">
        All images and documents will be published to the beta website within 15
        minutes.
      </span>
    </Stack>
  </Alert>
);

export const RecResourceFilesPage = () => {
  return (
    <Stack direction="vertical" gap={4}>
      <InfoBanner />
      <RecResourceFileSection />
    </Stack>
  );
};
