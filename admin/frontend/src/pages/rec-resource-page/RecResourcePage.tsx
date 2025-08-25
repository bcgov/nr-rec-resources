import BreadCrumbs from '@/components/breadcrumbs/BreadCrumbs';
import {
  RecResourceFileSection,
  ResourceHeaderSection,
} from '@/pages/rec-resource-page/components';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Spinner, Stack } from 'react-bootstrap';
import './RecResourcePage.scss';

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

const LoadingSpinner = () => (
  <div className="rec-resource-page__loading-container">
    <Spinner
      animation="border"
      className="rec-resource-page__loading-spinner"
      role="status"
      aria-label="Loading recreation resource"
    />
  </div>
);

export const RecResourcePage = () => {
  const { recResource, isLoading, error } = useRecResource();

  if (error) {
    return null;
  }

  if (isLoading || !recResource) {
    return <LoadingSpinner />;
  }

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-page py-4"
      role="main"
      aria-label="Recreation resource content"
    >
      <BreadCrumbs recResourceName={recResource.name} />
      <ResourceHeaderSection recResource={recResource} />
      <InfoBanner />
      <RecResourceFileSection />
    </Stack>
  );
};
