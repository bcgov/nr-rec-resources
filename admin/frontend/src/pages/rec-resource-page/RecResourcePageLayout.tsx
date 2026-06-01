import {
  RecResourceNavKey,
  RecResourceVerticalNav,
  ResourceHeaderSection,
} from '@/pages/rec-resource-page';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import {
  RecResourcePageRouteHandle,
  RecResourceRouteContext,
} from '@/pages/rec-resource-page/types';
import { Breadcrumbs } from '@shared/index';
import { Col, Row, Spinner, Stack } from 'react-bootstrap';
import { Outlet, useMatches, useParams } from '@tanstack/react-router';
import './RecResourcePageLayout.scss';
import { ArchivedNotice } from '@/components/archived-notice/ArchivedNotice';

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

export const RecResourcePageLayout = () => {
  const { recResource, isLoading, error } = useRecResource();
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });
  const matches = useMatches() as unknown as Array<{
    handle?: RecResourcePageRouteHandle<RecResourceRouteContext>;
  }>;

  // Derive activeTab from current route context
  const currentMatch = matches[matches.length - 1];
  const activeTab =
    (currentMatch as any).context?.tab ?? RecResourceNavKey.OVERVIEW;

  if (!rec_resource_id || error) {
    return null;
  }

  if (isLoading || !recResource) {
    return <LoadingSpinner />;
  }

  const isArchived = (recResource.rec_status_code ?? false) === 'AR';

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-page"
      role="main"
      aria-label="Recreation resource content"
    >
      <Breadcrumbs />
      {isArchived && <ArchivedNotice />}

      <ResourceHeaderSection recResource={recResource} />

      <Row>
        <Col md={3}>
          <RecResourceVerticalNav
            activeTab={activeTab}
            resourceId={rec_resource_id}
          />
        </Col>
        <Col md={9}>
          <Outlet />
        </Col>
      </Row>
    </Stack>
  );
};
