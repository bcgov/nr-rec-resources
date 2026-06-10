import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { EXTERNAL_LINKS } from '@/components/sidebar/SidebarLinks';

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
  it('renders correctly in default expanded state and applies custom className', () => {
    render(<Sidebar className="custom-class" />);

    // Check if the sidebar container has both default and custom classes
    const asideElement = screen.getByRole('complementary'); // aside tag
    expect(asideElement).toHaveClass('sidebar', 'custom-class');
    expect(asideElement).not.toHaveClass('collapsed');

    // Check if the menu links and external links are rendering text
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Advisories & Closures')).toBeInTheDocument();
    expect(screen.getByText('Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();

    // Check for "Quick Links" subtitle and FontAwesome icon container
    expect(screen.getByText(/Quick Links/i)).toBeInTheDocument();
    expect(screen.queryByRole('separator')).not.toBeInTheDocument(); // hr should not exist

    // Check for default collapse icon
    const toggleImg = screen.getByAltText('Collapse Icon');
    expect(toggleImg).toBeInTheDocument();
    expect(toggleImg).toHaveAttribute(
      'src',
      '/images/sidebar/collapse-icon.svg',
    );
  });

  it('toggles to collapsed state when the collapse button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const asideElement = screen.getByRole('complementary');
    const toggleButton = screen.getByRole('button');

    // Click to collapse
    await user.click(toggleButton);

    // Verify container class updates
    expect(asideElement).toHaveClass('collapsed');

    // Verify text labels are hidden (due to {!isCollapsed && ...})
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
    expect(screen.queryByText('Advisories & Closures')).not.toBeInTheDocument();
    expect(screen.queryByText('Onboarding')).not.toBeInTheDocument();
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument();

    // Verify "Quick Links" is replaced by an <hr /> separator
    expect(screen.queryByText(/Quick Links/i)).not.toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument(); // catches <hr />

    // Verify the icon switches to the Expand Icon
    const toggleImg = screen.getByAltText('Expand Icon');
    expect(toggleImg).toBeInTheDocument();
    expect(toggleImg).toHaveAttribute('src', '/images/sidebar/expand-icon.svg');

    // Click again to uncollapse and verify it switches back (hits the state setter toggle path)
    await user.click(toggleButton);
    expect(asideElement).not.toHaveClass('collapsed');
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders all external link href values correctly matching the data layer', () => {
    render(<Sidebar />);

    const advisoriesLink = screen.getByRole('link', { name: /advisories/i });
    const onboardingLink = screen.getByRole('link', { name: /onboarding/i });
    const feedbackLink = screen.getByRole('link', { name: /feedback/i });

    // Assert against the actual data objects instead of hardcoded mock strings
    expect(advisoriesLink).toHaveAttribute(
      'href',
      EXTERNAL_LINKS.ADVISORIES_TOOL,
    );
    expect(onboardingLink).toHaveAttribute('href', EXTERNAL_LINKS.ONBOARDING);
    expect(feedbackLink).toHaveAttribute('href', EXTERNAL_LINKS.FEEDBACK_FORM);

    expect(advisoriesLink).toHaveAttribute('target', '_blank');
    expect(advisoriesLink).toHaveAttribute('rel', 'noreferrer');
  });
});
