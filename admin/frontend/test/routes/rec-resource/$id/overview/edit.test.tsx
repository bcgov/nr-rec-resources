import { Route } from '@/routes/rec-resource/$id/overview/edit';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockRoleRouteGuard = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);

vi.mock('@/components/auth', () => ({
  RoleRouteGuard: (props: {
    children: React.ReactNode;
    requireAll: string[];
    redirectTo: string;
  }) => mockRoleRouteGuard(props),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceOverviewSection',
  () => ({
    RecResourceOverviewEditSection: () => (
      <div data-testid="rec-resource-overview-edit-section">
        Overview Edit Page
      </div>
    ),
  }),
);

describe('RecResource Overview Edit Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Route, 'useParams').mockReturnValue({ id: 'REC123' } as any);
  });

  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader set to recResourceLoader', () => {
    expect(Route.options.loader).toBe(recResourceLoader);
  });

  it('should set tab to OVERVIEW in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.OVERVIEW);
  });

  it('should generate breadcrumbs', () => {
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
      label: 'Edit Overview',
      href: '/rec-resource/REC123/overview/edit',
    });
  });

  it('renders the edit section inside RoleRouteGuard', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(
      screen.getByTestId('rec-resource-overview-edit-section'),
    ).toBeInTheDocument();
  });

  it('wraps the route in an admin RoleRouteGuard with the overview redirect', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        requireAll: ['rst-developer', 'rst-admin'],
        redirectTo: '/rec-resource/REC123/overview',
        children: expect.anything(),
      }),
    );
  });
});
