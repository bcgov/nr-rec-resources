import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/pages/create-new-page/CreateNewPage', () => ({
  CreateNewPage: () => <div data-testid="create-new-page" />,
}));

vi.mock('@/components/auth', () => ({
  RoleRouteGuard: ({ children }: any) => children,
}));

import { Route } from '@/routes/create-new';

describe('Create New Route', () => {
  it('exports a route with a component and beforeLoad handler', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('renders the create new route component', () => {
    const Component = Route.options.component as () => any;

    render(<Component />);

    expect(screen.getByTestId('create-new-page')).toBeInTheDocument();
  });

  it('generates the expected breadcrumbs', () => {
    const beforeLoad = Route.options.beforeLoad as () => {
      breadcrumb: () => Array<{ label: string; href: string }>;
    };
    const result = beforeLoad();

    expect(result.breadcrumb()).toEqual([
      {
        label: 'Home',
        href: '/',
      },
      {
        label: 'Create new',
        href: '/create-new',
      },
    ]);
  });
});
