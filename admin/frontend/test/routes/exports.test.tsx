import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('@/pages/exports-page/ExportsPage', () => ({
  ExportsPage: () => <div data-testid="exports-page" />,
}));

import { Route } from '@/routes/exports';

describe('Exports Route', () => {
  it('exports a route with a component and beforeLoad handler', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
    expect(Route.options.beforeLoad).toBeDefined();
  });

  it('renders the exports route component', () => {
    const Component = Route.options.component as () => JSX.Element;

    render(<Component />);

    expect(screen.getByTestId('exports-page')).toBeInTheDocument();
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
        label: 'Data export',
        href: '/exports',
      },
    ]);
  });
});
