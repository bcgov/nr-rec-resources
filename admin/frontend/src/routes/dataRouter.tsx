import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "@/pages/LandingPage";
import { RecResourcePage } from "@/pages/rec-resource-page";
import { PageLayout } from "@/components";
import { BreadcrumbItem } from "@shared/components/breadcrumbs";
import { AdminRouteWrapper } from "@/routes/AdminRouteWrapper";

// Define route paths
export const ROUTE_PATHS = {
  LANDING: "/",
  REC_RESOURCE_PAGE: "/rec-resource/:id",
};

// Breadcrumb helper functions
const breadcrumbHelpers = {
  home: (): BreadcrumbItem => ({
    label: "Home",
    href: ROUTE_PATHS.LANDING,
  }),
  resource: (id: string, name?: string): BreadcrumbItem => ({
    label: name || id,
    href: ROUTE_PATHS.REC_RESOURCE_PAGE.replace(":id", id),
    isCurrent: true,
  }),
};

// Route handle type for admin context
export interface AdminRouteHandle {
  breadcrumb?: (context?: {
    resourceName?: string;
    resourceId?: string;
  }) => BreadcrumbItem[];
}

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
        } as AdminRouteHandle,
      },
      {
        path: ROUTE_PATHS.REC_RESOURCE_PAGE,
        element: (
          <PageLayout>
            <RecResourcePage />
          </PageLayout>
        ),
        handle: {
          breadcrumb: (context) => [
            breadcrumbHelpers.home(),
            breadcrumbHelpers.resource(
              context?.resourceId || "",
              context?.resourceName,
            ),
          ],
        } as AdminRouteHandle,
      },
    ],
  },
]);
