import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route } from '@/routes/rec-resource/$id/assets/index';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/rec-resource-page/RecResourceAssetsPage', () => ({
  RecResourceAssetsPage: () => (
    <div data-testid="rec-resource-assets-page">Assets Page</div>
  ),
}));

const mockRoleRouteGuard = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);
vi.mock('@/components/auth', () => ({
  RoleRouteGuard: (props: {
    children: React.ReactNode;
    requireAll: string[];
    requireAny: string[];
    redirectTo: string;
  }) => mockRoleRouteGuard(props),
}));

describe('RecResource Assets Index Route', () => {
  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should render component with RoleRouteGuard', () => {
    vi.spyOn(Route, 'useParams').mockReturnValue({ id: 'REC123' } as any);

    const Component = Route.options.component!;
    render(<Component />);

    expect(screen.getByTestId('rec-resource-assets-page')).toBeInTheDocument();
    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        requireAll: ['rst-developer'],
        requireAny: ['rst-viewer', 'rst-admin'],
        redirectTo: '/rec-resource/REC123/files',
        children: expect.anything(),
      }),
    );
  });

  it('should set tab to ASSETS in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.ASSETS);
  });

  it('should generate breadcrumb from parent breadcrumb', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });
    const loaderData = {
      recResource: { name: 'test resource' },
    };

    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb).toHaveLength(3);
    expect(breadcrumb[0].label).toBe('Home');
    expect(breadcrumb[1].label).toBe('Test Resource');
    expect(breadcrumb[2]).toEqual({
      label: 'Assets',
      href: '/rec-resource/REC123/assets',
    });
  });

  it('should return empty breadcrumb when parent beforeLoad has no breadcrumb', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.breadcrumb).toBeDefined();
    expect(typeof result.breadcrumb).toBe('function');
  });
});
