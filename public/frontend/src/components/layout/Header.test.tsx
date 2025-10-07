import { render, screen, within, fireEvent } from '@testing-library/react';
import Header from '@/components/layout/Header';
import { HEADER_LINKS } from '@/components/layout/constants';

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Link: ({ children, to, onClick, ...props }: any) => (
      <a href={to} onClick={onClick} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock('@/components/layout/BetaBanner', () => ({
  default: () => <div data-testid="beta-banner">Beta Banner</div>,
}));

vi.mock('@shared/utils', () => ({
  trackClickEvent: vi.fn(() => vi.fn()),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="font-awesome-icon" data-icon={icon.iconName} />
  ),
}));

import { trackClickEvent } from '@shared/utils';

const mockTrackClickEvent = vi.mocked(trackClickEvent);

describe('Header component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackClickEvent.mockReturnValue(vi.fn());
  });

  it('renders the component correctly', () => {
    render(<Header />);

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

  it('renders hamburger button with correct initial state', () => {
    render(<Header />);
    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    expect(hamburgerButton).toBeInTheDocument();
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
    expect(hamburgerButton).toHaveAttribute('aria-label', 'Open menu');
  });

  it('renders navigation drawer with correct initial state', () => {
    render(<Header />);
    const navigationDrawer = screen.getByRole('navigation', {
      name: /mobile navigation menu/i,
    });
    expect(navigationDrawer).toBeInTheDocument();
    expect(navigationDrawer).toHaveClass('menu-closed');
  });

  it('renders all header links correctly', () => {
    render(<Header />);

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

        const icon = within(linkElement.closest('a')!).getByTestId(
          'font-awesome-icon',
        );
        expect(icon).toHaveAttribute('data-icon', 'arrow-up-right-from-square');
      } else {
        expect(linkElement.closest('a')).toHaveAttribute('href', link.url);
        expect(linkElement.closest('a')).not.toHaveAttribute('target');
      }
    });
  });

  it('toggles hamburger menu when hamburger button is clicked', () => {
    render(<Header />);

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

  it('navigation drawer can be toggled multiple times', () => {
    render(<Header />);

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

  it('tracks analytics when header links are clicked', () => {
    render(<Header />);

    const firstLink = HEADER_LINKS[0];
    const desktopNav = screen.getByRole('navigation', {
      name: /secondary header site navigation/i,
    });
    const linkElement = within(desktopNav).getByText(firstLink.label);

    fireEvent.click(linkElement);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Header Navigation',
      name: `Sub Header - ${firstLink.label}`,
    });
  });

  it('tracks analytics when mobile navigation links are clicked', () => {
    render(<Header />);

    const hamburgerButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(hamburgerButton);

    const firstLink = HEADER_LINKS[0];
    const mobileNav = screen.getByRole('navigation', {
      name: /mobile navigation menu/i,
    });
    const mobileLink = within(mobileNav).getByText(firstLink.label);

    fireEvent.click(mobileLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Mobile Navigation',
      name: `Hamburger Menu - ${firstLink.label}`,
    });
  });

  it('renders logo link correctly', () => {
    render(<Header />);

    const logoLink = screen.getByRole('link', {
      name: /recreation sites and trails bc logo/i,
    });
    expect(logoLink).toHaveAttribute('href', '/');

    expect(within(logoLink).getByRole('img')).toBeInTheDocument();
  });
});
