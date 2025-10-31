import { vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import SearchLinks from '@/components/search/SearchLinks';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import { trackEvent } from '@shared/utils';

vi.mock('@shared/utils', () => ({
  trackEvent: vi.fn(),
}));

describe('SearchLinks', () => {
  it('renders the title', async () => {
    await renderWithRouter(<SearchLinks />);
    expect(screen.getByText(SEARCH_LINKS_TITLE)).toBeInTheDocument();
  });

  it('renders all search links', async () => {
    await renderWithRouter(<SearchLinks />);

    SEARCH_LINKS.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('has correct href attributes for links', async () => {
    await renderWithRouter(<SearchLinks />);

    SEARCH_LINKS.forEach((link) => {
      const linkElement = screen.getByText(link.label);
      const expectedHref = link.search
        ? `${link.path}?${new URLSearchParams(link.search).toString()}`
        : link.path;
      expect(linkElement).toHaveAttribute('href', expectedHref);
    });
  });

  it('has the correct CSS class', async () => {
    await renderWithRouter(<SearchLinks />);
    const container = screen.getByText(SEARCH_LINKS_TITLE).parentElement;
    expect(container).toHaveClass('search-links-desktop');
  });

  it('calls trackEvent when a link is clicked', async () => {
    await renderWithRouter(<SearchLinks />);

    const firstLink = screen.getByText(SEARCH_LINKS[0].label);
    firstLink.click();

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Click',
      name: `Search link - ${SEARCH_LINKS[0].trackingName}`,
    });
  });
});
