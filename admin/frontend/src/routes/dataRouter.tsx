import { PageLayout } from "@/components";
import { LandingPage } from "@/pages/LandingPage";
import { RecResourcePage } from "@/pages/rec-resource-page";
import { RecResourceFilesPage } from "@/pages/rec-resource-page/RecResourceFilesPage";
import { RecResourceLayout } from "@/pages/rec-resource-page/RecResourceLayout";
import { AdminRouteWrapper } from "@/routes/AdminRouteWrapper";
import { ROUTE_PATHS } from "@/routes/constants";
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
    isCurrent: true,
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
            <RecResourceLayout />
          </PageLayout>
        ),
        handle: {
          breadcrumb: (context: {
            resourceId: string;
            resourceName?: string;
          }) => [
            breadcrumbHelpers.home(),
            breadcrumbHelpers.resource(
              context?.resourceId || "",
              context?.resourceName,
            ),
          ],
        },
        children: [
          {
            index: true,
            element: <RecResourcePage />,
          },
          {
            path: "files",
            element: <RecResourceFilesPage />,
            handle: {
              breadcrumb: (context: {
                resourceId: string;
                resourceName?: string;
              }) => [
                breadcrumbHelpers.home(),
                breadcrumbHelpers.resource(
                  context?.resourceId || "",
                  context?.resourceName,
                ),
                breadcrumbHelpers.files(context?.resourceId || ""),
              ],
            },
          },
        ],
      },
    ],
  },
]);
