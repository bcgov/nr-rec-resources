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
    };

    render(<Activity {...props} />);

    // Column container
    const column = screen.getByTestId('content-column');
    expect(column).toBeInTheDocument();
    expect(column).toHaveClass('activity-container');

    // Link
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/search?activities=12');

    // Image
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', props.imageUrl);
    expect(image).toHaveAttribute('alt', props.description);
    expect(image).toHaveAttribute('width', '349');
    expect(image).toHaveAttribute('height', '203');
    expect(image).toHaveClass('activity-image');

    // Text content
    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.description)).toBeInTheDocument();
  });
});
