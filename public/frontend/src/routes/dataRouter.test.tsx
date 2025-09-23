import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dataRouter } from './dataRouter';
import { ROUTE_PATHS } from './constants';

// Mock all the page components
vi.mock('@/components/landing-page', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('@/components/search/SearchPage', () => ({
  default: () => <div data-testid="search-page">Search Page</div>,
}));

vi.mock('@/components/rec-resource/RecResourcePage', () => ({
  default: () => <div data-testid="rec-resource-page">Rec Resource Page</div>,
}));

vi.mock('@/components/contact-page/ContactPage', () => ({
  ContactPage: () => <div data-testid="contact-page">Contact Page</div>,
}));

vi.mock('@/components/NotFound', () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

vi.mock('@/components/alphabetical-list/AlphabeticalListPage', () => ({
  default: () => (
    <div data-testid="alphabetical-list-page">Alphabetical List Page</div>
  ),
}));

vi.mock('@/routes/RouteWrapper', () => ({
  RouteWrapper: () => <div data-testid="route-wrapper">Route Wrapper</div>,
}));

// Mock sessionStorage
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

describe('dataRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockSessionStorage.getItem.mockReset();
  });

  describe('Router Configuration', () => {
    it('should create a browser router', () => {
      expect(dataRouter).toBeDefined();
      expect(typeof dataRouter).toBe('object');
    });

    it('should have correct route structure', () => {
      const routes = dataRouter.routes;
      expect(routes).toHaveLength(1);

      const rootRoute = routes[0];
      expect(rootRoute.path).toBe('/');
      expect(rootRoute.children).toHaveLength(7);
    });

    it('should have all expected child routes', () => {
      const rootRoute = dataRouter.routes[0];
      const childPaths = rootRoute.children?.map((child) => child.path) || [];

      expect(childPaths).toContain(ROUTE_PATHS.HOME);
      expect(childPaths).toContain(ROUTE_PATHS.SEARCH);
      expect(childPaths).toContain(ROUTE_PATHS.ALPHABETICAL);
      expect(childPaths).toContain(ROUTE_PATHS.REC_RESOURCE);
      expect(childPaths).toContain(ROUTE_PATHS.CONTACT_US);
      expect(childPaths).toContain(ROUTE_PATHS.REC_RESOURCE_CONTACT);
      expect(childPaths).toContain(ROUTE_PATHS.NOT_FOUND);
    });
  });

  describe('Breadcrumb Helpers', () => {
    describe('home breadcrumb', () => {
      it('should return correct home breadcrumb structure', () => {
        const rootRoute = dataRouter.routes[0];
        const homeRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.HOME,
        );
        const breadcrumb = homeRoute?.handle?.breadcrumb?.();

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
            isCurrent: true,
          },
        ]);
      });
    });

    describe('search breadcrumb', () => {
      it('should return search breadcrumb without last search', () => {
        mockSessionStorage.getItem.mockReturnValue(null);

        const rootRoute = dataRouter.routes[0];
        const searchRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.SEARCH,
        );
        const breadcrumb = searchRoute?.handle?.breadcrumb?.();

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: ROUTE_PATHS.SEARCH,
            isCurrent: true,
          },
        ]);
      });

      it('should return search breadcrumb with last search', () => {
        mockSessionStorage.getItem.mockReturnValue('?query=test');

        const rootRoute = dataRouter.routes[0];
        const searchRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.SEARCH,
        );
        const breadcrumb = searchRoute?.handle?.breadcrumb?.();

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: `${ROUTE_PATHS.SEARCH}?query=test`,
            isCurrent: true,
          },
        ]);
      });
    });

    describe('alphabetical breadcrumb', () => {
      it('should return alphabetical breadcrumb', () => {
        const rootRoute = dataRouter.routes[0];
        const alphabeticalRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.ALPHABETICAL,
        );
        const breadcrumb = alphabeticalRoute?.handle?.breadcrumb?.();

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: ROUTE_PATHS.SEARCH,
          },
          {
            label: 'A-Z list',
            href: ROUTE_PATHS.ALPHABETICAL,
            isCurrent: true,
          },
        ]);
      });
    });

    describe('resource breadcrumb', () => {
      it('should return resource breadcrumb with name', () => {
        const rootRoute = dataRouter.routes[0];
        const resourceRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.REC_RESOURCE,
        );
        const context = { resourceId: '123', resourceName: 'Test Resource' };
        const breadcrumb = resourceRoute?.handle?.breadcrumb?.(context);

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: ROUTE_PATHS.SEARCH,
          },
          {
            label: 'Test Resource',
            href: '/resource/123',
            isCurrent: true,
          },
        ]);
      });

      it('should return resource breadcrumb without name', () => {
        const rootRoute = dataRouter.routes[0];
        const resourceRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.REC_RESOURCE,
        );
        const context = { resourceId: '123' };
        const breadcrumb = resourceRoute?.handle?.breadcrumb?.(context);

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: ROUTE_PATHS.SEARCH,
          },
          {
            label: '123',
            href: '/resource/123',
            isCurrent: true,
          },
        ]);
      });

      it('should handle empty context', () => {
        const rootRoute = dataRouter.routes[0];
        const resourceRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.REC_RESOURCE,
        );
        const breadcrumb = resourceRoute?.handle?.breadcrumb?.({} as any);

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: ROUTE_PATHS.SEARCH,
          },
          {
            label: 'Resource',
            href: '/resource/undefined',
            isCurrent: true,
          },
        ]);
      });
    });

    describe('contact breadcrumb', () => {
      it('should return contact breadcrumb', () => {
        const rootRoute = dataRouter.routes[0];
        const contactRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.CONTACT_US,
        );
        const breadcrumb = contactRoute?.handle?.breadcrumb?.();

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Contact',
            href: ROUTE_PATHS.CONTACT_US,
            isCurrent: true,
          },
        ]);
      });
    });

    describe('resource contact breadcrumb', () => {
      it('should return resource contact breadcrumb with name', () => {
        const rootRoute = dataRouter.routes[0];
        const resourceContactRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.REC_RESOURCE_CONTACT,
        );
        const context = { resourceId: '123', resourceName: 'Test Resource' };
        const breadcrumb = resourceContactRoute?.handle?.breadcrumb?.(context);

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: ROUTE_PATHS.SEARCH,
          },
          {
            label: 'Test Resource',
            href: '/resource/123',
          },
          {
            label: 'Contact',
            href: ROUTE_PATHS.CONTACT_US,
            isCurrent: true,
          },
        ]);
      });

      it('should return resource contact breadcrumb without name', () => {
        const rootRoute = dataRouter.routes[0];
        const resourceContactRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.REC_RESOURCE_CONTACT,
        );
        const context = { resourceId: '456' };
        const breadcrumb = resourceContactRoute?.handle?.breadcrumb?.(context);

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: 'Find a site or trail',
            href: ROUTE_PATHS.SEARCH,
          },
          {
            label: '456',
            href: '/resource/456',
          },
          {
            label: 'Contact',
            href: ROUTE_PATHS.CONTACT_US,
            isCurrent: true,
          },
        ]);
      });
    });

    describe('not found breadcrumb', () => {
      it('should return not found breadcrumb', () => {
        const rootRoute = dataRouter.routes[0];
        const notFoundRoute = rootRoute.children?.find(
          (child) => child.path === ROUTE_PATHS.NOT_FOUND,
        );
        const breadcrumb = notFoundRoute?.handle?.breadcrumb?.();

        expect(breadcrumb).toEqual([
          {
            label: 'Home',
            href: ROUTE_PATHS.HOME,
          },
          {
            label: '404 - Page Not Found',
            isCurrent: true,
          },
        ]);
      });
    });
  });

  describe('Route Handles', () => {
    it('should have breadcrumb handles for all routes', () => {
      const rootRoute = dataRouter.routes[0];
      const childRoutes = rootRoute.children || [];

      childRoutes.forEach((route) => {
        expect(route.handle).toBeDefined();
        expect(route.handle?.breadcrumb).toBeDefined();
        expect(typeof route.handle?.breadcrumb).toBe('function');
      });
    });
  });

  describe('Session Storage Integration', () => {
    it('should call sessionStorage.getItem for search breadcrumb', () => {
      const rootRoute = dataRouter.routes[0];
      const searchRoute = rootRoute.children?.find(
        (child) => child.path === ROUTE_PATHS.SEARCH,
      );

      searchRoute?.handle?.breadcrumb?.();

      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('lastSearch');
    });
  });
});
