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

  it('should render RecResourceActivitiesFeaturesPage component', () => {
    const Component = Route.options.component as React.ComponentType;
    if (!Component) {
      throw new Error('Component is not defined');
    }

    render(<Component />);

    expect(
      screen.getByTestId('rec-resource-activities-features-page'),
    ).toBeInTheDocument();
  });

  it('should set correct tab in beforeLoad', () => {
    const beforeLoad = Route.options.beforeLoad;
    expect(beforeLoad).toBeDefined();

    const params = { id: 'REC123' };
    const context = {};

    const result = (beforeLoad as any)({ params, context });

    expect(result.tab).toBe(RecResourceNavKey.ACTIVITIES);
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
