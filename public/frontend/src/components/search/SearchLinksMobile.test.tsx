import { vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import SearchLinksMobile from '@/components/search/SearchLinksMobile';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import { trackEvent } from '@shared/utils';

vi.mock('@shared/utils', () => ({
  trackEvent: vi.fn(),
}));

describe('SearchLinksMobile', () => {
  it('renders the mobile button', async () => {
    await renderWithRouter(<SearchLinksMobile />);
    expect(
      screen.getByRole('button', { name: SEARCH_LINKS_TITLE }),
    ).toBeInTheDocument();
  });

  it('opens modal when button is clicked', async () => {
    await renderWithRouter(<SearchLinksMobile />);

    const button = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(button);

    expect(
      screen.getByRole('heading', { name: SEARCH_LINKS_TITLE }),
    ).toBeInTheDocument();
    SEARCH_LINKS.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('renders all search links in modal', async () => {
    await renderWithRouter(<SearchLinksMobile />);

    const button = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(button);

    SEARCH_LINKS.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('has correct href attributes for modal links', async () => {
    await renderWithRouter(<SearchLinksMobile />);

    const button = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(button);

    SEARCH_LINKS.forEach((link) => {
      const linkElement = screen.getByText(link.label);
      const expectedHref = link.search
        ? `${link.path}?${new URLSearchParams(link.search).toString()}`
        : link.path;
      expect(linkElement).toHaveAttribute('href', expectedHref);
    });
  });

  it('closes modal when close button is clicked', async () => {
    await renderWithRouter(<SearchLinksMobile />);

    const openButton = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(openButton);

    const closeButton = screen.getByRole('button', { name: 'close' });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: SEARCH_LINKS_TITLE }),
      ).not.toBeInTheDocument();
    });
  });

  it('closes modal when a link is clicked', async () => {
    await renderWithRouter(<SearchLinksMobile />);

    const openButton = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(openButton);

    const firstLink = screen.getByText(SEARCH_LINKS[0].label);
    fireEvent.click(firstLink);

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: SEARCH_LINKS_TITLE }),
      ).not.toBeInTheDocument();
    });
  });

  it('calls trackEvent when button is clicked', async () => {
    await renderWithRouter(<SearchLinksMobile />);

    const button = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(button);

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Click',
      name: 'Open search links modal',
    });
  });

  it('calls trackEvent when a link is clicked', async () => {
    await renderWithRouter(<SearchLinksMobile />);

    const openButton = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(openButton);

    const firstLink = screen.getByText(SEARCH_LINKS[0].label);
    fireEvent.click(firstLink);

    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Click',
      name: `Search link - ${SEARCH_LINKS[0].trackingName}`,
    });
  });
});
