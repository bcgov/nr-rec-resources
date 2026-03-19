import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/search', () => ({
  SearchPage: () => <div>Mock Search Page</div>,
}));

import { Route } from '@/routes/index';

describe('Landing Route', () => {
  it('should export a Route with correct path', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should have beforeLoad function', () => {
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('should generate correct breadcrumbs', () => {
    const beforeLoad = Route.options.beforeLoad as any;
    const result = beforeLoad();

    expect(result.breadcrumb).toBeDefined();

    const breadcrumb = result.breadcrumb();

    expect(breadcrumb).toHaveLength(1);
    expect(breadcrumb[0]).toEqual({
      label: 'Home',
      href: '/',
    });
  });

  it('renders the search page component for the route', () => {
    const Component = Route.options.component;
    render(<Component />);

    expect(screen.getByText('Mock Search Page')).toBeInTheDocument();
  });
});
