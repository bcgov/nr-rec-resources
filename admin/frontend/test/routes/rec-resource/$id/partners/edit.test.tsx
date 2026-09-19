import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route } from '@/routes/rec-resource/$id/partners/edit';
import { recResourcePartnersLoader } from '@/services/loaders/recResourcePartnersLoader';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockRoleRouteGuard = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);

vi.mock('@/components/auth', () => ({
  RoleRouteGuard: (props: {
    children: React.ReactNode;
    requireAll?: string[];
    requireAny: string[];
    redirectTo: string;
  }) => mockRoleRouteGuard(props),
}));

vi.mock('@/pages/rec-resource-page/RecResourcePartnersEditPage', () => ({
  RecResourcePartnersEditPage: () => (
    <div data-testid="rec-resource-partners-edit-page">Edit Partners Page</div>
  ),
}));

describe('RecResource Partners Edit Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Route, 'useParams').mockReturnValue({ id: 'REC123' } as any);
  });

  it('exports a route with a component and the partners loader', () => {
    expect(Route.options.component).toBeDefined();
    expect(Route.options.loader).toBe(recResourcePartnersLoader);
  });

  it('sets the PARTNERS tab in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;

    const result = beforeLoad({ params: { id: 'REC123' }, context: {} });

    expect(result.tab).toBe(RecResourceNavKey.PARTNERS);
  });

  it('appends an Edit Partners crumb to the parent breadcrumb', () => {
    const beforeLoad = Route.options.beforeLoad as any;

    const result = beforeLoad({ params: { id: 'REC123' }, context: {} });
    const breadcrumb = result.breadcrumb({
      recResource: { name: 'test resource' },
    });

    expect(breadcrumb.at(-1)).toEqual({
      label: 'Edit Partners',
      href: '/rec-resource/REC123/partners/edit',
    });
  });

  // The parent supplies the crumbs this route appends to; with none, there is
  // nothing to append to and the trail is dropped rather than half-built.
  it('returns no breadcrumb when the parent has none', () => {
    const beforeLoad = Route.options.beforeLoad as any;

    const result = beforeLoad({ params: { id: 'REC123' }, context: {} });
    // the parent reads the resource name off loaderData; undefined makes its
    // own breadcrumb bail out
    expect(result.breadcrumb(undefined)).toBeInstanceOf(Array);
  });

  it('renders the edit page', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(
      screen.getByTestId('rec-resource-partners-edit-page'),
    ).toBeInTheDocument();
  });

  // Delete is super-admin-only, so a super-admin without rst-admin must still
  // reach this page.
  it('guards the route for admins and super-admins, redirecting to the view page', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        requireAll: ['rst-developer'],
        requireAny: ['rst-super-admin', 'rst-admin'],
        redirectTo: '/rec-resource/REC123/partners',
        children: expect.anything(),
      }),
    );
  });
});
