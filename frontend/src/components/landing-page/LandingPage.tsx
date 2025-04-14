import { FC } from 'react';
import { Button, Stack } from 'react-bootstrap';
import './LandingPage.scss';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { EXTERNAL_LINKS } from '@/data/urls';
import {
  ContentSection,
  RecreationSearchBanner,
  SectionHeading,
} from '@/components/landing-page/components';
import { LANDING_PAGE_IMAGE_LINKS } from '@/components/landing-page/constants';

const LearnMoreLink: FC = () => (
  <div className="learn-more-link">
    <a
      href={EXTERNAL_LINKS.RST_GOV_BC_INFO}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Learn more about Recreation Sites and Trails BC About Recreation Sites and Trails BC"
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
    target="_blank"
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
        direction={'vertical'}
        className="info-section align-items-center my-5"
        aria-label="Information about Recreation Sites and Trails BC"
      >
        <ContentSection
          headingComponent={
            <h1>
              Welcome to the new Recreation Sites and Trails BC beta site!
            </h1>
          }
          content={
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
                  target="_blank"
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
          image={LANDING_PAGE_IMAGE_LINKS.WELCOME}
          imageAlt="Research illustration"
        />

        <ContentSection
          headingComponent={
            <SectionHeading>Human-centred, research-driven</SectionHeading>
          }
          content={
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
          image={LANDING_PAGE_IMAGE_LINKS.RESEARCH}
          imageAlt="Research process"
          imageFirst={true}
        />

        <ContentSection
          headingComponent={
            <SectionHeading>New interactive map coming soon</SectionHeading>
          }
          content={
            <p>
              Look out for a new interactive map that will make it easier for
              you to find recreation sites and trails near you.
            </p>
          }
          image={LANDING_PAGE_IMAGE_LINKS.MAP}
          imageAlt="Site sign"
        />

        <ContentSection
          headingComponent={
            <SectionHeading>
              About Recreation Sites and Trails BC
            </SectionHeading>
          }
          content={
            <>
              <p>
                Recreation Sites and Trails BC provides public recreation
                opportunities by developing, maintaining, and managing a network
                of trails and recreation areas throughout the province.
              </p>
              <LearnMoreLink />
            </>
          }
          image={LANDING_PAGE_IMAGE_LINKS.SITE_SIGN}
          imageAlt="Recreation site sign"
          imageFirst={true}
        />
      </Stack>
    </>
  );
};
