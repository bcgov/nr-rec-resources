import { PageLayout } from '@/components';
import { FeatureFlagRouteGuard } from '@/contexts/feature-flags';
import { LandingPage } from '@/pages/LandingPage';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceOverviewEditSection } from '@/pages/rec-resource-page/components/RecResourceOverviewSection';
import { RecResourceFilesPage } from '@/pages/rec-resource-page/RecResourceFilesPage';
import { RecResourceOverviewPage } from '@/pages/rec-resource-page/RecResourceOverviewPage';
import { RecResourcePageLayout } from '@/pages/rec-resource-page/RecResourcePageLayout';
import { AdminRouteWrapper } from '@/routes/AdminRouteWrapper';
import { ROUTE_PATHS } from '@/routes/constants';
import {
  RecResourcePageRouteHandle,
  RecResourceRouteContext,
} from '@/routes/types';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { createBrowserRouter, redirect } from 'react-router-dom';

// Breadcrumb helper functions
const breadcrumbHelpers = {
  home: (): BreadcrumbItem => ({
    label: 'Home',
    href: ROUTE_PATHS.LANDING,
  }),
  resourceOverview: (id: string, name?: string): BreadcrumbItem => ({
    label: name || id,
    href: ROUTE_PATHS.REC_RESOURCE_OVERVIEW.replace(':id', id),
  }),
  resourceOverviewEdit: (id: string): BreadcrumbItem => ({
    label: 'Edit Overview',
    href: ROUTE_PATHS.REC_RESOURCE_OVERVIEW_EDIT.replace(':id', id),
  }),
  files: (id: string): BreadcrumbItem => ({
    label: 'Files',
    href: ROUTE_PATHS.REC_RESOURCE_FILES.replace(':id', id),
  }),
};

export const adminDataRouter = createBrowserRouter([
  {
    path: '/',
    element: <AdminRouteWrapper />,
    children: [
      {
        path: ROUTE_PATHS.LANDING,
        element: <LandingPage />,
        handle: {
          breadcrumb: () => [breadcrumbHelpers.home()],
        },
      },
      {
        path: '/rec-resource/:id',
        element: (
          <PageLayout>
            <RecResourcePageLayout />
          </PageLayout>
        ),
        handle: {
          tab: RecResourceNavKey.OVERVIEW,
          breadcrumb: (context?: RecResourceRouteContext) => [
            breadcrumbHelpers.home(),
            breadcrumbHelpers.resourceOverview(
              context?.resourceId || '',
              context?.resourceName,
            ),
          ],
        } satisfies RecResourcePageRouteHandle<RecResourceRouteContext>,
        children: [
          {
            index: true,
            loader: () => redirect('overview'),
          },
          {
            path: 'overview',
            element: <RecResourceOverviewPage />,
            handle: {
              tab: RecResourceNavKey.OVERVIEW,
            } as RecResourcePageRouteHandle<RecResourceRouteContext>,
          },
          {
            path: 'overview/edit',
            element: (
              <FeatureFlagRouteGuard requiredFlags={['enable_full_features']}>
                <RecResourceOverviewEditSection />
              </FeatureFlagRouteGuard>
            ),
            handle: {
              tab: RecResourceNavKey.OVERVIEW,
              breadcrumb: (context?: RecResourceRouteContext) => [
                breadcrumbHelpers.home(),
                breadcrumbHelpers.resourceOverview(
                  context?.resourceId || '',
                  context?.resourceName,
                ),
                breadcrumbHelpers.resourceOverviewEdit(
                  context?.resourceId || '',
                ),
              ],
            } as RecResourcePageRouteHandle<RecResourceRouteContext>,
          },
          {
            path: 'files',
            element: <RecResourceFilesPage />,
            handle: {
              tab: RecResourceNavKey.FILES,
              breadcrumb: (context?: RecResourceRouteContext) => [
                breadcrumbHelpers.home(),
                breadcrumbHelpers.resourceOverview(
                  context?.resourceId || '',
                  context?.resourceName,
                ),
                breadcrumbHelpers.files(context?.resourceId || ''),
              ],
            } satisfies RecResourcePageRouteHandle<RecResourceRouteContext>,
          },
        ],
      },
    ],
  },
]);
