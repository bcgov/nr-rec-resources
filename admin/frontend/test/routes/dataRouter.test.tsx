import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { adminDataRouter, ROUTE_PATHS } from '@/routes';
import { describe, expect, it, vi } from 'vitest';

// Mock components
vi.mock('@/pages/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('@/pages/rec-resource-page/RecResourcePage', () => ({
  RecResourcePage: () => (
    <div data-testid="rec-resource-page">Rec Resource Page</div>
  ),
}));

vi.mock('@/pages/rec-resource-page/RecResourceFilesPage', () => ({
  RecResourceFilesPage: () => (
    <div data-testid="rec-resource-files-page">Files Page</div>
  ),
}));

vi.mock('@/pages/rec-resource-page/RecResourceOverviewPage', () => ({
  RecResourceOverviewPage: () => (
    <div data-testid="rec-resource-overview-page">Overview Page</div>
  ),
}));

vi.mock('@/pages/rec-resource-page/RecResourcePageLayout', () => ({
  RecResourcePageLayout: () => (
    <div data-testid="rec-resource-page-layout">Resource Layout</div>
  ),
}));

vi.mock('@/components', () => ({
  PageLayout: ({ children }: any) => (
    <div data-testid="page-layout">{children}</div>
  ),
}));

vi.mock('@/routes/AdminRouteWrapper', () => ({
  AdminRouteWrapper: () => (
    <div data-testid="admin-route-wrapper">Admin Route Wrapper</div>
  ),
}));

describe('dataRouter', () => {
  describe('ROUTE_PATHS', () => {
    it('exports correct route paths', () => {
      expect(ROUTE_PATHS.LANDING).toBe('/');
      expect(ROUTE_PATHS.REC_RESOURCE_PAGE).toBe('/rec-resource/:id');
    });
  });

  describe('router configuration', () => {
    it('has correct number of routes', () => {
      expect(adminDataRouter.routes).toHaveLength(1);
      expect(adminDataRouter.routes[0].children).toHaveLength(2);
    });

    it('configures root route with AdminRouteWrapper', () => {
      const rootRoute = adminDataRouter.routes[0];
      expect(rootRoute.path).toBe('/');
      expect(rootRoute).toHaveProperty('element');
    });

    it('configures landing page route', () => {
      const rootRoute = adminDataRouter.routes[0];
      const landingRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.LANDING,
      );

      expect(landingRoute).toBeDefined();
      expect(landingRoute).toHaveProperty('element');
      expect(landingRoute?.handle?.breadcrumb).toBeDefined();
    });

    it('configures rec resource page route', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === '/rec-resource/:id',
      );

      expect(recResourceRoute).toBeDefined();
      expect(recResourceRoute).toHaveProperty('element');
      expect(recResourceRoute?.handle?.breadcrumb).toBeDefined();
      expect(recResourceRoute?.handle?.tab).toBe(RecResourceNavKey.OVERVIEW);
    });

    it('configures rec resource overview child route', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === '/rec-resource/:id',
      );

      const overviewRoute = recResourceRoute?.children?.find(
        (route) => route.index === true,
      );

      expect(overviewRoute).toBeDefined();
      expect(overviewRoute).toHaveProperty('element');
      expect(overviewRoute?.handle?.tab).toBe(RecResourceNavKey.OVERVIEW);
    });

    it('configures rec resource files child route', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === '/rec-resource/:id',
      );

      const filesRoute = recResourceRoute?.children?.find(
        (route) => route.path === 'files',
      );

      expect(filesRoute).toBeDefined();
      expect(filesRoute).toHaveProperty('element');
      expect(filesRoute?.handle?.tab).toBe(RecResourceNavKey.FILES);
      expect(filesRoute?.handle?.breadcrumb).toBeDefined();
    });
  });

  describe('breadcrumb handlers', () => {
    it('landing page breadcrumb returns home', () => {
      const rootRoute = adminDataRouter.routes[0];
      const landingRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.LANDING,
      );
      const breadcrumbs = landingRoute?.handle?.breadcrumb?.();

      expect(breadcrumbs).toHaveLength(1);
      expect(breadcrumbs?.[0]).toEqual({
        label: 'Home',
        href: ROUTE_PATHS.LANDING,
      });
    });

    it('rec resource page breadcrumb returns home and resource', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.REC_RESOURCE_PAGE,
      );
      const breadcrumbs = recResourceRoute?.handle?.breadcrumb?.({
        resourceId: '123',
        resourceName: 'Test Resource',
      });

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs?.[0]).toEqual({
        label: 'Home',
        href: ROUTE_PATHS.LANDING,
      });
      expect(breadcrumbs?.[1]).toEqual({
        label: 'Test Resource',
        href: '/rec-resource/123',
      });
    });

    it('rec resource page breadcrumb uses resource id when name not provided', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === ROUTE_PATHS.REC_RESOURCE_PAGE,
      );
      const breadcrumbs = recResourceRoute?.handle?.breadcrumb?.({
        resourceId: '123',
      });

      expect(breadcrumbs?.[1]).toEqual({
        label: '123',
        href: '/rec-resource/123',
      });
    });

    it('rec resource page breadcrumb handles empty context', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === '/rec-resource/:id',
      );
      const breadcrumbs = recResourceRoute?.handle?.breadcrumb?.();

      expect(breadcrumbs).toHaveLength(2);
      expect(breadcrumbs?.[1]).toEqual({
        label: '',
        href: '/rec-resource/',
      });
    });

    it('files page breadcrumb returns home, resource, and files', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === '/rec-resource/:id',
      );

      const filesRoute = recResourceRoute?.children?.find(
        (route) => route.path === 'files',
      );

      const breadcrumbs = filesRoute?.handle?.breadcrumb?.({
        resourceId: '123',
        resourceName: 'Test Resource',
      });

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs?.[0]).toEqual({
        label: 'Home',
        href: ROUTE_PATHS.LANDING,
      });
      expect(breadcrumbs?.[1]).toEqual({
        label: 'Test Resource',
        href: '/rec-resource/123',
      });
      expect(breadcrumbs?.[2]).toEqual({
        label: 'Files',
        href: '/rec-resource/123/files',
      });
    });

    it('files page breadcrumb handles missing context', () => {
      const rootRoute = adminDataRouter.routes[0];
      const recResourceRoute = rootRoute.children?.find(
        (route) => route.path === '/rec-resource/:id',
      );

      const filesRoute = recResourceRoute?.children?.find(
        (route) => route.path === 'files',
      );

      const breadcrumbs = filesRoute?.handle?.breadcrumb?.();

      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs?.[2]).toEqual({
        label: 'Files',
        href: '/rec-resource//files',
      });
    });
  });
});
