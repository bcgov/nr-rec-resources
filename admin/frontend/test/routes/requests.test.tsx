import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ROLES } from '@/hooks/useAuthorizations';

vi.mock('@/pages/requests-page/RequestsPage', () => ({
  RequestsPage: () => <div data-testid="requests-page" />,
}));

vi.mock('@/components/auth', () => ({
  RoleRouteGuard: ({ children, requireAny, redirectTo }: any) => (
    <div
      data-testid="role-route-guard"
      data-require-any={JSON.stringify(requireAny)}
      data-redirect-to={redirectTo}
    >
      {children}
    </div>
  ),
}));

import { Route } from '@/routes/requests';

describe('Requests Route', () => {
  it('exports a route with a component and beforeLoad handler', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('renders the requests route component behind the guard', () => {
    const Component = Route.options.component as () => JSX.Element;

    render(<Component />);

    expect(screen.getByTestId('role-route-guard')).toHaveAttribute(
      'data-require-any',
      JSON.stringify([ROLES.SUPER_ADMIN]),
    );
    expect(screen.getByTestId('role-route-guard')).toHaveAttribute(
      'data-redirect-to',
      '/',
    );
    expect(screen.getByTestId('requests-page')).toBeInTheDocument();
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
        label: 'Requests',
        href: '/requests',
      },
    ]);
  });
});
