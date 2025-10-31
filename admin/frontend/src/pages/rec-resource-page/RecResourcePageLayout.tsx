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
import { useEffect, useState } from 'react';
import { Col, Row, Spinner, Stack } from 'react-bootstrap';
import { Outlet, useMatches, useParams } from '@tanstack/react-router';
import './RecResourcePageLayout.scss';

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
  const [activeTab, setActiveTab] = useState<RecResourceNavKey>(
    RecResourceNavKey.OVERVIEW,
  );

  // Update store based on current route context
  useEffect(() => {
    const currentMatch = matches[matches.length - 1];
    const tabFromRoute = (currentMatch as any).context?.tab;
    if (tabFromRoute) {
      setActiveTab(tabFromRoute);
    }
  }, [matches]);

  if (!rec_resource_id || error) {
    return null;
  }

  if (isLoading || !recResource) {
    return <LoadingSpinner />;
  }

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-page"
      role="main"
      aria-label="Recreation resource content"
    >
      <Breadcrumbs />
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
