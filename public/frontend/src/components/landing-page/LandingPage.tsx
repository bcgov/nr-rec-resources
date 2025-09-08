import { FC } from 'react';
import { Button, Stack } from 'react-bootstrap';
import './LandingPage.scss';
import { trackClickEvent } from '@/utils/matomo';
import { EXTERNAL_LINKS } from '@/data/urls';
import {
  ContentSection,
  InfoBanner,
  RecreationSearchBanner,
  SectionHeading,
} from '@/components/landing-page/components';
import {
  LANDING_PAGE_IMAGE_BASE_PATHS,
  SECTION_HEADING_LEVEL,
} from '@/components/landing-page/constants';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/routes';

const LearnMoreLink: FC = () => (
  <Button
    href={EXTERNAL_LINKS.RST_GOV_BC_INFO}
    rel="noopener noreferrer"
    onClick={trackClickEvent({
      category: 'Learn More',
      name: 'Learn more about us',
    })}
    aria-label="Learn more about us"
  >
    Learn more about us
  </Button>
);

const FeedbackButton: FC = () => (
  <Button
    href={EXTERNAL_LINKS.FEEDBACK_FORM}
    rel="noopener noreferrer"
    aria-label="Share your feedback (opens in a new tab)"
  >
    Share your feedback
  </Button>
);

const SearchMapButton: FC = () => (
  <Link
    to={{ pathname: ROUTE_PATHS.SEARCH, search: 'view=map' }}
    className="btn btn-primary text-white"
    onClick={trackClickEvent({
      category: 'Internal link',
      name: 'Search map',
    })}
    aria-label="Open the interactive map"
  >
    View interactive map
  </Link>
);

export const LandingPage: FC = () => {
  return (
    <>
      <RecreationSearchBanner />
      <InfoBanner />
      <Stack
        direction="vertical"
        className="info-section align-items-center my-5 content-footer-spacing"
        aria-label="Information about Recreation Sites and Trails BC"
        gap={5}
      >
        <ContentSection
          aria-label="Welcome to the new Recreation Sites and Trails BC beta site"
          headingComponent={
            <h1>Welcome to the new Recreation Sites and Trails BC beta site</h1>
          }
          sectionContent={
            <>
              <p>
                We're launching a new site to help you discover, explore, and
                enjoy the recreation areas and trails we all cherish.
              </p>
              <p>
                This beta version is just the beginning. We're committed to
                improving it through ongoing research and feedback from people
                like you. It’s a collaborative, evolving project—and we’d love
                for you to be part of the journey.
              </p>
              <p>
                <a
                  rel="noreferrer noopener"
                  className="research-signup-link"
                  href={EXTERNAL_LINKS.RESEARCH_PARTICIPANT_SIGN_UP}
                >
                  Sign up
                </a>{' '}
                to join our design research and help shape what comes next.
              </p>
              <FeedbackButton />
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
                Our digital services are designed to be simple, streamlined, and
                centered around real people.
              </p>
              <p>
                We’re continuously improving them through real-world research
                and user testing. Want to help shape the future of these
                services? Share your feedback on the new site—we’d love to hear
                from you.
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
              New interactive map launched
            </SectionHeading>
          }
          sectionContent={
            <>
              <p>
                Our new interactive map helps you easily find recreation sites
                and trails near you—or along your journey.
              </p>
              <p>
                While we work to continuously improve this map, you can still
                use the{' '}
                <a
                  rel="noreferrer noopener"
                  className="research-signup-link"
                  href={EXTERNAL_LINKS.LEGACY_SITE}
                >
                  legacy interactive map
                </a>{' '}
                to explore destinations, check road conditions, and stay
                informed about wildfire updates.
              </p>
              <SearchMapButton />
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
