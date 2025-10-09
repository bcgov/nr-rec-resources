import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { BrowserRouter } from 'react-router';
import NavigationDrawer from './NavigationDrawer';
import { HEADER_LINKS } from './constants';
import { EXTERNAL_LINKS } from '@/data/urls';
import { trackClickEvent } from '@shared/utils';

vi.mock('@shared/utils', () => ({
  trackClickEvent: vi.fn(() => vi.fn()),
}));

const mockTrackClickEvent = vi.mocked(trackClickEvent);

describe('NavigationDrawer', () => {
  const defaultProps = {
    isOpen: false,
    onClose: vi.fn(),
    buttonRef: createRef<HTMLButtonElement>(),
  };

  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTrackClickEvent.mockReturnValue(vi.fn());
  });

  it('renders the navigation drawer with correct structure', () => {
    renderWithRouter(<NavigationDrawer {...defaultProps} />);

    const drawer = screen.getByRole('navigation', {
      name: 'Mobile navigation menu',
    });
    expect(drawer).toBeInTheDocument();
    expect(drawer).toHaveClass('navigation-drawer', 'menu-closed');

    const list = screen.getByRole('list');
    expect(list).toHaveClass('navigation-drawer-list');
  });

  it('applies correct classes when open', () => {
    renderWithRouter(<NavigationDrawer {...defaultProps} isOpen={true} />);

    const drawer = screen.getByRole('navigation', {
      name: 'Mobile navigation menu',
    });
    expect(drawer).toHaveClass('navigation-drawer', 'menu-open');
  });

  it('renders all header links correctly', () => {
    renderWithRouter(<NavigationDrawer {...defaultProps} />);

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
      } else {
        expect(linkElement.closest('a')).toHaveAttribute('href', link.url);
        expect(linkElement.closest('a')).not.toHaveAttribute('target');
      }
    });
  });

  it('renders feedback link correctly', () => {
    renderWithRouter(<NavigationDrawer {...defaultProps} />);

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
  });

  it('calls onClose when internal link is clicked', () => {
    const mockOnClose = vi.fn();
    renderWithRouter(
      <NavigationDrawer {...defaultProps} onClose={mockOnClose} />,
    );

    // Find an internal link (first one should be internal)
    const internalLink = HEADER_LINKS.find((link) => !link.isExternal);
    const linkElement = screen.getByText(internalLink!.label);

    fireEvent.click(linkElement);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when external link is clicked', () => {
    const mockOnClose = vi.fn();
    renderWithRouter(
      <NavigationDrawer {...defaultProps} onClose={mockOnClose} />,
    );

    // Find an external link
    const externalLink = HEADER_LINKS.find((link) => link.isExternal);
    const linkElement = screen.getByText(externalLink!.label);

    fireEvent.click(linkElement);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when feedback link is clicked', () => {
    const mockOnClose = vi.fn();
    renderWithRouter(
      <NavigationDrawer {...defaultProps} onClose={mockOnClose} />,
    );

    const feedbackLink = screen.getByText('Share feedback');
    fireEvent.click(feedbackLink);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('tracks analytics for internal link clicks', () => {
    const mockTracker = vi.fn();
    mockTrackClickEvent.mockReturnValue(mockTracker);

    renderWithRouter(<NavigationDrawer {...defaultProps} />);

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

    renderWithRouter(<NavigationDrawer {...defaultProps} />);

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

    renderWithRouter(<NavigationDrawer {...defaultProps} />);

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

  it('calls onClose when clicking outside the drawer while open', () => {
    const mockOnClose = vi.fn();
    renderWithRouter(
      <NavigationDrawer
        {...defaultProps}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    // Click outside the drawer (on document body)
    fireEvent.mouseDown(document.body);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the drawer', () => {
    const mockOnClose = vi.fn();
    renderWithRouter(
      <NavigationDrawer
        {...defaultProps}
        isOpen={true}
        onClose={mockOnClose}
      />,
    );

    const drawer = screen.getByRole('navigation', {
      name: 'Mobile navigation menu',
    });

    // Click inside the drawer
    fireEvent.mouseDown(drawer);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    renderWithRouter(<NavigationDrawer {...defaultProps} />);

    const drawer = screen.getByRole('navigation', {
      name: 'Mobile navigation menu',
    });
    expect(drawer).toHaveAttribute('aria-label', 'Mobile navigation menu');
  });

  it('renders all navigation items as list items', () => {
    renderWithRouter(<NavigationDrawer {...defaultProps} />);

    const listItems = screen.getAllByRole('listitem');
    // Should have all header links plus feedback link
    expect(listItems).toHaveLength(HEADER_LINKS.length + 1);

    listItems.forEach((item) => {
      expect(item).toHaveClass('navigation-drawer-item');
    });
  });
});
