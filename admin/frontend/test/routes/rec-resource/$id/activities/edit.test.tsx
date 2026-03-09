import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRoleRouteGuard = vi.fn(
  ({ children }: { children: React.ReactNode }) => <>{children}</>,
);
vi.mock('@/components/auth', () => ({
  RoleRouteGuard: (props: {
    children: React.ReactNode;
    require: string[];
    redirectTo: string;
  }) => mockRoleRouteGuard(props),
}));

vi.mock(
  '@/pages/rec-resource-page/RecResourceActivitiesFeaturesEditPage',
  () => ({
    RecResourceActivitiesFeaturesEditPage: () => (
      <div data-testid="rec-resource-activities-features-edit-page">
        Edit Activities &amp; Features Page
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

const mockParentBeforeLoad = vi.fn();
vi.mock('@/routes/rec-resource/$id', () => ({
  Route: {
    options: {
      get beforeLoad() {
        return mockParentBeforeLoad;
      },
    },
  },
}));

import { Route } from '@/routes/rec-resource/$id/activities-features/edit';
import { recResourceActivitiesFeaturesLoader } from '@/services/loaders/recResourceActivitiesFeaturesLoader';

describe('RecResourceActivitiesEditRoute', () => {
  const parentBreadcrumb = (loaderData?: {
    recResource?: { name?: string };
  }) => [
    { label: 'Home', href: '/' },
    {
      label: loaderData?.recResource?.name || 'Resource Details',
      href: '/rec-resource/test-123',
    },
  ];

  const callBeforeLoad = (params = { id: 'test-123' }, context = {}) =>
    (Route.options.beforeLoad as any)({ params, context });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Route, 'useParams').mockReturnValue({ id: 'test-123' } as any);
    mockParentBeforeLoad.mockReturnValue({
      tab: RecResourceNavKey.OVERVIEW,
      breadcrumb: parentBreadcrumb,
    });
  });

  it('should have all required route properties', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
    expect(Route.options.loader).toBe(recResourceActivitiesFeaturesLoader);
    expect(Route.options.beforeLoad).toBeDefined();
    expect(typeof Route.options.beforeLoad).toBe('function');
  });

  it('should render component with FeatureFlagRouteGuard', () => {
    const Component = Route.options.component!;
    render(<Component />);
    const guard = screen.getByTestId('feature-flag-route-guard');
    expect(guard).toHaveAttribute('data-flags', 'enable_full_features');
    expect(guard).toContainElement(
      screen.getByTestId('rec-resource-activities-features-edit-page'),
    );
  });

  it('wraps the route in an admin RoleRouteGuard with the activities redirect', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        require: ['rst-admin'],
        redirectTo: '/rec-resource/test-123/activities-features',
        children: expect.anything(),
      }),
    );
  });

  it.each([['test-123'], ['REC0001'], ['REC-ABC-123']])(
    'should set tab to ACTIVITIES for resource ID: %s',
    (id) => {
      expect(callBeforeLoad({ id }).tab).toBe(RecResourceNavKey.ACTIVITIES);
    },
  );

  it('should call parent beforeLoad with params and context', () => {
    const params = { id: 'test-123' };
    const context = { test: 'context' };
    callBeforeLoad(params, context);
    expect(mockParentBeforeLoad).toHaveBeenCalledWith({ params, context });
  });

  it.each([
    ['null', null, true],
    ['undefined', undefined, true],
    ['object without breadcrumb', { tab: RecResourceNavKey.OVERVIEW }, true],
    ['non-function breadcrumb', { breadcrumb: 'not-a-function' }, false],
  ])('should handle parent returning %s', (_, value, shouldBeEmpty) => {
    mockParentBeforeLoad.mockReturnValue(value as any);
    const result = callBeforeLoad();
    if (shouldBeEmpty) {
      expect(result.breadcrumb()).toEqual([]);
    } else {
      expect(() => result.breadcrumb()).toThrow();
    }
  });

  it('should generate complete breadcrumb with parent items and append Activities & features/Edit', () => {
    const breadcrumb = callBeforeLoad().breadcrumb({
      recResource: { name: 'Test Resource' },
    });

    expect(breadcrumb).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Test Resource', href: '/rec-resource/test-123' },
      {
        label: 'Activities & features',
        href: '/rec-resource/test-123/activities-features',
      },
      {
        label: 'Edit',
        href: '/rec-resource/test-123/activities-features/edit',
      },
    ]);
    expect(breadcrumb.slice(-2).map((b: { label: string }) => b.label)).toEqual(
      ['Activities & features', 'Edit'],
    );
  });

  it.each([
    ['undefined', undefined],
    ['empty object', {}],
    ['recResource without name', { recResource: {} }],
    ['empty name', { recResource: { name: '' } }],
  ])('should handle breadcrumb with %s loaderData', (_, loaderData) => {
    const breadcrumb = callBeforeLoad().breadcrumb(loaderData);
    expect(breadcrumb).toHaveLength(4);
    expect(breadcrumb[1]!.label).toBe('Resource Details');
  });

  it('should use params.id from beforeLoad and handle multiple calls', () => {
    const rec0001ParentBreadcrumb = (loaderData?: {
      recResource?: { name?: string };
    }) => [
      { label: 'Home', href: '/' },
      {
        label: loaderData?.recResource?.name || 'Resource',
        href: '/rec-resource/REC0001',
      },
    ];

    mockParentBeforeLoad.mockReturnValue({
      tab: RecResourceNavKey.OVERVIEW,
      breadcrumb: rec0001ParentBreadcrumb,
    });

    const result = callBeforeLoad({ id: 'REC0001' });
    const breadcrumb1 = result.breadcrumb({
      recResource: { name: 'Resource 1' },
    });
    const breadcrumb2 = result.breadcrumb({
      recResource: { name: 'Resource 2' },
    });

    expect(breadcrumb1[1]!.label).toBe('Resource 1');
    expect(breadcrumb2[1]!.label).toBe('Resource 2');
    expect(breadcrumb1[2]!.href).toBe(
      '/rec-resource/REC0001/activities-features',
    );
    expect(breadcrumb2[3]!.href).toBe(
      '/rec-resource/REC0001/activities-features/edit',
    );
  });
});
