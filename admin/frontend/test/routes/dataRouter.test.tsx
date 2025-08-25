import { adminDataRouter, ROUTE_PATHS } from "@/routes/dataRouter";
import { describe, expect, it, vi } from "vitest";

// Mock components
vi.mock("@/pages/LandingPage", () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock("@/pages/rec-resource-page", () => ({
  RecResourcePage: () => (
    <div data-testid="rec-resource-page">Rec Resource Page</div>
  ),
}));

vi.mock("@/components", () => ({
  PageLayout: ({ children }: any) => (
    <div data-testid="page-layout">{children}</div>
  ),
}));

vi.mock("@/routes/AdminRouteWrapper", () => ({
  AdminRouteWrapper: () => (
    <div data-testid="admin-route-wrapper">Admin Route Wrapper</div>
  ),
}));

describe("dataRouter", () => {
  describe("ROUTE_PATHS", () => {
    it("exports correct route paths", () => {
      expect(ROUTE_PATHS.LANDING).toBe("/");
      expect(ROUTE_PATHS.REC_RESOURCE_PAGE).toBe("/rec-resource/:id");
    });
  });

  describe("router configuration", () => {
    it("has correct number of routes", () => {
      expect(adminDataRouter.routes).toHaveLength(1);
      expect(adminDataRouter.routes[0].children).toHaveLength(2);
    });

    it("configures root route with AdminRouteWrapper", () => {
      const rootRoute = adminDataRouter.routes[0];
      expect(rootRoute.path).toBe("/");
      expect(rootRoute).toHaveProperty("element");
    });

    it("configures landing page route", () => {
      const rootRoute = adminDataRouter.routes[0];
      const landingRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.LANDING,
      );

      expect(landingRoute).toBeDefined();
      expect(landingRoute).toHaveProperty("element");
      expect(landingRoute?.handle?.breadcrumb).toBeDefined();
    });

    it("configures rec resource page route", () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.REC_RESOURCE_PAGE,
      );

      expect(recResourceRoute).toBeDefined();
      expect(recResourceRoute).toHaveProperty("element");
      expect(recResourceRoute?.handle?.breadcrumb).toBeDefined();
    });
  });

  describe("breadcrumb handlers", () => {
    it("landing page breadcrumb returns home", () => {
      const rootRoute = adminDataRouter.routes[0];
      const landingRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.LANDING,
      );
      const breadcrumbs = landingRoute?.handle?.breadcrumb?.();

      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs?.[0]).toEqual({
        label: "Home",
        href: ROUTE_PATHS.LANDING,
      });
    });

    it("rec resource page breadcrumb returns home and resource", () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.REC_RESOURCE_PAGE,
      );
      const breadcrumbs = recResourceRoute?.handle?.breadcrumb?.({
        resourceId: "123",
        resourceName: "Test Resource",
      });

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs?.[0]).toEqual({
        label: "Home",
        href: ROUTE_PATHS.LANDING,
      });
      expect(breadcrumbs?.[1]).toEqual({
        label: "Test Resource",
        href: "/rec-resource/123",
        isCurrent: true,
      });
    });

    it("rec resource page breadcrumb uses resource id when name not provided", () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.REC_RESOURCE_PAGE,
      );
      const breadcrumbs = recResourceRoute?.handle?.breadcrumb?.({
        resourceId: "123",
      });

      expect(breadcrumbs?.[1]).toEqual({
        label: "123",
        href: "/rec-resource/123",
        isCurrent: true,
      });
    });

    it("rec resource page breadcrumb handles empty context", () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.REC_RESOURCE_PAGE,
      );
      const breadcrumbs = recResourceRoute?.handle?.breadcrumb?.();

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs?.[1]).toEqual({
        label: "",
        href: "/rec-resource/",
        isCurrent: true,
      });
    });
  });
});
