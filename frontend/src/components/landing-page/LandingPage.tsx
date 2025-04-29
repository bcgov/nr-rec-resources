import { FC } from 'react';
import { Button, Stack } from 'react-bootstrap';
import './LandingPage.scss';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { trackClickEvent } from '@/utils/matomo';
import { EXTERNAL_LINKS } from '@/data/urls';
import {
  ContentSection,
  RecreationSearchBanner,
  SectionHeading,
} from '@/components/landing-page/components';
import {
  LANDING_PAGE_IMAGE_BASE_PATHS,
  SECTION_HEADING_LEVEL,
} from '@/components/landing-page/constants';

const LearnMoreLink: FC = () => (
  <div className="learn-more-link">
    <a
      href={EXTERNAL_LINKS.RST_GOV_BC_INFO}
      rel="noopener noreferrer"
      onClick={trackClickEvent({
        category: 'Learn More',
        name: 'Learn more about Recreation Sites and Trails BC',
      })}
      aria-label="Learn more about Recreation Sites and Trails BC"
    >
      <Stack direction="horizontal" gap={1} className="align-items-center">
        Learn more about Recreation Sites and Trails BC{' '}
        <FontAwesomeIcon icon={faChevronRight} aria-hidden={true} />
      </Stack>
    </a>
  </div>
);

const FeedbackButton: FC = () => (
  <Button
    variant="primary"
    href={EXTERNAL_LINKS.FEEDBACK_FORM}
    rel="noopener noreferrer"
    aria-label="Share your feedback (opens in a new tab)"
  >
    Share your feedback
  </Button>
);

export const LandingPage: FC = () => {
  return (
    <>
      <RecreationSearchBanner />
      <Stack
        direction="vertical"
        className="info-section align-items-center my-5"
        aria-label="Information about Recreation Sites and Trails BC"
        gap={5}
      >
        <ContentSection
          aria-label="Welcome to the new Recreation Sites and Trails BC beta site!"
          headingComponent={
            <h1>
              Welcome to the new Recreation Sites and Trails BC beta site!
            </h1>
          }
          sectionContent={
            <>
              <p>
                We're building a new site to help you better learn about, visit,
                and enjoy the recreation sites and trails we all care for
                deeply.
              </p>
              <p>
                This new beta version of sitesandtrailsbc.ca is just the
                beginning. We'll continue improving the site based on research
                with the people who use it. It will be an evolving,
                collaborative work in progress.
              </p>
              <p>
                Share in the adventure. We'd love for you to{' '}
                <a
                  rel="noreferrer noopener"
                  className="research-signup-link"
                  href={EXTERNAL_LINKS.RESEARCH_PARTICIPANT_SIGN_UP}
                >
                  join us
                </a>
                .
              </p>
            </>
          }
          imageBasePath={LANDING_PAGE_IMAGE_BASE_PATHS.WELCOME}
          imageAlt="Research illustration"
        />

        <ContentSection
          aria-label="Research process"
          headingComponent={
            <SectionHeading as={SECTION_HEADING_LEVEL}>
              Human-centred, research-driven
            </SectionHeading>
          }
          sectionContent={
            <>
              <p>
                Our digital services will be simple, streamlined, and
                human-centred. We'll make improvements based on real-world user
                experience research and testing. Are you interested in being
                part of improving our services? Please share your feedback on
                the new site.
              </p>
              <FeedbackButton />
            </>
          }
          imageBasePath={LANDING_PAGE_IMAGE_BASE_PATHS.HUMAN_CENTERED}
          imageAlt="Research process"
          imageFirst
        />

        <ContentSection
          aria-label="New interactive map"
          headingComponent={
            <SectionHeading as={SECTION_HEADING_LEVEL}>
              New interactive map coming soon
            </SectionHeading>
          }
          sectionContent={
            <>
              <p>
                Look out for a new interactive map that will make it easier for
                you to find recreation sites and trails near you, and on the way
                to wherever you are headed.
              </p>
              <p className="mb-0">
                In the meantime, you can still use our original interactive map
                to explore places to go, road conditions, and important wildfire
                information.
              </p>
            </>
          }
          imageBasePath={LANDING_PAGE_IMAGE_BASE_PATHS.MAP}
          imageAlt="Site sign"
        />

        <ContentSection
          aria-label="About Recreation Sites and Trails BC"
          headingComponent={
            <SectionHeading as={SECTION_HEADING_LEVEL}>
              About Recreation Sites and Trails BC
            </SectionHeading>
          }
          sectionContent={
            <>
              <p>
                Recreation Sites and Trails BC provides public recreation
                opportunities by developing, maintaining, and managing a network
                of trails and recreation areas throughout the province.
              </p>
              <LearnMoreLink />
            </>
          }
          imageBasePath={LANDING_PAGE_IMAGE_BASE_PATHS.SITE_SIGN}
          imageAlt="Recreation site sign"
          imageFirst
        />
      </Stack>
    </>
  );
};
