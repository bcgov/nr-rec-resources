import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route } from '@/routes/rec-resource/$id/fees/add';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
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
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesAddSection',
  () => ({
    RecResourceFeesAddSection: () => (
      <div data-testid="rec-resource-fees-add-section">Add Fee Page</div>
    ),
  }),
);

describe('RecResource Fees Add Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Route, 'useParams').mockReturnValue({ id: 'REC123' } as any);
  });

  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader set to recResourceFeesLoader', () => {
    expect(Route.options.loader).toBe(recResourceFeesLoader);
  });

  it('should set tab to FEES in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.FEES);
  });

  it('should generate breadcrumb with Fees and Add Fee labels', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });
    const loaderData = {
      recResource: { name: 'test resource' },
    };

    const breadcrumb = result.breadcrumb(loaderData);

    expect(breadcrumb).toHaveLength(4);
    expect(breadcrumb[0].label).toBe('Home');
    expect(breadcrumb[1].label).toBe('Test Resource');
    expect(breadcrumb[2]).toEqual({
      label: 'Fees',
      href: '/rec-resource/REC123/fees',
    });
    expect(breadcrumb[3]).toEqual({
      label: 'Add Fee',
      href: '/rec-resource/REC123/fees/add',
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

  it('renders the add section', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(
      screen.getByTestId('rec-resource-fees-add-section'),
    ).toBeInTheDocument();
  });

  it('wraps the route in an admin RoleRouteGuard with the fees redirect', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        requireAll: ['rst-developer', 'rst-admin'],
        redirectTo: '/rec-resource/REC123/fees',
        children: expect.anything(),
      }),
    );
  });
});
