import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { Route } from '@/routes/rec-resource/$id/activities-features/index';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/rec-resource-page/RecResourceActivitiesFeaturesPage', () => ({
  RecResourceActivitiesFeaturesPage: () => (
    <div data-testid="rec-resource-activities-features-page">
      Activities &amp; Features Page
    </div>
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

describe('RecResourceActivitiesRoute', () => {
  it('should export a Route with a component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have loader configured', () => {
    expect(Route.options.loader).toBeDefined();
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
      screen.getByTestId('rec-resource-activities-features-page'),
    );
  });

  it('should set correct tab in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad;
    expect(beforeLoad).toBeDefined();

    const params = { id: 'REC123' };
    const context = {};

    const result = (beforeLoad as any)({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.ACTIVITIES);
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
      label: 'Activities & features',
      href: '/rec-resource/REC123/activities-features',
    });
  });

  it('should return tab in beforeLoad result', () => {
    const beforeLoad = Route.options.beforeLoad;
    expect(beforeLoad).toBeDefined();

    const params = { id: 'REC123' };
    const context = {};

    const result = (beforeLoad as any)({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.ACTIVITIES);
    expect(result.breadcrumb).toBeDefined();
  });
});
