import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Route } from '@/routes/rec-resource/$id/assets/edit';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route as ParentRoute } from '@/routes/rec-resource/$id';
import { ROLES } from '@/hooks/useAuthorizations';
import { ROUTE_PATHS } from '@/constants/routes';

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

// Mock parent route file directly
vi.mock('@/routes/rec-resource/$id', () => ({
  Route: {
    options: {
      beforeLoad: vi.fn(),
    },
  },
}));

describe('RecResourceAssetsEditRoute', () => {
  const validateSearch = Route.options.validateSearch as unknown as SearchFn;

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

      // Mock ParentRoute.options.beforeLoad return value BEFORE calling beforeLoad
      vi.mocked(ParentRoute.options.beforeLoad as any).mockReturnValueOnce({
        breadcrumb: () => mockParentBreadcrumbs,
      });

      const beforeLoadFn = Route.options.beforeLoad as any;
      const result = beforeLoadFn({
        params: { id: 'resource-456' },
        context: {},
      });

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

    it('should return empty breadcrumb array if parent beforeLoad returns undefined or has no breadcrumb function', () => {
      // Mock ParentRoute.options.beforeLoad to return undefined
      vi.mocked(ParentRoute.options.beforeLoad as any).mockReturnValueOnce(
        undefined,
      );

      const beforeLoadFn = Route.options.beforeLoad as any;
      const result = beforeLoadFn({
        params: { id: 'resource-456' },
        context: {},
      });

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
