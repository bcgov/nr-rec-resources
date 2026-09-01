import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Route } from '@/routes/rec-resource/$id/assets/edit';
import { Route as ParentRoute } from '@/routes/rec-resource/$id/index';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

// Define explicit types for route hooks/options to avoid `never` or `Function` type errors
type BeforeLoadFn = (args: {
  params: { id: string };
  context: Record<string, unknown>;
}) => {
  tab: RecResourceNavKey;
  breadcrumb: (loaderData?: unknown) => Array<{ label: string; href: string }>;
};

type SearchFn = (search: Record<string, unknown>) => { editGroup?: string };

// Mock TanStack React Router createFileRoute
vi.mock('@tanstack/react-router', () => ({
  createFileRoute: () => (config: unknown) => ({
    options: config,
    component: (config as { component: React.ComponentType }).component,
    useParams: () => ({ id: '123' }),
  }),
}));

// Mock page and auth dependencies
vi.mock('@/pages/rec-resource-page/RecResourceAssetsEditPage', () => ({
  RecResourceAssetsEditPage: () => (
    <div data-testid="edit-page">Edit Page Content</div>
  ),
}));

vi.mock('@/components/auth', () => ({
  RoleRouteGuard: ({
    children,
    requireAll,
    redirectTo,
  }: {
    children: React.ReactNode;
    requireAll: string[];
    redirectTo: string;
  }) => (
    <div
      data-testid="role-guard"
      data-roles={JSON.stringify(requireAll)}
      data-redirect={redirectTo}
    >
      {children}
    </div>
  ),
}));

// Mock the parent route with explicit function signature for vi.fn
vi.mock('@/routes/rec-resource/$id/index', () => ({
  Route: {
    options: {
      beforeLoad: vi.fn<
        (args?: any) =>
          | {
              breadcrumb?: (
                loaderData?: unknown,
              ) => Array<{ label: string; href: string }>;
            }
          | undefined
      >(),
    },
  },
}));

describe('RecResourceAssetsEditRoute', () => {
  const validateSearch = Route.options.validateSearch as unknown as SearchFn;
  const beforeLoad = Route.options.beforeLoad as unknown as BeforeLoadFn;

  describe('Route Configuration Options', () => {
    it('should validate search params correctly when editGroup is a string', () => {
      const search = { editGroup: 'group-a', otherParam: 123 };
      const validated = validateSearch(search);

      expect(validated).toEqual({ editGroup: 'group-a' });
    });

    it('should set editGroup to undefined when editGroup is not a string', () => {
      const searchNumber = { editGroup: 123 };
      const searchEmpty = {};

      expect(validateSearch(searchNumber)).toEqual({ editGroup: undefined });
      expect(validateSearch(searchEmpty)).toEqual({ editGroup: undefined });
    });

    it('should execute beforeLoad and return tab and breadcrumbs when parent beforeLoad returns breadcrumbs', () => {
      const mockParentBreadcrumbs = [{ label: 'Parent', href: '/parent' }];

      vi.mocked(
        ParentRoute.options.beforeLoad as ReturnType<typeof vi.fn>,
      ).mockReturnValue({
        breadcrumb: () => mockParentBreadcrumbs,
      });

      const params = { id: 'resource-456' };
      const context = {};

      const result = beforeLoad({ params, context });

      expect(result.tab).toBe(RecResourceNavKey.ASSETS);

      const breadcrumbs = result.breadcrumb();
      expect(breadcrumbs).toEqual([
        { label: 'Parent', href: '/parent' },
        {
          label: 'Assets',
          href: ROUTE_PATHS.REC_RESOURCE_ASSETS.replace('$id', 'resource-456'),
        },
        {
          label: 'Edit',
          href: ROUTE_PATHS.REC_RESOURCE_ASSETS_EDIT.replace(
            '$id',
            'resource-456',
          ),
        },
      ]);
    });

    it('should return empty breadcrumb array if parent beforeLoad returns no breadcrumb function', () => {
      vi.mocked(
        ParentRoute.options.beforeLoad as ReturnType<typeof vi.fn>,
      ).mockReturnValue(undefined);

      const params = { id: 'resource-456' };
      const context = {};

      const result = beforeLoad({ params, context });

      expect(result.tab).toBe(RecResourceNavKey.ASSETS);
      expect(result.breadcrumb()).toEqual([]);
    });
  });

  describe('RecResourceAssetsEditPageRoute Component', () => {
    it('should render RoleRouteGuard with correct props and render child page', () => {
      const RouteComponent = Route.options.component as React.ComponentType;

      render(<RouteComponent />);

      const guard = screen.getByTestId('role-guard');
      expect(guard).toBeInTheDocument();
      expect(guard.getAttribute('data-redirect')).toBe(
        ROUTE_PATHS.REC_RESOURCE_ASSETS.replace('$id', '123'),
      );
      expect(JSON.parse(guard.getAttribute('data-roles') || '[]')).toEqual([
        ROLES.DEVELOPER,
        ROLES.ADMIN,
      ]);

      expect(screen.getByTestId('edit-page')).toBeInTheDocument();
    });
  });
});
