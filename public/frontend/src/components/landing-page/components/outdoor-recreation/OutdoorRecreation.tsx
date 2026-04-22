import { Container, Row } from 'react-bootstrap';
import { RECREATION_RESOURCE_TYPES_PUBLIC } from '@shared/constants/types';
import siteTree from '@/images/icons/site-tree.svg';
import trailFlag from '@/images/icons/trail-flag.svg';
import forestPlant from '@/images/icons/forest-plant.svg';
import siteTreeMobile from '@/images/icons/site-tree-mobile.svg';
import trailFlagMobile from '@/images/icons/trail-flag-mobile.svg';
import forestPlantMobile from '@/images/icons/forest-plant-mobile.svg';
import './OutdoorRecreation.scss';
import { Topic } from './interfaces';
import { OutdoorRecreationTopic } from './OutdoorRecreationTopic';
import { ROUTE_PATHS } from '@/constants/routes';

export const OutdoorRecreation = () => {
  const outdoorRecreationTopics: Topic[] = [
    {
      icon: siteTree,
      mobileIcon: siteTreeMobile,
      title: '1455+',
      description:
        'Recreation Sites: Discover a great spot for camping, hiking, or picnicking—perfect for enjoying the outdoors.',
      linkText: 'Explore sites',
      type: RECREATION_RESOURCE_TYPES_PUBLIC.RECREATION_SITE,
    },
    {
      icon: trailFlag,
      mobileIcon: trailFlagMobile,
      title: '750+',
      description:
        'Recreation Trails: Follow a marked path for walking, hiking, or cycling through beautiful scenery.',
      linkText: 'Explore trails',
      type: RECREATION_RESOURCE_TYPES_PUBLIC.RECREATION_TRAIL,
    },
    {
      icon: forestPlant,
      mobileIcon: forestPlantMobile,
      title: '10+',
      description:
        'Interpretive Forests: Learn and connect with nature through educational displays and trails.',
      linkText: 'Explore interpretive forests',
      type: RECREATION_RESOURCE_TYPES_PUBLIC.INTERPRETIVE_FOREST,
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
        <Container className="d-flex justify-content-center map-image-container">
          <a
            href={`${ROUTE_PATHS.HOME}${'search?view=map'}`}
            className="d-flex align-items-center"
          >
            <img
              src="/images/landing-page/activities/map_landing.png"
              alt="map image"
              className="d-none d-md-block desktop-image"
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
