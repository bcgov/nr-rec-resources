import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { EXTERNAL_LINKS } from '@/constants/menu-options';

// 1. Mock TanStack Router's Link component
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, className }: any) => (
    <a href={to} className={className} data-testid="tanstack-link">
      {children}
    </a>
  ),
}));

// 2. Mock SidebarTooltip to cleanly render children without extra bootstrap overlay noise
vi.mock('./SidebarToolTip', () => ({
  default: ({ children, text, isCollapsed }: any) => (
    <div
      data-testid="sidebar-tooltip"
      data-text={text}
      data-collapsed={isCollapsed}
    >
      {children}
    </div>
  ),
}));

describe('Sidebar Component', () => {
  // --- FIXED: Updated test name and assertions to reflect initial collapsed state ---
  it('renders correctly in default collapsed state and applies custom className', () => {
    render(<Sidebar className="custom-class" />);

    // Check if the sidebar container has both default, custom, and collapsed classes
    const asideElement = screen.getByRole('complementary'); // aside tag
    expect(asideElement).toHaveClass('sidebar', 'custom-class', 'collapsed');

    // Due to {!isCollapsed && ...}, text should NOT be visible initially
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    expect(screen.queryByText('Advisories & Closures')).not.toBeInTheDocument();
    expect(screen.queryByText('Onboarding')).not.toBeInTheDocument();
    expect(screen.queryByText('FTA')).not.toBeInTheDocument();

    // Verify "Quick Links" is replaced by an <hr /> separator in collapsed state
    expect(screen.queryByText(/Quick Links/i)).not.toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument(); // catches <hr />

    // Check for default Expand Icon (since it's collapsed)
    const toggleImg = screen.getByAltText('Expand Icon');
    expect(toggleImg).toBeInTheDocument();
    expect(toggleImg).toHaveAttribute('src', '/images/sidebar/expand-icon.svg');
  });

  // --- FIXED: Swapped click expectations to track expanding first, then collapsing ---
  it('toggles to expanded state when the toggle button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const asideElement = screen.getByRole('complementary');
    const toggleButton = screen.getByRole('button');

    // Initial state check
    expect(asideElement).toHaveClass('collapsed');

    // Click to EXPAND
    await user.click(toggleButton);

    // Verify container class updates (removes 'collapsed')
    expect(asideElement).not.toHaveClass('collapsed');

    // Verify text labels are now visible
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Advisories & Closures')).toBeInTheDocument();
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('FTA')).toBeInTheDocument();

    // Check for "Quick Links" subtitle and that <hr /> is removed
    expect(screen.getByText(/Quick Links/i)).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();

    // Verify the icon switches to the Collapse Icon
    const toggleImg = screen.getByAltText('Collapse Icon');
    expect(toggleImg).toBeInTheDocument();
    expect(toggleImg).toHaveAttribute(
      'src',
      '/images/sidebar/collapse-icon.svg',
    );

    // Click again to COLLAPSE and verify it switches back
    await user.click(toggleButton);
    expect(asideElement).toHaveClass('collapsed');
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });

  it('renders all external link href values correctly matching the data layer', () => {
    render(<Sidebar />);

    // Since the text is hidden under !isCollapsed, we search by role using hidden: true
    const onboardingLink = screen.getByRole('link', {
      name: /onboarding/i,
      hidden: true,
    });
    const ftaLink = screen.getByRole('link', { name: /fta/i, hidden: true });

    expect(onboardingLink).toHaveAttribute('href', EXTERNAL_LINKS.ONBOARDING);
    expect(ftaLink).toHaveAttribute('href', EXTERNAL_LINKS.FTA);
  });
});
