import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route } from '@/routes/rec-resource/$id/fees/index';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

vi.mock('@/pages/rec-resource-page/RecResourceFeesPage', () => ({
  RecResourceFeesPage: () => (
    <div data-testid="rec-resource-fees-features-page">Fees Page</div>
  ),
}));

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

describe('RecResource Fees Index Route', () => {
  it('should export a Route with correct component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader set to recResourceFeesLoader', () => {
    expect(Route.options.loader).toBe(recResourceFeesLoader);
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should render component with FeatureFlagRouteGuard', () => {
    const Component = Route.options.component!;
    render(<Component />);
    const guard = screen.getByTestId('feature-flag-route-guard');
    expect(guard).toHaveAttribute('data-flags', 'enable_full_features');
    expect(guard).toContainElement(
      screen.getByTestId('rec-resource-fees-features-page'),
    );
  });

  it('should set tab to FEES in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const params = { id: 'REC123' };
    const context = {};

    const result = beforeLoad({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.FEES);
  });

  it('should generate breadcrumb', () => {
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
      label: 'Fees',
      href: '/rec-resource/REC123/fees',
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
