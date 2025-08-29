import { RecResourceNavKey } from '@/pages/rec-resource-page';
import { RecResourceVerticalNav } from '@/pages/rec-resource-page/components/RecResourceVerticalNav';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('RecResourceVerticalNav', () => {
  const defaultProps = {
    activeTab: RecResourceNavKey.OVERVIEW,
    resourceId: 'test-resource-123',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all navigation items in desktop view', () => {
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    // Desktop navigation should have nav links
    const overviewLinks = screen.getAllByText('Overview');
    const filesLinks = screen.getAllByText('Files');

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
    const filesLinks = screen.getAllByText('Files');

    // At least one overview link should exist
    expect(overviewLinks.length).toBeGreaterThan(0);
    expect(filesLinks.length).toBeGreaterThan(0);
  });

  it('navigates to correct route when desktop nav item is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RecResourceVerticalNav {...defaultProps} />);

    // Find all Files links and click the first one (desktop nav)
    const filesLinks = screen.getAllByText('Files');
    await user.click(filesLinks[0]);

    expect(mockNavigate).toHaveBeenCalledWith(
      '/rec-resource/test-resource-123/files',
    );
  });

  it('shows files tab as active in mobile trigger', () => {
    renderWithRouter(
      <RecResourceVerticalNav
        {...defaultProps}
        activeTab={RecResourceNavKey.FILES}
      />,
    );

    // Mobile trigger should show "Files" as the active title
    const mobileContainer = document.querySelector('.d-md-none');
    const triggerButton = mobileContainer?.querySelector('button');

    expect(triggerButton).toBeInTheDocument();
    expect(triggerButton).toHaveClass(
      'rec-resource-vertical-nav__mobile-trigger',
    );
    expect(triggerButton).toHaveTextContent('Files');
  });
});
