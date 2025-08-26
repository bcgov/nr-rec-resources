import { PageLayout } from "@/components";
import { LandingPage } from "@/pages/LandingPage";
import { RecResourceNavKey } from "@/pages/rec-resource-page";
import { RecResourceFilesPage } from "@/pages/rec-resource-page/RecResourceFilesPage";
import { RecResourceOverviewPage } from "@/pages/rec-resource-page/RecResourceOverviewPage";
import { RecResourcePageLayout } from "@/pages/rec-resource-page/RecResourcePageLayout";
import { AdminRouteWrapper } from "@/routes/AdminRouteWrapper";
import { ROUTE_PATHS } from "@/routes/constants";
import {
  RecResourcePageRouteHandle,
  RecResourceRouteContext,
} from "@/routes/types";
import { BreadcrumbItem } from "@shared/components/breadcrumbs";
import { createBrowserRouter } from "react-router-dom";

// Breadcrumb helper functions
const breadcrumbHelpers = {
  home: (): BreadcrumbItem => ({
    label: "Home",
    href: ROUTE_PATHS.LANDING,
  }),
  resource: (id: string, name?: string): BreadcrumbItem => ({
    label: name || id,
    href: ROUTE_PATHS.REC_RESOURCE_PAGE.replace(":id", id),
  }),
  files: (id: string): BreadcrumbItem => ({
    label: "Files",
    href: ROUTE_PATHS.REC_RESOURCE_FILES.replace(":id", id),
  }),
};

export const adminDataRouter = createBrowserRouter([
  {
    path: "/",
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
        path: "/rec-resource/:id",
        element: (
          <PageLayout>
            <RecResourcePageLayout />
          </PageLayout>
        ),
        handle: {
          tab: RecResourceNavKey.OVERVIEW,
          breadcrumb: (context?: RecResourceRouteContext) => [
            breadcrumbHelpers.home(),
            breadcrumbHelpers.resource(
              context?.resourceId || "",
              context?.resourceName,
            ),
          ],
        } satisfies RecResourcePageRouteHandle<RecResourceRouteContext>,
        children: [
          {
            index: true,
            element: <RecResourceOverviewPage />,
            handle: {
              tab: RecResourceNavKey.OVERVIEW,
            } as RecResourcePageRouteHandle<RecResourceRouteContext>,
          },
          {
            path: "files",
            element: <RecResourceFilesPage />,
            handle: {
              tab: RecResourceNavKey.FILES,
              breadcrumb: (context?: RecResourceRouteContext) => [
                breadcrumbHelpers.home(),
                breadcrumbHelpers.resource(
                  context?.resourceId || "",
                  context?.resourceName,
                ),
                breadcrumbHelpers.files(context?.resourceId || ""),
              ],
            } satisfies RecResourcePageRouteHandle<RecResourceRouteContext>,
          },
        ],
      },
    ],
  },
]);
