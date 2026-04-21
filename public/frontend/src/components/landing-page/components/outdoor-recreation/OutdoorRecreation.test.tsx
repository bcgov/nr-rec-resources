import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OutdoorRecreation } from './OutdoorRecreation';

/**
 * Mock SVG imports
 */
vi.mock('@/images/icons/site-tree.svg', () => ({ default: 'site-tree.svg' }));
vi.mock('@/images/icons/trail-flag.svg', () => ({ default: 'trail-flag.svg' }));
vi.mock('@/images/icons/forest-plant.svg', () => ({
  default: 'forest-plant.svg',
}));
vi.mock('@/images/icons/site-tree-mobile.svg', () => ({
  default: 'site-tree-mobile.svg',
}));
vi.mock('@/images/icons/trail-flag-mobile.svg', () => ({
  default: 'trail-flag-mobile.svg',
}));
vi.mock('@/images/icons/forest-plant-mobile.svg', () => ({
  default: 'forest-plant-mobile.svg',
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
        type: 'RTE',
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
