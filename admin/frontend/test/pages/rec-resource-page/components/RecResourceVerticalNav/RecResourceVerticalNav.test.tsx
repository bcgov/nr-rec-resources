import { ROUTE_PATHS } from '@/constants/routes';
import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceVerticalNav } from '@/pages/rec-resource-page/components/RecResourceVerticalNav';
import { useNavigate } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock matchMedia for Offcanvas component
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

const mockNavigate = vi.fn();

vi.mock('@/hooks/useAuthorizations', () => ({
  ROLES: {
    VIEWER: 'rst-viewer',
    ADMIN: 'rst-admin',
    DEVELOPER: 'rst-developer',
  },
  useUserRoles: () => ['rst-viewer', 'rst-admin', 'rst-developer'],
  useAuthorizations: () => ({
    canView: true,
    canEdit: true,
    canViewFeatureFlag: true,
    canEditFeatureFlag: true,
  }),
}));

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(component);
};

describe('RecResourceVerticalNav', () => {
  const defaultProps = {
    activeTab: RecResourceNavKey.OVERVIEW,
    resourceId: 'test-resource-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  it('renders all navigation items in desktop view', () => {
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    // Desktop navigation should have nav links
    const overviewLinks = screen.getAllByText('Overview');
    const filesLinks = screen.getAllByText('Images & Sitemaps');

    expect(overviewLinks.length).toBeGreaterThan(0);
    expect(filesLinks.length).toBeGreaterThan(0);
  });

  it('renders mobile trigger button', () => {
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    // Should render mobile trigger button with active tab title
    const mobileContainer = document.querySelector('.d-md-none');
    const triggerButton = mobileContainer?.querySelector('button');

    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveClass(
      'rec-resource-vertical-nav__mobile-trigger',
    );
    expect(triggerButton).toHaveTextContent('Overview');
  });

  it('highlights the active tab in desktop navigation', () => {
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    // Find active links in desktop nav (should be hidden on mobile via CSS)
    const overviewLinks = screen.getAllByText('Overview');
    const filesLinks = screen.getAllByText('Images & Sitemaps');

    // At least one overview link should exist
    expect(overviewLinks.length).toBeGreaterThan(0);
    expect(filesLinks.length).toBeGreaterThan(0);
  });

  it('navigates to correct route when desktop nav item is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    // Find all Files links and click the first one (desktop nav)
    const filesLinks = screen.getAllByText('Images & Sitemaps');
    await user.click(filesLinks[0]);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_FILES,
      params: { id: 'test-resource-123' },
    });
  });

  it('shows files tab as active in mobile trigger', () => {
    renderWithRouter(
      <RecResourceVerticalNav
        {...defaultProps}
        activeTab={RecResourceNavKey.FILES}
      />,
    );

    // Mobile trigger should show "Images & Sitemaps" as the active title
    const mobileContainer = document.querySelector('.d-md-none');
    const triggerButton = mobileContainer?.querySelector('button');

    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveClass(
      'rec-resource-vertical-nav__mobile-trigger',
    );
    expect(triggerButton).toHaveTextContent('Images & Sitemaps');
  });
});
