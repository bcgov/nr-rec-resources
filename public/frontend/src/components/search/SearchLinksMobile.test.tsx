import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import SearchLinksMobile from '@/components/search/SearchLinksMobile';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';

describe('SearchLinksMobile', () => {
  it('renders the mobile button', async () => {
    await renderWithRouter(
      <SearchLinksMobile totalCount={1} ids={['r1']} trackingView="map" />,
    );
    expect(
      screen.getByRole('button', { name: SEARCH_LINKS_TITLE }),
    ).toBeInTheDocument();
  });

  it('opens modal when button is clicked', async () => {
    await renderWithRouter(
      <SearchLinksMobile totalCount={1} ids={['r1']} trackingView="map" />,
    );

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
    await renderWithRouter(
      <SearchLinksMobile totalCount={1} ids={['r1']} trackingView="map" />,
    );

    const button = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(button);

    SEARCH_LINKS.forEach((link) => {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    });
  });

  it('has correct href attributes for modal links', async () => {
    await renderWithRouter(
      <SearchLinksMobile totalCount={1} ids={['r1']} trackingView="map" />,
    );

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
    await renderWithRouter(
      <SearchLinksMobile totalCount={1} ids={['r1']} trackingView="map" />,
    );

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
    await renderWithRouter(
      <SearchLinksMobile totalCount={1} ids={['r1']} trackingView="map" />,
    );

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

  it('shows kml download component when the button is clicked and close the component', async () => {
    await renderWithRouter(
      <SearchLinksMobile totalCount={1} ids={['r1']} trackingView="map" />,
    );

    const openButton = screen.getByRole('button', { name: SEARCH_LINKS_TITLE });
    fireEvent.click(openButton);

    const kmlButton = screen.getByText('Download KML');
    fireEvent.click(kmlButton);

    await waitFor(() => {
      expect(screen.getByTestId('msg-alert')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
  });
});
