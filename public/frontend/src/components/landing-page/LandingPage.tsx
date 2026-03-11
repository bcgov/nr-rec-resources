import { FC } from 'react';
import { Button, Stack } from 'react-bootstrap';
import './LandingPage.scss';
import { EXTERNAL_LINKS } from '@/constants/urls';
import {
  ContentSection,
  RecreationSearchBanner,
} from '@/components/landing-page/components';
import { ActivitiesList } from './components/activities-list';
import { OutdoorRecreation } from './components/outdoor-recreation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';

const LearnMore: FC = () => (
  <Button
    className="flex-shrink-0"
    href={EXTERNAL_LINKS.PARTNERING}
    rel="noopener noreferrer"
    target="_blank"
    aria-label="Partnering and volunteering (opens in a new tab)"
  >
    Learn More&nbsp;
    <FontAwesomeIcon icon={faExternalLink} />
  </Button>
);

export const LandingPage: FC = () => {
  return (
    <>
      <RecreationSearchBanner />
      <Stack
        direction="vertical"
        className="info-section align-items-center my-5 content-footer-spacing"
        aria-label="Information about Recreation Sites and Trails BC"
        gap={1}
      >
        <ContentSection
          aria-label="Enjoy BC outdoor recreation"
          headingComponent={<h1>Enjoy BC outdoor recreation</h1>}
          sectionContent={<OutdoorRecreation />}
        />
        <ContentSection
          aria-label="Find sites and trails by activity"
          headingComponent={<h1>Find sites and trails by activity</h1>}
          sectionContent={<ActivitiesList />}
        />
        <ContentSection
          aria-label="Partnering and volunteering"
          headingComponent={<h1>Partnering and volunteering</h1>}
          sectionContent={
            <>
              <div className="d-none d-md-flex align-items-center gap-4 part-container">
                <p className="mb-0 flex-grow-1">
                  We partner with volunteer organizations through Stewardship
                  Partner Insurance Program (SPIP) agreements. These agreements
                  make it possible for Recreation Sites and Trails BC to
                  collaborate with First Nations, local governments, and
                  community groups. Volunteers play a vital role in keeping our
                  sites, trails, and recreation facilities safe and enjoyable
                  for everyone.
                </p>
                <LearnMore />
              </div>
              <div className="d-block d-md-none">
                <p>
                  We partner with volunteer organizations through Stewardship
                  Partner Insurance Program (SPIP) agreements.
                </p>
                <LearnMore />
              </div>
            </>
          }
        />
      </Stack>
    </>
  );
};
