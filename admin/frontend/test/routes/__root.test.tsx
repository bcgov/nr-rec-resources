import { Route } from '@/routes/__root';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/components', () => ({
  Header: () => <div data-testid="header">Mock Header</div>,
  NotificationBar: () => (
    <div data-testid="notification-bar">Mock NotificationBar</div>
  ),
}));

vi.mock('@/components/auth', () => ({
  ViewOnlyBanner: () => (
    <div data-testid="view-only-banner">Mock ViewOnlyBanner</div>
  ),
}));

vi.mock('@/components/sidebar/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar">Mock Sidebar</div>,
}));

vi.mock('@/hooks/useIsDesktop', () => ({
  useIsDesktop: vi.fn(),
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Mock Outlet</div>,
  };
});

const mockUseIsDesktop = useIsDesktop as Mock;

describe('Root Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export a Route with a component', () => {
    expect(Route).toBeDefined();
    expect(Route.options.component).toBeDefined();
  });

  it('should be a root route', () => {
    expect(Route).toBeDefined();
    expect(typeof Route.options.component).toBe('function');
  });

  describe('RootComponent', () => {
    const RootComponent = Route.options.component!;

    it('renders only the desktop layout (with Sidebar) when useIsDesktop is true', () => {
      mockUseIsDesktop.mockReturnValue(true);

      render(<RootComponent />);

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getAllByTestId('outlet')).toHaveLength(1);
    });

    it('renders only the mobile layout (no Sidebar) when useIsDesktop is false', () => {
      mockUseIsDesktop.mockReturnValue(false);

      render(<RootComponent />);

      expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
      expect(screen.getAllByTestId('outlet')).toHaveLength(1);
    });

    it('never mounts both layouts at the same time', () => {
      mockUseIsDesktop.mockReturnValue(true);
      const { unmount } = render(<RootComponent />);
      expect(screen.getAllByTestId('outlet')).toHaveLength(1);
      unmount();

      mockUseIsDesktop.mockReturnValue(false);
      render(<RootComponent />);
      expect(screen.getAllByTestId('outlet')).toHaveLength(1);
    });

    it('renders shared chrome (Header, ViewOnlyBanner, NotificationBar) in both layouts', () => {
      mockUseIsDesktop.mockReturnValue(true);
      const { unmount } = render(<RootComponent />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('view-only-banner')).toBeInTheDocument();
      expect(screen.getByTestId('notification-bar')).toBeInTheDocument();
      unmount();

      mockUseIsDesktop.mockReturnValue(false);
      render(<RootComponent />);
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('view-only-banner')).toBeInTheDocument();
      expect(screen.getByTestId('notification-bar')).toBeInTheDocument();
    });
  });
});
