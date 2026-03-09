import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRoleRouteGuard = vi.fn(({ children }: { children: ReactNode }) => (
  <>{children}</>
));
vi.mock('@/components/auth', () => ({
  RoleRouteGuard: (props: {
    children: ReactNode;
    require: string[];
    redirectTo: string;
  }) => mockRoleRouteGuard(props),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesEditSection',
  () => ({
    RecResourceFeesEditSection: () => (
      <div data-testid="rec-resource-fees-edit-section">Edit Fees</div>
    ),
  }),
);

vi.mock('@/contexts/feature-flags', () => ({
  FeatureFlagRouteGuard: ({
    children,
    requiredFlags,
  }: {
    children: ReactNode;
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

import { Route } from '@/routes/rec-resource/$id/fees/$feeId/edit';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';

describe('RecResource Fees FeeId Edit Route', () => {
  const parentBreadcrumb = (loaderData?: {
    recResource?: { name?: string };
  }) => [
    { label: 'Home', href: '/' },
    {
      label: loaderData?.recResource?.name || 'Resource Details',
      href: '/rec-resource/REC123',
    },
  ];

  const callBeforeLoad = (
    params = { id: 'REC123', feeId: '1' },
    context = {},
  ) => (Route.options.beforeLoad as any)({ params, context });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Route, 'useParams').mockReturnValue({
      id: 'REC123',
      feeId: '1',
    } as any);
    mockParentBeforeLoad.mockReturnValue({
      tab: RecResourceNavKey.OVERVIEW,
      breadcrumb: parentBreadcrumb,
    });
  });

  it('should have all required route properties', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
    expect(Route.options.loader).toBe(recResourceFeesLoader);
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('renders component with FeatureFlagRouteGuard', () => {
    const Component = Route.options.component!;
    render(<Component />);
    const guard = screen.getByTestId('feature-flag-route-guard');
    expect(guard).toHaveAttribute('data-flags', 'enable_full_features');
    expect(guard).toContainElement(
      screen.getByTestId('rec-resource-fees-edit-section'),
    );
  });

  it('wraps the route in an admin RoleRouteGuard with the fees redirect', () => {
    const Component = Route.options.component!;
    render(<Component />);

    expect(mockRoleRouteGuard).toHaveBeenCalledWith(
      expect.objectContaining({
        require: ['rst-admin'],
        redirectTo: '/rec-resource/REC123/fees',
        children: expect.anything(),
      }),
    );
  });

  it('should set tab to FEES in beforeLoad', () => {
    expect(callBeforeLoad().tab).toBe(RecResourceNavKey.FEES);
  });

  it('should generate breadcrumb with Fees and Edit Fee labels', () => {
    const breadcrumb = callBeforeLoad().breadcrumb({
      recResource: { name: 'Test Resource' },
    });

    expect(breadcrumb).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Test Resource', href: '/rec-resource/REC123' },
      { label: 'Fees', href: '/rec-resource/REC123/fees' },
      { label: 'Edit Fee', href: '/rec-resource/REC123/fees/1/edit' },
    ]);
  });
});
