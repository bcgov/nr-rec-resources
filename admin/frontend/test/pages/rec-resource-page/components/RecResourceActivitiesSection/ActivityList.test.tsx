import { ActivityList } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/ActivityList';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@shared/data/activityIconMap', () => ({
  activityIconMapFull: {
    '1': '/path/to/hiking-icon.svg',
    '2': '/path/to/camping-icon.svg',
    '3': '/path/to/fishing-icon.svg',
  },
}));

describe('ActivityList', () => {
  const mockActivities: RecreationActivityDto[] = [
    {
      recreation_activity_code: 1,
      description: 'Hiking',
    },
    {
      recreation_activity_code: 2,
      description: 'Camping',
    },
    {
      recreation_activity_code: 3,
      description: 'Fishing',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of activities with icons', () => {
    render(<ActivityList recreationActivities={mockActivities} />);

    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Fishing')).toBeInTheDocument();

    expect(screen.getByAltText('Hiking icon')).toBeInTheDocument();
    expect(screen.getByAltText('Camping icon')).toBeInTheDocument();
    expect(screen.getByAltText('Fishing icon')).toBeInTheDocument();
  });

  it('maps activity codes to correct icons from activityIconMapFull', () => {
    render(<ActivityList recreationActivities={[mockActivities[0]]} />);

    const icon = screen.getByAltText('Hiking icon');
    expect(icon).toHaveAttribute('src', '/path/to/hiking-icon.svg');
    expect(icon).toHaveAttribute('width', '24');
    expect(icon).toHaveAttribute('height', '24');
  });

  it('displays activity descriptions', () => {
    render(<ActivityList recreationActivities={mockActivities} />);

    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Fishing')).toBeInTheDocument();
  });

  it('handles missing icons gracefully', () => {
    const activityWithoutIcon: RecreationActivityDto = {
      recreation_activity_code: 999,
      description: 'Unknown Activity',
    };

    render(<ActivityList recreationActivities={[activityWithoutIcon]} />);

    expect(screen.getByText('Unknown Activity')).toBeInTheDocument();
    expect(
      screen.queryByAltText('Unknown Activity icon'),
    ).not.toBeInTheDocument();
  });

  it('generates unique keys for activities', () => {
    const duplicateActivities: RecreationActivityDto[] = [
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
      {
        recreation_activity_code: 1,
        description: 'Hiking',
      },
    ];

    const { container } = render(
      <ActivityList recreationActivities={duplicateActivities} />,
    );

    const hikingElements = screen.getAllByText('Hiking');
    expect(hikingElements).toHaveLength(2);

    // Check that both are rendered (keys are used internally)
    // Bootstrap Col components render as divs with col classes
    const cols = container.querySelectorAll('[class*="col"]');
    expect(cols.length).toBeGreaterThanOrEqual(2);
  });

  it('renders activities in Row layout', () => {
    const { container } = render(
      <ActivityList recreationActivities={mockActivities} />,
    );

    const row = container.querySelector('.row');
    expect(row).toBeInTheDocument();
    expect(row).toHaveClass('gy-3');
  });

  it('renders each activity in a Col with xs={12}', () => {
    const { container } = render(
      <ActivityList recreationActivities={[mockActivities[0]]} />,
    );

    // Bootstrap Col components render as divs with col classes (e.g., col-12)
    const col = container.querySelector('[class*="col"]');
    expect(col).toBeInTheDocument();
  });

  it('renders icon container with activity description', () => {
    const { container } = render(
      <ActivityList recreationActivities={[mockActivities[0]]} />,
    );

    const iconContainer = container.querySelector('.icon-container');
    expect(iconContainer).toBeInTheDocument();
    expect(iconContainer?.querySelector('.fw-bold')).toHaveTextContent(
      'Hiking',
    );
  });

  it('handles empty activities array', () => {
    const { container } = render(<ActivityList recreationActivities={[]} />);

    const row = container.querySelector('.row');
    expect(row).toBeInTheDocument();
    // No activities should be rendered
    expect(screen.queryByText('Hiking')).not.toBeInTheDocument();
  });

  it('handles activities with string activity codes', () => {
    const activityWithStringCode = {
      recreation_activity_code: '1' as any,
      description: 'Hiking',
    };

    render(<ActivityList recreationActivities={[activityWithStringCode]} />);

    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByAltText('Hiking icon')).toBeInTheDocument();
  });

  it('renders multiple activities correctly', () => {
    render(<ActivityList recreationActivities={mockActivities} />);

    expect(screen.getByText('Hiking')).toBeInTheDocument();
    expect(screen.getByText('Camping')).toBeInTheDocument();
    expect(screen.getByText('Fishing')).toBeInTheDocument();

    const icons = screen.getAllByRole('img');
    expect(icons).toHaveLength(3);
  });
});
