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
import { Spinner, Stack } from 'react-bootstrap';
import {
  Outlet,
  useLayoutEffect,
  useMatches,
  useParams,
} from '@tanstack/react-router';
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

  // Reset scroll whenever activeTab or resource id changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0);

    const mainScrollContainer =
      document.querySelector('main') || document.querySelector('.app-content');
    if (mainScrollContainer) {
      mainScrollContainer.scrollTop = 0;
    }
  }, [activeTab, rec_resource_id]);

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
      role="main-container"
      aria-label="Recreation resource content"
    >
      <Breadcrumbs />
      {isArchived && <ArchivedNotice />}

      <ResourceHeaderSection recResource={recResource} />

      <div className="d-flex flex-column flex-md-row gap-4 align-items-start">
        <aside className="w-100 w-md-auto flex-shrink-0">
          <RecResourceVerticalNav
            activeTab={activeTab}
            resourceId={rec_resource_id}
          />
        </aside>
        <main className="flex-grow-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </Stack>
  );
};
