import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Activity } from './Activity';
import { LandingPageActivity } from './interfaces';

/**
 * Mock ROUTE_PATHS so the href is deterministic
 */
vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    HOME: '/',
  },
}));

describe('Activity component', () => {
  it('renders activity content correctly with proper link and image attributes', () => {
    const props: LandingPageActivity = {
      title: 'Hiking',
      description: 'Explore the mountains',
      imageUrl: 'https://example.com/hiking.jpg',
      activityFilter: 12,
      mobileImageUrl: 'https://example.com/hiking_mobile.jpg',
    };

    render(<Activity {...props} />);

    // Column container
    const column = screen.getByTestId('content-column');
    expect(column).toBeInTheDocument();
    expect(column).toHaveClass('activity-container');

    // Links
    const linkDesktop = screen.getByTestId('desktop-link');
    expect(linkDesktop).toHaveAttribute(
      'href',
      '/search?activities=12&view=map',
    );
    const linkMobile = screen.getByTestId('mobile-link');
    expect(linkMobile).toHaveAttribute(
      'href',
      '/search?activities=12&view=map',
    );

    // Images
    const desktopImage = screen.getByTestId('desktop-image');
    expect(desktopImage).toHaveAttribute('src', props.imageUrl);
    expect(desktopImage).toHaveAttribute('alt', props.description);
    expect(desktopImage).toHaveAttribute('width', '349');
    expect(desktopImage).toHaveAttribute('height', '203');
    expect(desktopImage).toHaveClass('activity-image');
    const mobileImage = screen.getByTestId('mobile-image');
    expect(mobileImage).toHaveAttribute('src', props.mobileImageUrl);
    expect(mobileImage).toHaveAttribute('alt', props.description);
    expect(mobileImage).toHaveAttribute('width', '100');
    expect(mobileImage).toHaveAttribute('height', '78');
    expect(mobileImage).toHaveClass('activity-image');

    // Text content
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });
});
