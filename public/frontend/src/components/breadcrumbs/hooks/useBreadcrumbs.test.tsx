import { renderHook } from '@testing-library/react';
import { useBreadcrumbs } from './useBreadcrumbs';
import { breadcrumbStore } from '../store/breadcrumbStore';
import {
  createMemoryRouter,
  RouterProvider,
  RouteObject,
} from 'react-router-dom';

describe('useBreadcrumbs hook (data router)', () => {
  beforeEach(() => {
    breadcrumbStore.setState({ items: [], previousRoute: undefined });
  });

  function getRouter(routes: RouteObject[], initialEntries = ['/']) {
    return createMemoryRouter(routes, { initialEntries });
  }

  it('sets customItems as breadcrumbs when provided', () => {
    const customItems = [
      { label: 'Custom', href: '/custom' },
      { label: 'Current', isCurrent: true },
    ];
    const Test = () => {
      useBreadcrumbs({ customItems });
      return null;
    };
    const router = getRouter([{ path: '/', element: <Test /> }]);
    renderHook(() => {}, {
      wrapper: ({ children }) => (
        <RouterProvider router={router}>{children}</RouterProvider>
      ),
    });
    expect(breadcrumbStore.state.items).toEqual(customItems);
  });

  it('autoGenerate=false does not set breadcrumbs', () => {
    const customItems = [{ label: 'Custom', href: '/custom' }];
    const Test = () => {
      useBreadcrumbs({ customItems, autoGenerate: false });
      return null;
    };
    const router = getRouter([{ path: '/', element: <Test /> }]);
    renderHook(() => {}, {
      wrapper: ({ children }) => (
        <RouterProvider router={router}>{children}</RouterProvider>
      ),
    });
    expect(breadcrumbStore.state.items).toEqual([]);
  });

  it('calls handle.breadcrumb if present in route match', () => {
    const handle = {
      breadcrumb: () => [{ label: 'FromHandle', isCurrent: true }],
    };
    const Test = () => {
      useBreadcrumbs();
      return null;
    };
    const router = getRouter([{ path: '/', element: <Test />, handle }]);
    renderHook(() => {}, {
      wrapper: ({ children }) => (
        <RouterProvider router={router}>{children}</RouterProvider>
      ),
    });
    expect(breadcrumbStore.state.items).toEqual([
      { label: 'FromHandle', isCurrent: true },
    ]);
  });

  it('updates breadcrumbs when context changes', () => {
    const handle = {
      breadcrumb: (ctx: any) => [
        { label: ctx?.label || 'Default', isCurrent: true },
      ],
    };
    const context = { label: 'Dynamic' };
    const Test = (props: any) => {
      useBreadcrumbs({ context: props.context });
      return null;
    };
    const router = getRouter([
      { path: '/', element: <Test context={context} />, handle },
    ]);
    renderHook(() => {}, {
      wrapper: ({ children }) => (
        <RouterProvider router={router}>{children}</RouterProvider>
      ),
    });
    expect(breadcrumbStore.state.items).toEqual([
      { label: 'Dynamic', isCurrent: true },
    ]);
  });
});
