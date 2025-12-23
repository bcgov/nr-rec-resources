import { render, screen, fireEvent } from '@testing-library/react';
import FooterLinkColumn from '@/components/layout/FooterLinkColumn';
import { trackClickEvent } from '@shared/utils';
import { vi } from 'vitest';

// Mock the matomo tracking utility
vi.mock('@shared/utils', () => ({
  trackClickEvent: vi.fn(() => vi.fn()),
}));

describe('FooterLinkColumn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component correctly with title and empty links', () => {
    render(<FooterLinkColumn title="Test title" links={[]} />);

    const testTitle = screen.getByText('Test title');
    expect(testTitle).toBeInTheDocument();
    expect(testTitle).toHaveClass('footer-heading');
  });

  it('renders external links correctly', () => {
    const links = [
      { title: 'External Link 1', url: 'https://example.com' },
      { title: 'External Link 2', url: 'https://another.com' },
    ];

    render(<FooterLinkColumn title="External Links" links={links} />);

    const link1 = screen.getByText('External Link 1');
    const link2 = screen.getByText('External Link 2');

    expect(link1).toBeInTheDocument();
    expect(link2).toBeInTheDocument();
    expect(link1.closest('a')).toHaveAttribute('href', 'https://example.com');
    expect(link1.closest('a')).toHaveAttribute('target', '_blank');
    expect(link1.closest('a')).toHaveAttribute('rel', 'noreferrer');
    expect(link2.closest('a')).toHaveAttribute('href', 'https://another.com');
  });

  it('renders component links correctly', () => {
    const links = [
      { title: 'Component Link', component: <span>Custom Component</span> },
    ];

    render(<FooterLinkColumn title="Component Links" links={links} />);

    const componentLink = screen.getByText('Custom Component');
    expect(componentLink).toBeInTheDocument();

    const linkContainer = componentLink.closest('div');
    expect(linkContainer).toHaveClass('paragraph-links mb-0');
    expect(linkContainer).toHaveAttribute('tabIndex', '0');
  });

  it('calls trackClickEvent when external link is clicked', () => {
    const mockTrackFunction = vi.fn();
    vi.mocked(trackClickEvent).mockReturnValue(mockTrackFunction);

    const links = [{ title: 'External Link', url: 'https://example.com' }];

    render(<FooterLinkColumn title="Links" links={links} />);

    const link = screen.getByText('External Link');
    fireEvent.click(link);

    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Footer link',
      action: 'Click',
      name: 'Footer link - External Link',
    });
    expect(mockTrackFunction).toHaveBeenCalled();
  });

  it('calls handleButtonClick when component link is clicked', () => {
    const mockTrackFunction = vi.fn();
    vi.mocked(trackClickEvent).mockReturnValue(mockTrackFunction);

    const links = [
      { title: 'Component Link', component: <span>Custom Component</span> },
    ];

    render(<FooterLinkColumn title="Links" links={links} />);

    const componentLink = screen.getByText('Custom Component');
    const linkContainer = componentLink.closest('div');

    fireEvent.click(linkContainer!);

    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Footer link',
      action: 'Click',
      name: 'Footer link - Component Link',
    });
    expect(mockTrackFunction).toHaveBeenCalled();
  });

  it('handles Enter key press on component links', () => {
    const mockTrackFunction = vi.fn();
    vi.mocked(trackClickEvent).mockReturnValue(mockTrackFunction);

    const links = [
      { title: 'Component Link', component: <span>Custom Component</span> },
    ];

    render(<FooterLinkColumn title="Links" links={links} />);

    const componentLink = screen.getByText('Custom Component');
    const linkContainer = componentLink.closest('div');

    fireEvent.keyDown(linkContainer!, { key: 'Enter' });

    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Footer link',
      action: 'Click',
      name: 'Footer link - Component Link',
    });
    expect(mockTrackFunction).toHaveBeenCalled();
  });

  it('handles Space key press on component links', () => {
    const mockTrackFunction = vi.fn();
    vi.mocked(trackClickEvent).mockReturnValue(mockTrackFunction);

    const links = [
      { title: 'Component Link', component: <span>Custom Component</span> },
    ];

    render(<FooterLinkColumn title="Links" links={links} />);

    const componentLink = screen.getByText('Custom Component');
    const linkContainer = componentLink.closest('div');

    const keyDownEvent = new KeyboardEvent('keydown', { key: ' ' });
    Object.defineProperty(keyDownEvent, 'preventDefault', {
      value: vi.fn(),
      writable: true,
    });

    fireEvent.keyDown(linkContainer!, { key: ' ' });

    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Footer link',
      action: 'Click',
      name: 'Footer link - Component Link',
    });
    expect(mockTrackFunction).toHaveBeenCalled();
  });

  it('does not handle other key presses on component links', () => {
    const mockTrackFunction = vi.fn();
    vi.mocked(trackClickEvent).mockReturnValue(mockTrackFunction);

    const links = [
      { title: 'Component Link', component: <span>Custom Component</span> },
    ];

    render(<FooterLinkColumn title="Links" links={links} />);

    const componentLink = screen.getByText('Custom Component');
    const linkContainer = componentLink.closest('div');

    fireEvent.keyDown(linkContainer!, { key: 'Tab' });
    fireEvent.keyDown(linkContainer!, { key: 'Escape' });

    expect(trackClickEvent).not.toHaveBeenCalled();
    expect(mockTrackFunction).not.toHaveBeenCalled();
  });

  it('renders mixed link types correctly', () => {
    const links = [
      { title: 'External Link', url: 'https://example.com' },
      { title: 'Component Link', component: <button>Click me</button> },
      { title: 'Another External', url: 'https://test.com' },
    ];

    render(<FooterLinkColumn title="Mixed Links" links={links} />);

    expect(screen.getByText('External Link')).toBeInTheDocument();
    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.getByText('Another External')).toBeInTheDocument();

    // Verify external links have proper attributes
    const externalLink1 = screen.getByText('External Link').closest('a');
    const externalLink2 = screen.getByText('Another External').closest('a');
    expect(externalLink1).toHaveAttribute('href', 'https://example.com');
    expect(externalLink2).toHaveAttribute('href', 'https://test.com');

    // Verify component link has proper classes and attributes
    const componentContainer = screen.getByText('Click me').closest('div');
    expect(componentContainer).toHaveAttribute('tabIndex', '0');
  });
});
