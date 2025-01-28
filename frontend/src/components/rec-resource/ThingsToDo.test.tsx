import { render, screen } from '@testing-library/react';
import ThingsToDo from '@/components/rec-resource/ThingsToDo';

export const mockActivities = [
  {
    description: 'Angling',
    recreation_activity_code: 1,
  },
  {
    description: 'Boating',
    recreation_activity_code: 2,
  },
  {
    description: 'Hiking',
    recreation_activity_code: 12,
  },
  {
    // This doesn't exist in the activityMap yet
    description: 'Beach Activities',
    recreation_activity_code: 8,
  },
  {
    description: 'Camping',
    recreation_activity_code: 32,
  },
];

describe('the ThingsToDo component', () => {
  it('renders the activity icons', async () => {
    render(<ThingsToDo activities={mockActivities} />);
    const activityElement = screen.getByAltText(/Angling icon/i);
    const activityElement2 = screen.getByAltText(/Boating icon/i);
    const activityElement3 = screen.getByAltText(/Hiking icon/i);
    const activityElement4 = screen.getByAltText(/Camping icon/i);

    expect(activityElement).toBeInTheDocument();
    expect(activityElement2).toBeInTheDocument();
    expect(activityElement3).toBeInTheDocument();
    expect(activityElement4).toBeInTheDocument();
  });

  it('renders the activity descriptions', async () => {
    render(<ThingsToDo activities={mockActivities} />);
    const activityElement = screen.getByText('Angling');
    const activityElement2 = screen.getByText('Boating');
    const activityElement3 = screen.getByText('Hiking');
    const activityElement4 = screen.getByText('Camping');

    expect(activityElement).toBeInTheDocument();
    expect(activityElement2).toBeInTheDocument();
    expect(activityElement3).toBeInTheDocument();
    expect(activityElement4).toBeInTheDocument();
  });

  it('does not render activity icons that are not in the activityMap', async () => {
    render(<ThingsToDo activities={mockActivities} />);
    const activityElement = screen.queryByAltText(/Beach Activities icon/i);

    expect(activityElement).not.toBeInTheDocument();
  });

  it('does not render activity descriptions that are not in the activityMap', async () => {
    render(<ThingsToDo activities={mockActivities} />);
    const activityElement = screen.queryByText('Beach Activities');

    expect(activityElement).not.toBeInTheDocument();
  });
});
