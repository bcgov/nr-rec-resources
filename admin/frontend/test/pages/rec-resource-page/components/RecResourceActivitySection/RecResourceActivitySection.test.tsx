import { RecResourceActivitySection } from '@/pages/rec-resource-page/components/RecResourceActivitySection/RecResourceActivitySection';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@shared/data/activityIconMap', () => ({
  activityIconMapFull: {
    '1': '/icons/hiking.svg',
    '2': '/icons/camping.svg',
    '3': '/icons/fishing.svg',
  },
}));

describe('RecResourceActivitySection', () => {
  const mockActivities: RecreationActivityDto[] = [
    {
      recreation_activity_code: 1,
      description: 'Hiking',
    },
    {
      recreation_activity_code: 2,
      description: 'Camping',
    },
  ];

  it('renders activities section with title', () => {
    render(
      <RecResourceActivitySection recreationActivities={mockActivities} />,
    );
    expect(screen.getByText('Activities')).toBeInTheDocument();
  });

  it('renders all activities with descriptions', () => {
    render(
      <RecResourceActivitySection recreationActivities={mockActivities} />,
    );
    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
  });

  it('renders activity icons when available', () => {
    render(
      <RecResourceActivitySection recreationActivities={mockActivities} />,
    );
    const hikingIcon = screen.getByAltText('Hiking icon');
    const campingIcon = screen.getByAltText('Camping icon');

    expect(hikingIcon).toBeInTheDocument();
    expect(hikingIcon).toHaveAttribute('src', '/icons/hiking.svg');
    expect(hikingIcon).toHaveAttribute('width', '24');
    expect(hikingIcon).toHaveAttribute('height', '24');

    expect(campingIcon).toBeInTheDocument();
    expect(campingIcon).toHaveAttribute('src', '/icons/camping.svg');
  });

  it('renders activity without icon when icon is not available', () => {
    const activitiesWithMissingIcon: RecreationActivityDto[] = [
      {
        recreation_activity_code: 999,
        description: 'Unknown Activity',
      },
    ];

    render(
      <RecResourceActivitySection
        recreationActivities={activitiesWithMissingIcon}
      />,
    );
    expect(screen.getByText('Unknown Activity')).toBeInTheDocument();
    expect(
      screen.queryByAltText('Unknown Activity icon'),
    ).not.toBeInTheDocument();
  });

  it('returns null when activities array is empty', () => {
    const { container } = render(
      <RecResourceActivitySection recreationActivities={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('returns null when activities is undefined', () => {
    const { container } = render(
      <RecResourceActivitySection
        recreationActivities={undefined as unknown as RecreationActivityDto[]}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders single activity correctly', () => {
    const singleActivity: RecreationActivityDto[] = [
      {
        recreation_activity_code: 3,
        description: 'Fishing',
      },
    ];

    render(
      <RecResourceActivitySection recreationActivities={singleActivity} />,
    );
    expect(screen.getByText('Activities')).toBeInTheDocument();
    expect(screen.getByText('Fishing')).toBeInTheDocument();
    expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
  });

  it('renders multiple activities in correct structure', () => {
    render(
      <RecResourceActivitySection recreationActivities={mockActivities} />,
    );

    const activityContainers = screen
      .getAllByRole('img')
      .map((img) => img.closest('.icon-container'));

    expect(activityContainers.length).toBe(2);
  });

  it('uses unique keys for activities with same code', () => {
    const duplicateActivities: RecreationActivityDto[] = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 1,
        description: 'Hiking Trail',
      },
    ];

    const { container } = render(
      <RecResourceActivitySection recreationActivities={duplicateActivities} />,
    );
    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Hiking Trail')).toBeInTheDocument();
    expect(container.querySelectorAll('.icon-container').length).toBe(2);
  });
});
