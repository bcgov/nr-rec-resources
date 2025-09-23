import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SearchLinks from '@/components/search/SearchLinks';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import { trackEvent } from '@/utils/matomo';

vi.mock('@/utils/matomo', () => ({
  trackEvent: vi.fn(),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SearchLinks', () => {
  it('renders the title', () => {
    renderWithRouter(<SearchLinks />);
    expect(screen.getByText(SEARCH_LINKS_TITLE)).toBeInTheDocument();
  });

  it('renders all search links', () => {
    renderWithRouter(<SearchLinks />);

    SEARCH_LINKS.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('has correct href attributes for links', () => {
    renderWithRouter(<SearchLinks />);

    SEARCH_LINKS.forEach((link) => {
      const linkElement = screen.getByText(link.label);
      expect(linkElement).toHaveAttribute(
        'href',
        link.path + (link.search ? `?${link.search}` : ''),
      );
    });
  });

  it('has the correct CSS class', () => {
    renderWithRouter(<SearchLinks />);
    const container = screen.getByText(SEARCH_LINKS_TITLE).parentElement;
    expect(container).toHaveClass('search-links-desktop');
  });

  it('calls trackEvent when a link is clicked', () => {
    renderWithRouter(<SearchLinks />);

    const firstLink = screen.getByText(SEARCH_LINKS[0].label);
    firstLink.click();

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Click',
      name: `Search link - ${SEARCH_LINKS[0].trackingName}`,
    });
  });
});
