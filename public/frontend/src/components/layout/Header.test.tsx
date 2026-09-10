import { screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '@/test-utils';
import Header from '@/components/layout/Header';
import { HEADER_LINKS } from '@/components/layout/constants';

vi.mock('@shared/utils', () => ({
  trackClickEvent: vi.fn(() => vi.fn()),
}));

vi.mock('@shared/components/environment-banner', () => ({
  EnvironmentBanner: () => (
    <div data-testid="environment-banner">Environment Banner</div>
  ),
}));

import { trackClickEvent } from '@shared/utils';

const mockTrackClickEvent = vi.mocked(trackClickEvent);

describe('Header component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackClickEvent.mockReturnValue(vi.fn());
  });

  it('renders the component correctly', async () => {
    await renderWithRouter(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(
      screen.getByAltText('Recreation Sites and Trails BC Logo'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: /main header navigation/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {
        name: /secondary header site navigation/i,
      }),
    ).toBeInTheDocument();
  });

  it('renders hamburger button with correct initial state', async () => {
    await renderWithRouter(<Header />);
    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    expect(hamburgerButton).toBeInTheDocument();
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Open menu');
  });

  it('renders navigation drawer with correct initial state', async () => {
    await renderWithRouter(<Header />);
    const navigationDrawer = screen.getByRole('navigation', {
      name: /mobile navigation menu/i,
    });
    expect(navigationDrawer).toBeInTheDocument();
    expect(navigationDrawer).toHaveClass('menu-closed');
  });

  it('renders all header links correctly', async () => {
    await renderWithRouter(<Header />);

    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });

    HEADER_LINKS.forEach((link) => {
      const linkElement = within(desktopNav).getByText(link.label);
      expect(linkElement).toBeInTheDocument();

      if (link.isExternal) {
        expect(linkElement.closest('a')).toHaveAttribute('href', link.url);
        expect(linkElement.closest('a')).toHaveAttribute('target', '_blank');
        expect(linkElement.closest('a')).toHaveAttribute(
          'rel',
          'noopener noreferrer',
        );
      } else {
        expect(linkElement.closest('a')).toHaveAttribute('href', link.url);
        expect(linkElement.closest('a')).not.toHaveAttribute('target');
      }
    });
  });

  it('toggles hamburger menu when hamburger button is clicked', async () => {
    await renderWithRouter(<Header />);

    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    const navigationDrawer = screen.getByRole('navigation', {
      name: /mobile navigation menu/i,
    });

    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    expect(navigationDrawer).toHaveClass('menu-closed');

    fireEvent.click(hamburgerButton);

    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Close menu');
    expect(navigationDrawer).toHaveClass('menu-open');

    fireEvent.click(hamburgerButton);

    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Open menu');
    expect(navigationDrawer).toHaveClass('menu-closed');
  });

  it('navigation drawer can be toggled multiple times', async () => {
    await renderWithRouter(<Header />);

    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    const navigationDrawer = screen.getByRole('navigation', {
      name: /mobile navigation menu/i,
    });

    fireEvent.click(hamburgerButton);
    expect(navigationDrawer).toHaveClass('menu-open');

    fireEvent.click(hamburgerButton);
    expect(navigationDrawer).toHaveClass('menu-closed');

    fireEvent.click(hamburgerButton);
    expect(navigationDrawer).toHaveClass('menu-open');
  });

  it('tracks analytics when header links are clicked', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<Header />);

    const firstLink = HEADER_LINKS[0];
    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });
    const linkElement = within(desktopNav).getByText(firstLink.label);

    await user.click(linkElement);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Header Navigation',
      name: `Sub Header - ${firstLink.label}`,
    });
  });

  it('tracks analytics when mobile navigation links are clicked', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<Header />);

    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(hamburgerButton);

    const firstLink = HEADER_LINKS[0];
    const mobileNav = screen.getByRole('navigation', {
      name: /mobile navigation menu/i,
    });
    const mobileLink = within(mobileNav).getByText(firstLink.label);

    await user.click(mobileLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Mobile Navigation',
      name: `Hamburger Menu - ${firstLink.label}`,
    });
  });

  it('tracks feedback analytics with page title when website feedback is clicked', async () => {
    const mockTracker = vi.fn();
    const user = userEvent.setup();
    mockTrackClickEvent.mockReturnValue(mockTracker);
    document.title = 'Find a site or trail | Sites and Trails BC';

    await renderWithRouter(<Header />);

    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });
    const feedbackLink = within(desktopNav).getByText('Website feedback');

    await user.click(feedbackLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Feedback',
      action: 'Header',
      name: 'Header - Find a site or trail',
    });
    expect(mockTrackClickEvent).not.toHaveBeenCalledWith({
      category: 'outlinks',
      name: 'Sub Header - Website feedback',
    });
    expect(mockTracker).toHaveBeenCalled();
  });

  it('renders logo link correctly', async () => {
    await renderWithRouter(<Header />);

    const logoLink = screen.getByRole('link', {
      name: /recreation sites and trails bc logo/i,
    });
    expect(logoLink).toHaveAttribute('href', '/');

    expect(within(logoLink).getByRole('img')).toBeInTheDocument();
  });

  it('renders environment banner', async () => {
    await renderWithRouter(<Header />);
    expect(screen.getByTestId('environment-banner')).toBeInTheDocument();
  });

  it('tracks search map view analytics when search by map link is clicked', async () => {
    const mockTracker = vi.fn();
    const user = userEvent.setup();
    mockTrackClickEvent.mockReturnValue(mockTracker);

    await renderWithRouter(<Header />);

    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });
    const searchByMapLink = within(desktopNav).getByText('Search by map');

    await user.click(searchByMapLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Header Navigation',
      name: 'Sub Header - Search by map',
    });
    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'MapView',
      action: 'MapView_home',
      name: 'MapView_home',
    });
  });

  it('tracks feedback analytics when website feedback link is clicked on non-feedback page', async () => {
    const mockTracker = vi.fn();
    const user = userEvent.setup();
    mockTrackClickEvent.mockReturnValue(mockTracker);
    document.title = 'Home | Sites and Trails BC';

    await renderWithRouter(<Header />);

    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });
    const feedbackLink = within(desktopNav).getByText('Website feedback');

    await user.click(feedbackLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Feedback',
      action: 'Header',
      name: 'Header - Home',
    });
    expect(mockTrackClickEvent).not.toHaveBeenCalledWith({
      category: 'outlinks',
      name: 'Sub Header - Website feedback',
    });
  });

  it('continues tracking outlinks for non-feedback external header links', async () => {
    const user = userEvent.setup();
    await renderWithRouter(<Header />);

    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });
    const alertsLink = within(desktopNav).getByText('Alerts');

    await user.click(alertsLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'outlinks',
      name: 'Sub Header - Alerts',
    });
  });

  it('handles missing document title gracefully', async () => {
    const mockTracker = vi.fn();
    const user = userEvent.setup();
    mockTrackClickEvent.mockReturnValue(mockTracker);
    const originalTitle = document.title;
    Object.defineProperty(document, 'title', {
      value: undefined,
      configurable: true,
    });

    await renderWithRouter(<Header />);

    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });
    const feedbackLink = within(desktopNav).getByText('Website feedback');

    await user.click(feedbackLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Feedback',
      action: 'Header',
      name: 'Header - Unknown page',
    });

    Object.defineProperty(document, 'title', {
      value: originalTitle,
      configurable: true,
    });
  });
});
