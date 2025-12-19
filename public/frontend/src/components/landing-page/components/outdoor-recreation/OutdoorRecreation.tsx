import { Container, Row } from 'react-bootstrap';
import campground from '@/images/icons/campground.svg';
import flag from '@/images/icons/flag.svg';
import tree from '@/images/icons/tree.svg';
import campgroundMobile from '@/images/icons/campground-mobile.svg';
import flagMobile from '@/images/icons/flag-mobile.svg';
import treeMobile from '@/images/icons/tree-mobile.svg';
import './OutdoorRecreation.scss';
import { Topic } from './interfaces';
import { OutdoorRecreationTopic } from './OutdoorRecreationTopic';
import { ROUTE_PATHS } from '@/constants/routes';

export const OutdoorRecreation = () => {
  const outdoorRecreationTopics: Topic[] = [
    {
      icon: campground,
      mobileIcon: campgroundMobile,
      title: '1455+',
      description:
        'Recreation Site: Discover a great spot for camping, hiking, or picnicking—perfect for enjoying the outdoors.',
      linkText: 'Explore sites',
      type: 'SIT',
    },
    {
      icon: flag,
      mobileIcon: flagMobile,
      title: '750+',
      description:
        'Recreation Trail: Follow a marked path for walking, hiking, or cycling through beautiful scenery.',
      linkText: 'Explore trails',
      type: 'RTR',
    },
    {
      icon: tree,
      mobileIcon: treeMobile,
      title: '10+',
      description:
        'Interpretive Forests: Learn and connect with nature through educational displays and trails.',
      linkText: 'Explore interpretive forests',
      type: 'IF',
    },
  ];
  return (
    <section>
      <div className="description">
        Recreation Sites and Trails B.C. (RSTBC) provides public recreation
        opportunities by developing, maintaining and managing a network of
        recreation sites and recreation trails throughout the province.
      </div>
      <Row>
        {outdoorRecreationTopics.map((topic, index) => {
          return (
            <OutdoorRecreationTopic
              icon={topic.icon}
              mobileIcon={topic.mobileIcon}
              title={topic.title}
              description={topic.description}
              linkText={topic.linkText}
              type={topic.type}
              key={index}
            />
          );
        })}
        <Container className="d-flex map-image-container">
          <a href={`${ROUTE_PATHS.HOME}${'search?view=map'}`}>
            <img
              src="/images/landing-page/activities/map_landing.png"
              alt="map image"
              className="d-none d-md-block desktop-image"
              width={1080}
              height={348}
            />
            <img
              src="/images/landing-page/activities/map_landing_mobile.png"
              alt="map image"
              className="d-block d-md-none"
              width={343}
              height={348}
            />
          </a>
        </Container>
      </Row>
    </section>
  );
};
