import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OutdoorRecreation } from './OutdoorRecreation';

/**
 * Mock SVG imports
 */
vi.mock('@/images/icons/campground.svg', () => ({ default: 'campground.svg' }));
vi.mock('@/images/icons/flag.svg', () => ({ default: 'flag.svg' }));
vi.mock('@/images/icons/tree.svg', () => ({ default: 'tree.svg' }));
vi.mock('@/images/icons/campground-mobile.svg', () => ({
  default: 'campground-mobile.svg',
}));
vi.mock('@/images/icons/flag-mobile.svg', () => ({
  default: 'flag-mobile.svg',
}));
vi.mock('@/images/icons/tree-mobile.svg', () => ({
  default: 'tree-mobile.svg',
}));

/**
 * Mock routes
 */
vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    HOME: '/',
  },
}));

/**
 * Mock OutdoorRecreationTopic to isolate this component
 */
const topicMock = vi.fn();
vi.mock('./OutdoorRecreationTopic', () => ({
  OutdoorRecreationTopic: (props: any) => {
    topicMock(props);
    return <div data-testid="topic" />;
  },
}));

describe('OutdoorRecreation', () => {
  it('renders description, topics, and map images correctly', () => {
    render(<OutdoorRecreation />);

    /**
     * Static description
     */
    expect(
      screen.getByText(
        /Recreation Sites and Trails B\.C\. \(RSTBC\) provides public recreation/i,
      ),
    ).toBeInTheDocument();

    /**
     * Topics
     */
    const topics = screen.getAllByTestId('topic');
    expect(topics).toHaveLength(3);

    expect(topicMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: '1455+',
        linkText: 'Explore sites',
        type: 'SIT',
      }),
    );

    expect(topicMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        title: '750+',
        linkText: 'Explore trails',
        type: 'RTR',
      }),
    );

    expect(topicMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        title: '10+',
        linkText: 'Explore interpretive forests',
        type: 'IF',
      }),
    );

    /**
     * Map link
     */
    const mapLink = screen.getByRole('link', { name: /map image/i });
    expect(mapLink).toHaveAttribute('href', '/search?view=map');

    /**
     * Desktop map image
     */
    const desktopMap = screen.getAllByAltText('map image')[0];
    expect(desktopMap).toHaveAttribute(
      'src',
      '/images/landing-page/activities/map_landing.png',
    );

    /**
     * Mobile map image
     */
    const mobileMap = screen.getAllByAltText('map image')[1];
    expect(mobileMap).toHaveAttribute(
      'src',
      '/images/landing-page/activities/map_landing_mobile.png',
    );
  });
});
