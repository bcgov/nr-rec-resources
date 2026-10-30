import { RecResourceAdaptiveActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/RecResourceAdaptiveActivitiesSection';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/AdaptiveActivityList',
  () => ({
    AdaptiveActivityList: ({
      recreationActivities,
    }: {
      recreationActivities: any[];
    }) => (
      <div data-testid="adaptive-activity-list">
        {recreationActivities.length} activities
      </div>
    ),
  }),
);

describe('RecResourceAdaptiveActivitiesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the "Accessible activities" heading', () => {
    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Accessible activities' }),
    ).toBeInTheDocument();
  });

  it('shows empty state message when recreationActivities is empty', () => {
    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(
      screen.getByText('No accessible activities assigned.'),
    ).toBeInTheDocument();
  });

  it('does not render AdaptiveActivityList when activities list is empty', () => {
    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={[]}
      />,
    );

    expect(
      screen.queryByTestId('adaptive-activity-list'),
    ).not.toBeInTheDocument();
  });

  it('renders AdaptiveActivityList when activities are provided', () => {
    const activities = [
      {
        recreation_activity_code: 34,
        description: 'Adaptive Hiking',
        is_accessible: true,
      },
    ];

    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={activities as any}
      />,
    );

    expect(screen.getByTestId('adaptive-activity-list')).toBeInTheDocument();
    expect(screen.getByTestId('adaptive-activity-list')).toHaveTextContent(
      '1 activities',
    );
  });

  it('does not show empty state message when activities are provided', () => {
    const activities = [
      {
        recreation_activity_code: 34,
        description: 'Adaptive Hiking',
        is_accessible: true,
      },
    ];

    render(
      <RecResourceAdaptiveActivitiesSection
        recResourceId="REC0001"
        recreationActivities={activities as any}
      />,
    );

    expect(
      screen.queryByText('No accessible activities assigned.'),
    ).not.toBeInTheDocument();
  });
});
