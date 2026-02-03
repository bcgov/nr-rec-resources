import { Route as EditRoute } from '@/routes/rec-resource/$id/reservation/edit';
import { Route as IndexRoute } from '@/routes/rec-resource/$id/reservation';
import { recResourceReservationLoader } from '@/services/loaders/recResourceReservationLoader';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

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

vi.mock('@/contexts/feature-flags', () => ({
  FeatureFlagRouteGuard: ({
    children,
    requiredFlags,
  }: {
    children: React.ReactNode;
    requiredFlags: string[];
  }) => (
    <div
      data-testid="feature-flag-route-guard"
      data-flags={requiredFlags.join(',')}
    >
      {children}
    </div>
  ),
}));

describe('RecResource Reservation Edit Route', () => {
  it('should render component with FeatureFlagRouteGuard', () => {
    const Component = EditRoute.options.component!;
    render(<Component />);
    const guard = screen.getByTestId('feature-flag-route-guard');
    expect(guard).toHaveAttribute('data-flags', 'enable_full_features');
    expect(guard).toContainElement(
      screen.getByTestId('rec-resource-reservation-edit-section'),
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
