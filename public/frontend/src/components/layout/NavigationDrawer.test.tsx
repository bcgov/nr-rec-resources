import { render, screen, fireEvent, within } from '@testing-library/react';
import { createRef } from 'react';
import NavigationDrawer from './NavigationDrawer';
import { HEADER_LINKS } from './constants';
import { EXTERNAL_LINKS } from '@/data/urls';

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

vi.mock('@shared/hooks', () => ({
  useClickOutside: vi.fn(),
}));

vi.mock('react-remove-scroll', () => ({
  RemoveScroll: ({ children, enabled }: any) => (
    <div data-testid="remove-scroll" data-enabled={enabled}>
      {children}
    </div>
  ),
}));

vi.mock('@/utils/matomo', () => ({
  trackClickEvent: vi.fn(() => vi.fn()),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="font-awesome-icon" data-icon={icon.iconName} />
  ),
}));

import { useClickOutside } from '@shared/hooks';
import { trackClickEvent } from '@/utils/matomo';

const mockUseClickOutside = vi.mocked(useClickOutside);
const mockTrackClickEvent = vi.mocked(trackClickEvent);

describe('NavigationDrawer', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    buttonRef: createRef<HTMLButtonElement>(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackClickEvent.mockReturnValue(vi.fn());
  });

  it('renders the navigation drawer with correct structure', () => {
    render(<NavigationDrawer {...defaultProps} />);

    const drawer = screen.getByRole('navigation', {
      name: 'Mobile navigation menu',
    });
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass('navigation-drawer', 'menu-closed');

    const list = screen.getByRole('list');
    expect(list).toHaveClass('navigation-drawer-list');
  });

  it('applies correct classes when open', () => {
    render(<NavigationDrawer {...defaultProps} isOpen={true} />);

    const drawer = screen.getByRole('navigation', {
      name: 'Mobile navigation menu',
    });
    expect(drawer).toHaveClass('navigation-drawer', 'menu-open');
  });

  it('enables RemoveScroll when drawer is open', () => {
    render(<NavigationDrawer {...defaultProps} isOpen={true} />);

    const removeScroll = screen.getByTestId('remove-scroll');
    expect(removeScroll).toHaveAttribute('data-enabled', 'true');
  });

  it('disables RemoveScroll when drawer is closed', () => {
    render(<NavigationDrawer {...defaultProps} isOpen={false} />);

    const removeScroll = screen.getByTestId('remove-scroll');
    expect(removeScroll).toHaveAttribute('data-enabled', 'false');
  });

  it('renders all header links correctly', () => {
    render(<NavigationDrawer {...defaultProps} />);

    HEADER_LINKS.forEach((link) => {
      const linkElement = screen.getByText(link.label);
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

  it('renders feedback link correctly', () => {
    render(<NavigationDrawer {...defaultProps} />);

    const feedbackLink = screen.getByText('Share feedback');
    expect(feedbackLink).toBeInTheDocument();
    expect(feedbackLink.closest('a')).toHaveAttribute(
      'href',
      EXTERNAL_LINKS.FEEDBACK_FORM,
    );
    expect(feedbackLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(feedbackLink.closest('a')).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );

    const feedbackItem = feedbackLink.closest('li');
    expect(feedbackItem).toHaveClass('navigation-drawer-item', 'feedback');

    // Should have external link icon
    const icon = within(feedbackLink.closest('a')!).getByTestId(
      'font-awesome-icon',
    );
    expect(icon).toHaveAttribute('data-icon', 'arrow-up-right-from-square');
  });

  it('calls onClose when internal link is clicked', () => {
    const mockOnClose = vi.fn();
    render(<NavigationDrawer {...defaultProps} onClose={mockOnClose} />);

    // Find an internal link (first one should be internal)
    const internalLink = HEADER_LINKS.find((link) => !link.isExternal);
    const linkElement = screen.getByText(internalLink!.label);

    fireEvent.click(linkElement);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when external link is clicked', () => {
    const mockOnClose = vi.fn();
    render(<NavigationDrawer {...defaultProps} onClose={mockOnClose} />);

    // Find an external link
    const externalLink = HEADER_LINKS.find((link) => link.isExternal);
    const linkElement = screen.getByText(externalLink!.label);

    fireEvent.click(linkElement);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when feedback link is clicked', () => {
    const mockOnClose = vi.fn();
    render(<NavigationDrawer {...defaultProps} onClose={mockOnClose} />);

    const feedbackLink = screen.getByText('Share feedback');
    fireEvent.click(feedbackLink);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('tracks analytics for internal link clicks', () => {
    const mockTracker = vi.fn();
    mockTrackClickEvent.mockReturnValue(mockTracker);

    render(<NavigationDrawer {...defaultProps} />);

    const internalLink = HEADER_LINKS.find((link) => !link.isExternal);
    const linkElement = screen.getByText(internalLink!.label);

    fireEvent.click(linkElement);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Mobile Navigation',
      name: `Hamburger Menu - ${internalLink!.label}`,
    });
  });

  it('tracks analytics for external link clicks', () => {
    const mockTracker = vi.fn();
    mockTrackClickEvent.mockReturnValue(mockTracker);

    render(<NavigationDrawer {...defaultProps} />);

    const externalLink = HEADER_LINKS.find((link) => link.isExternal);
    const linkElement = screen.getByText(externalLink!.label);

    fireEvent.click(linkElement);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Mobile Navigation',
      name: `Hamburger Menu - ${externalLink!.label}`,
    });
  });

  it('tracks analytics for feedback link clicks', () => {
    const mockTracker = vi.fn();
    mockTrackClickEvent.mockReturnValue(mockTracker);

    render(<NavigationDrawer {...defaultProps} />);

    const feedbackLink = screen.getByText('Share feedback');
    fireEvent.click(feedbackLink);

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Mobile Navigation',
      name: 'Hamburger Menu - Share feedback',
    });

    expect(mockTrackClickEvent).toHaveBeenCalledWith({
      category: 'Feedback',
      name: 'Beta Banner Feedback Button - mobile navigation drawer',
    });
  });

  it('sets up click outside handler correctly', () => {
    render(<NavigationDrawer {...defaultProps} />);

    expect(mockUseClickOutside).toHaveBeenCalledTimes(1);
    expect(mockUseClickOutside).toHaveBeenCalledWith(
      expect.any(Object), // ref
      expect.any(Function), // callback
    );
  });

  describe('click outside behavior', () => {
    it('calls onClose when clicking outside and drawer is open', () => {
      const mockOnClose = vi.fn();
      let clickOutsideCallback: (event: MouseEvent) => void;

      mockUseClickOutside.mockImplementation((ref, callback) => {
        clickOutsideCallback = callback;
      });

      render(
        <NavigationDrawer
          {...defaultProps}
          isOpen={true}
          onClose={mockOnClose}
        />,
      );

      // Simulate click outside
      const mockEvent = new MouseEvent('mousedown');
      Object.defineProperty(mockEvent, 'target', {
        value: document.body,
        enumerable: true,
      });

      clickOutsideCallback!(mockEvent);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when clicking outside and drawer is closed', () => {
      const mockOnClose = vi.fn();
      let clickOutsideCallback: (event: MouseEvent) => void;

      mockUseClickOutside.mockImplementation((ref, callback) => {
        clickOutsideCallback = callback;
      });

      render(
        <NavigationDrawer
          {...defaultProps}
          isOpen={false}
          onClose={mockOnClose}
        />,
      );

      // Simulate click outside
      const mockEvent = new MouseEvent('mousedown');
      Object.defineProperty(mockEvent, 'target', {
        value: document.body,
        enumerable: true,
      });

      clickOutsideCallback!(mockEvent);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('has correct accessibility attributes', () => {
    render(<NavigationDrawer {...defaultProps} />);

    const drawer = screen.getByRole('navigation', {
      name: 'Mobile navigation menu',
    });
    expect(drawer).toHaveAttribute('aria-label', 'Mobile navigation menu');
  });

  it('renders all navigation items as list items', () => {
    render(<NavigationDrawer {...defaultProps} />);

    const listItems = screen.getAllByRole('listitem');
    // Should have all header links plus feedback link
    expect(listItems).toHaveLength(HEADER_LINKS.length + 1);

    listItems.forEach((item) => {
      expect(item).toHaveClass('navigation-drawer-item');
    });
  });
});
