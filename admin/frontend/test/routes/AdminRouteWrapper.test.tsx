import { AdminRouteWrapper } from '@/routes/AdminRouteWrapper';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock components
vi.mock('@/components', () => ({
  Header: () => <header data-testid="header">Header</header>,
  NotificationBar: () => (
    <div data-testid="notification-bar">NotificationBar</div>
  ),
}));

// Mock React Router Outlet and useSearchParams
vi.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet">Page Content</div>,
  useSearchParams: () => [new URLSearchParams()],
}));

describe('AdminRouteWrapper', () => {
  it('renders header, notification bar, and main content', () => {
    render(<AdminRouteWrapper />);

    // Check that all components are rendered
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('notification-bar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();

    // Check main element exists with correct id
    const mainElement = screen.getByRole('main');
    expect(mainElement).toBeInTheDocument();
    expect(mainElement).toHaveAttribute('id', 'main-content');
  });

  it('has correct component structure', () => {
    render(<AdminRouteWrapper />);

    const container = screen.getByTestId('header').parentElement;
    expect(container?.children).toHaveLength(3); // Header, NotificationBar, main

    // Verify order: Header first, NotificationBar second, main third
    expect(container?.children[0]).toEqual(screen.getByTestId('header'));
    expect(container?.children[1]).toEqual(
      screen.getByTestId('notification-bar'),
    );
    expect(container?.children[2]).toEqual(screen.getByRole('main'));
  });

  it('renders outlet inside main content', () => {
    render(<AdminRouteWrapper />);

    const mainElement = screen.getByRole('main');
    const outlet = screen.getByTestId('outlet');

    expect(mainElement).toContainElement(outlet);
  });
});
