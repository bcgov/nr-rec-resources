import { Row } from 'react-bootstrap';
import './ActivitiesList.scss';
import { Activity } from './Activity';
import { LandingPageActivity } from './interfaces';

export const ActivitiesList = () => {
  const activities: LandingPageActivity[] = [
    {
      title: 'Camping',
      description: 'Relax and unplug in the great outdoors.',
      imageUrl: '/images/landing-page/activities/camping.jpg',
      activityFilter: 32,
    },
    {
      title: 'Angling',
      description: 'Catch fish in pristine waters.',
      imageUrl: '/images/landing-page/activities/angling.jpg',
      activityFilter: 1,
    },
    {
      title: 'Hiking',
      description: 'Explore scenic trails and hiking.',
      imageUrl: '/images/landing-page/activities/hiking.jpg',
      activityFilter: 12,
    },
    {
      title: 'Four wheel driving',
      description: 'Explore wild landscapes and remote terrain.',
      imageUrl: '/images/landing-page/activities/driving.jpg',
      activityFilter: 21,
    },
    {
      title: 'Boating',
      description: 'Glide across serene lakes or coastal waters.',
      imageUrl: '/images/landing-page/activities/boating.jpg',
      activityFilter: 2,
    },
    {
      title: 'Swimming and bathing',
      description: 'Refresh and soak up nature’s tranquility.',
      imageUrl: '/images/landing-page/activities/swimming.jpg',
      activityFilter: 7,
    },
  ];
  return (
    <section>
      <Row className="g-3 activities-container">
        {activities.map((activity, index) => {
          return (
            <Activity
              title={activity.title}
              description={activity.description}
              imageUrl={activity.imageUrl}
              activityFilter={activity.activityFilter}
              key={index}
            />
          );
        })}
      </Row>
    </section>
  );
};
