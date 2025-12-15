import { Row } from 'react-bootstrap';
import './ActivitiesList.scss';
import { Activity } from './Activity';
import { LandingPageActivity } from './interfaces';

export const ActivitiesList = () => {
  const activities: LandingPageActivity[] = [
    {
      title: 'Camping',
      description: 'Relax and unplug in the great outdoors.',
      imageUrl:
        'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/1/3/3/1/1_fb0e63515869888/11331_f8ea0bc433cf3dc.webp?v=1740081814',
      activityFilter: 32,
    },
    {
      title: 'Angling',
      description: 'Catch fish in pristine waters.',
      imageUrl:
        'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/8/2/3/1/1_e09ae51d24b66c9/11328_79f0c8499cb4ede.webp?v=1740081796',
      activityFilter: 1,
    },
    {
      title: 'Other Activity',
      description: 'Enjoy this other activity.',
      imageUrl:
        'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/5/3/3/1/1_b78e49a9d594da5/11335_3eb13a251129d29.webp?v=1740081841',
      activityFilter: 16,
    },
    {
      title: 'Camping',
      description: 'Relax and unplug in the great outdoors.',
      imageUrl:
        'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/1/3/3/1/1_fb0e63515869888/11331_f8ea0bc433cf3dc.webp?v=1740081814',
      activityFilter: 32,
    },
    {
      title: 'Angling',
      description: 'Catch fish in pristine waters.',
      imageUrl:
        'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/8/2/3/1/1_e09ae51d24b66c9/11328_79f0c8499cb4ede.webp?v=1740081796',
      activityFilter: 1,
    },
    {
      title: 'Other Activity',
      description: 'Enjoy this other activity.',
      imageUrl:
        'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/filestore/5/3/3/1/1_b78e49a9d594da5/11335_3eb13a251129d29.webp?v=1740081841',
      activityFilter: 16,
    },
  ];
  return (
    <section className={`content-section`}>
      <h1 className="title">Find sites and trails by activity</h1>
      <Row className="g-3">
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
