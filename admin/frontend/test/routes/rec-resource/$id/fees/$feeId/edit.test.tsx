import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { BreadcrumbItem } from '@shared/components/breadcrumbs';
import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  const createParentBreadcrumb =
    (
      items: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Resource Details', href: '/rec-resource/REC123' },
      ],
    ) =>
    (loaderData?: any) => {
      const result = [...items];
      if (items.length > 1 && loaderData?.recResource?.name) {
        result[1] = { ...result[1]!, label: loaderData.recResource.name };
      }
      return result;
    };

  const callBeforeLoad = (
    params = { id: 'REC123', feeId: '1' },
    context = {},
  ) => (Route.options.beforeLoad as any)({ params, context });

  beforeEach(() => {
    vi.clearAllMocks();
    mockParentBeforeLoad.mockReturnValue({
      tab: RecResourceNavKey.OVERVIEW,
      breadcrumb: createParentBreadcrumb(),
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
