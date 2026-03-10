import { Route as EditRoute } from '@/routes/rec-resource/$id/reservation/edit';
import { Route as IndexRoute } from '@/routes/rec-resource/$id/reservation';
import { recResourceReservationLoader } from '@/services/loaders/recResourceReservationLoader';
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
  '@/pages/rec-resource-page/components/RecResourceReservationSection',
  () => ({
    RecResourceReservationEditSection: () => (
      <div data-testid="rec-resource-reservation-edit-section">
        Reservation Features Page
      </div>
    ),
  }),
);

describe('RecResource Reservation Edit Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(EditRoute, 'useParams').mockReturnValue({ id: 'REC123' } as any);
  });

  it('should render component within RoleRouteGuard', () => {
    const Component = EditRoute.options.component!;
    render(<Component />);
    expect(
      screen.getByTestId('rec-resource-reservation-edit-section'),
    ).toBeInTheDocument();
  });

  it('wraps the route in an admin RoleRouteGuard with the reservation redirect', () => {
    const Component = EditRoute.options.component!;
    render(<Component />);

    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        requireAll: ['rst-developer', 'rst-admin'],
        redirectTo: '/rec-resource/REC123/reservation',
        children: expect.anything(),
      }),
    );
  });

  it('should export a Route with correct component', () => {
    expect(EditRoute).toBeDefined();
    expect(EditRoute.options.component).toBeDefined();
  });

  it('should have loader set to recResourceReservationLoader', () => {
    expect(EditRoute.options.loader).toBe(recResourceReservationLoader);
  });

  it('should have beforeLoad function', () => {
    expect(EditRoute.options.beforeLoad).toBeDefined();
  });

  it('should set tab to RESERVATION in beforeLoad', () => {
    const beforeLoad = EditRoute.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.RESERVATION);
  });

  it('should generate breadcrumbs', () => {
    const beforeLoad = EditRoute.options.beforeLoad as any;
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
      label: 'Edit Reservation',
      href: '/rec-resource/REC123/reservation/edit',
    });
  });
});

describe('RecResource Reservation Index Route', () => {
  it('should export a Route with correct component', () => {
    expect(IndexRoute).toBeDefined();
    expect(IndexRoute.options.component).toBeDefined();
  });

  it('should have loader set to recResourceReservationLoader', () => {
    expect(IndexRoute.options.loader).toBe(recResourceReservationLoader);
  });

  it('should have beforeLoad function', () => {
    expect(IndexRoute.options.beforeLoad).toBeDefined();
  });

  it('should set tab to RESERVATION in beforeLoad', () => {
    const beforeLoad = IndexRoute.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.RESERVATION);
  });

  it('should generate breadcrumbs', () => {
    const beforeLoad = IndexRoute.options.beforeLoad as any;
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
      label: 'Reservation',
      href: '/rec-resource/REC123/reservation',
    });
  });
});
