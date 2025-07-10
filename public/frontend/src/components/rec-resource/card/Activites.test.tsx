import { render, screen } from '@testing-library/react';
import Activities from '@/components/rec-resource/card/Activities';
import { mockActivities } from '@/components/rec-resource/section/ThingsToDo.test';

describe('the Activities component', () => {
  it('renders the activity icons', async () => {
    render(<Activities activities={mockActivities} />);
    const activityElement = screen.getByAltText(/Angling icon/i);
    const activityElement2 = screen.getByAltText(/Boating icon/i);
    const activityElement3 = screen.getByAltText(/Hiking icon/i);
    const activityElement4 = screen.getByAltText(/Camping icon/i);

    expect(activityElement).toBeInTheDocument();
    expect(activityElement2).toBeInTheDocument();
    expect(activityElement3).toBeInTheDocument();
    expect(activityElement4).toBeInTheDocument();
  });

  it('does not render activity icons that are not in the activityMap', async () => {
    render(<Activities activities={mockActivities} />);
    const activityElement = screen.queryByAltText(
      /Non existent activity icon/i,
    );

    expect(activityElement).not.toBeInTheDocument();
  });

  it('renders no more than MAX_ACTIVITIES_TO_DISPLAY activities', () => {
    const activities = Array.from({ length: 10 }, (_, i) => ({
      description: `Activity ${i + 1}`,
      recreation_activity_code: 1 + i,
    }));

    render(<Activities activities={activities} />);

    const renderedActivities = screen.getAllByRole('img');
    expect(renderedActivities).toHaveLength(4);
  });
});
