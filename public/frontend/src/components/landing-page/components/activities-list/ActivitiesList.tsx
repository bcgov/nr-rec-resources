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
      mobileImageUrl: '/images/landing-page/activities/camping_mobile.png',
      activityFilter: 32,
    },
    {
      title: 'Angling',
      description: 'Catch fish in pristine waters.',
      imageUrl: '/images/landing-page/activities/angling.jpg',
      mobileImageUrl: '/images/landing-page/activities/angling_mobile.png',
      activityFilter: 1,
    },
    {
      title: 'Hiking',
      description: 'Explore scenic trails and hiking.',
      imageUrl: '/images/landing-page/activities/hiking.jpg',
      mobileImageUrl: '/images/landing-page/activities/hiking_mobile.png',
      activityFilter: 12,
    },
    {
      title: 'Four wheel driving',
      description: 'Explore wild landscapes and remote terrain.',
      imageUrl: '/images/landing-page/activities/driving.jpg',
      mobileImageUrl: '/images/landing-page/activities/driving_mobile.png',
      activityFilter: 21,
    },
    {
      title: 'Boating',
      description: 'Glide across serene lakes or coastal waters.',
      imageUrl: '/images/landing-page/activities/boating.jpg',
      mobileImageUrl: '/images/landing-page/activities/boating_mobile.png',
      activityFilter: 2,
    },
    {
      title: 'Swimming and bathing',
      description: 'Refresh and soak up nature’s tranquility.',
      imageUrl: '/images/landing-page/activities/swimming.jpg',
      mobileImageUrl: '/images/landing-page/activities/swimming_mobile.png',
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
              mobileImageUrl={activity.mobileImageUrl}
              activityFilter={activity.activityFilter}
              key={index}
            />
          );
        })}
      </Row>
    </section>
  );
};
