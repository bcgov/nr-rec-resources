import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import AccessibleActivities from './AccessibleActivities';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';

// Mocking image imports to verify icons
vi.mock('@/images/icons/trails/blue.svg', () => ({ default: 'blue-icon-url' }));
vi.mock('@/images/icons/trails/green.svg', () => ({
  default: 'green-icon-url',
}));
vi.mock('@/images/icons/trails/black.svg', () => ({
  default: 'black-icon-url',
}));

describe('AccessibleActivities Component', () => {
  const mockData = {
    accessible_recreation_activity: [
      {
        description: 'Activity 1',
        details: 'Details for activity 1',
        recreation_activity_trails: [
          {
            name: 'Green Trail',
            description: 'Easy path',
            trail_type: 'GREEN',
          },
          {
            name: 'Blue Trail',
            description: 'Moderate path',
            trail_type: 'BLUE',
          },
          {
            name: 'Black Trail',
            description: 'Hard path',
            trail_type: 'BLACK',
          },
          {
            name: 'Default Trail',
            description: 'Unknown type',
            trail_type: 'PURPLE',
          }, // Tests default switch case
        ],
      },
      {
        description: 'Activity 2',
        details: 'Details for activity 2',
        // recreation_activity_trails omitted to test conditional rendering
      },
    ],
  };

  it('renders the section with the correct title and ID', () => {
    const { container } = render(<AccessibleActivities {...mockData} />);

    // Fallback to checking the ID on the element directly
    const section = container.querySelector(
      `#${SectionIds.ACCESSIBLE_RECREATION}`,
    );

    expect(section).toBeInTheDocument();
    expect(
      screen.getByText(SectionTitles.ACCESSIBLE_RECREATION),
    ).toBeInTheDocument();
  });

  it('renders multiple activities and their details', () => {
    render(<AccessibleActivities {...mockData} />);

    expect(screen.getByText('Activity 1')).toBeInTheDocument();
    expect(screen.getByText('Details for activity 1')).toBeInTheDocument();
    expect(screen.getByText('Activity 2')).toBeInTheDocument();
    expect(screen.getByText('Details for activity 2')).toBeInTheDocument();
  });

  it('renders trails with correct icons based on trail_type', () => {
    render(<AccessibleActivities {...mockData} />);

    const images = screen.getAllByAltText(
      'Trail difficulty icon',
    ) as HTMLImageElement[];

    // Green Trail
    expect(screen.getByText('Green Trail')).toBeInTheDocument();
    expect(images[0].src).toContain('green-icon-url');

    // Blue Trail
    expect(screen.getByText('Blue Trail')).toBeInTheDocument();
    expect(images[1].src).toContain('blue-icon-url');

    // Black Trail
    expect(screen.getByText('Black Trail')).toBeInTheDocument();
    expect(images[2].src).toContain('black-icon-url');

    // Default Case (Purple trail type should map to blue icon)
    expect(screen.getByText('Default Trail')).toBeInTheDocument();
    expect(images[3].src).toContain('blue-icon-url');
  });

  it('does not render the trails div if recreation_activity_trails is missing', () => {
    render(<AccessibleActivities {...mockData} />);

    // Check "Activity 2" section (which has no trails)
    const activity2Heading = screen.getByText('Activity 2');
    const activity2Section = activity2Heading.closest('section');

    // The inner trails div should not exist in Activity 2
    expect(activity2Section?.querySelector('.row')).toBeNull();
  });

  it('correctly forwards the ref to the section element', () => {
    const ref = createRef<HTMLElement>();
    render(<AccessibleActivities {...mockData} ref={ref} />);

    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('SECTION');
    expect(ref.current?.id).toBe(SectionIds.ACCESSIBLE_RECREATION);
  });
});
