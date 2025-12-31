import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OutdoorRecreationTopic } from './OutdoorRecreationTopic';

/**
 * Mock FontAwesomeIcon to avoid SVG internals affecting coverage
 */
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon" />,
}));

/**
 * Mock route constants
 */
vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    HOME: '/',
  },
}));

describe('OutdoorRecreationTopic', () => {
  const defaultProps = {
    icon: '/icon-desktop.png',
    mobileIcon: '/icon-mobile.png',
    title: 'Camping',
    description: 'Enjoy the outdoors',
    linkText: 'Explore',
    type: 'camping',
  };

  it('renders all content correctly and builds the proper link', () => {
    render(<OutdoorRecreationTopic {...defaultProps} />);

    // Column container
    expect(screen.getByTestId('content-column')).toBeInTheDocument();

    // Desktop icon
    const desktopIcon = screen.getAllByAltText('Topic icon')[0];
    expect(desktopIcon).toHaveAttribute('src', defaultProps.icon);
    expect(desktopIcon).toHaveAttribute('height', '50');
    expect(desktopIcon).toHaveAttribute('width', '50');

    // Title
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();

    // Description
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();

    // Mobile icon
    const mobileIcon = screen.getAllByAltText('Topic icon')[1];
    expect(mobileIcon).toHaveAttribute('src', defaultProps.mobileIcon);
    expect(mobileIcon).toHaveAttribute('height', '30');
    expect(mobileIcon).toHaveAttribute('width', '30');

    // Link text
    expect(screen.getByText(defaultProps.linkText)).toBeInTheDocument();

    // Anchor href
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/search?type=camping');
  });
});
