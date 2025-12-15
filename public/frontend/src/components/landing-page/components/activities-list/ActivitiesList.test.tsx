import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActivitiesList } from './ActivitiesList';

/**
 * Mock Activity component
 */
const activityMock = vi.fn();

vi.mock('./Activity', () => ({
  Activity: (props: any) => {
    activityMock(props);
    return <div data-testid="activity-mock">{props.title}</div>;
  },
}));

describe('ActivitiesList', () => {
  it('renders section, title, and all activities with correct props', () => {
    render(<ActivitiesList />);

    // Section title
    expect(
      screen.getByRole('heading', { name: 'Activities List' }),
    ).toBeInTheDocument();

    // Activity components rendered
    const activities = screen.getAllByTestId('activity-mock');
    expect(activities).toHaveLength(6);

    // Activity called correct number of times
    expect(activityMock).toHaveBeenCalledTimes(6);

    // Validate props passed to Activity (spot-check all unique entries)
    expect(activityMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: 'Camping',
        description: 'Relax and unplug in the great outdoors.',
        activityFilter: 32,
      }),
    );

    expect(activityMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        title: 'Angling',
        description: 'Catch fish in pristine waters.',
        activityFilter: 1,
      }),
    );

    expect(activityMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        title: 'Other Activity',
        description: 'Enjoy this other activity.',
        activityFilter: 16,
      }),
    );
  });
});
