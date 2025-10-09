import { Image, Stack } from 'react-bootstrap';
import { CONTACT_TOPICS } from '@/components/contact-page/constants';
import rapp_logo from '@/components/contact-page/assets/rapp_logo.jpg';
import bc_wildfire_app_logo from '@/components/contact-page/assets/bc_wildfire_app_logo.png';
import { FC } from 'react';
import { trackClickEvent } from '@shared/utils';
import { MATOMO_TRACKING_CATEGORY_CONTACT_PAGE } from '@/data/analytics';
import { Link } from 'react-router';
import { ROUTE_PATHS } from '@/routes';

export type ContactTopic = (typeof CONTACT_TOPICS)[keyof typeof CONTACT_TOPICS];

interface ContactDetailsProps {
  topic: ContactTopic;
  emailLink: string;
}

const ReservationsSection: FC = () => (
  <section className="contact-page__section contact-page__details">
    <h3 className="contact-page__details-title">
      Reservations, fees, and discounts
    </h3>
    <p className="contact-page__details-desc">
      <strong>
        The majority of recreation sites are on a "first come, first served"
        basis and cannot be booked ahead of time.
      </strong>
    </p>
    <p className="contact-page__details-desc">
      Check the description section of the site you're interested in to get more
      details about fees and reservations.
    </p>
    <Stack gap={3}>
      <a
        href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/fees"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Reservations, fees, and discounts information (opens in new window)"
      >
        Reservations, fees, and discounts
      </a>
      <Link to={ROUTE_PATHS.SEARCH}>Search for a site or trail</Link>
    </Stack>
  </section>
);

const EmailSection: React.FC<{ emailLink: string }> = ({ emailLink }) => (
  <section className="contact-page__section contact-page__details">
    <Stack gap={3}>
      <h3 className="contact-page__email-title">Email</h3>
      <p className="mb-0">
        We answer emails weekdays from 8:30am to 4:30pm Pacific Time. We make
        every effort to respond within a week, but it may take longer during
        peak summer season.
      </p>
      <a
        href={emailLink}
        aria-label="Send email to recreation information"
        onClick={trackClickEvent({
          category: MATOMO_TRACKING_CATEGORY_CONTACT_PAGE,
          action: 'Email Link Click',
          name: 'recinfo@gov.bc.ca',
        })}
      >
        recinfo@gov.bc.ca
      </a>
    </Stack>
  </section>
);

const WildfiresSection: React.FC = () => (
  <section className="contact-page__section contact-page__details">
    <h3 className="contact-page__details-title">Wildfires and Campfire Bans</h3>
    <div className="contact-page__details-desc">
      <Stack gap={3}>
        <Image
          src={bc_wildfire_app_logo}
          width={78}
          height={78}
          alt="BC Wildfire Service logo"
        />
        <div>
          <strong>WildfireBC</strong>
          <div>
            Visit{' '}
            <a
              href="https://wildfiresituation.nrs.gov.bc.ca/map"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WildfireBC interactive map (opens in new window)"
            >
              WildfireBC
            </a>{' '}
            for more information.
          </div>
        </div>
        <div>
          <strong>Report a Wildfire</strong>
          <br />
          <a
            href="tel:+18006635555"
            aria-label="Call 1 800 663-5555 to report a wildfire"
          >
            1 800 663-5555
          </a>{' '}
          or{' '}
          <a
            href="tel:*5555"
            aria-label="Call *5555 from cell phone to report a wildfire"
          >
            *5555 on a cell
          </a>
        </div>
        <div>
          <strong>Wildfire Information Line</strong>
          <br />
          <a
            href="tel:+18883367378"
            aria-label="Call 1 888 336-7378 for wildfire information"
          >
            1 888 336-7378
          </a>
        </div>
        <div>
          <strong>Burn Registration Line</strong>
          <br />
          <a
            href="tel:+18887971717"
            aria-label="Call 1 888 797-1717 for burn registration"
          >
            1 888 797-1717
          </a>
        </div>
        <div>
          <strong>Campfire Bans</strong>
          <br />
          <a
            href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Learn more about fire prohibitions and restrictions (opens in new window)"
          >
            Learn more about fire prohibitions and restrictions
          </a>
        </div>
      </Stack>
    </div>
  </section>
);

const RAPPSection: React.FC = () => (
  <section className="contact-page__section contact-page__details">
    <h3 className="contact-page__details-title">
      Report All Poachers and Polluters (RAPP)
    </h3>
    <p className="contact-page__details-desc">
      Use the{' '}
      <a
        href="https://forms.gov.bc.ca/environment/rapp/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="RAPP online reporting form (opens in new window)"
      >
        RAPP form
      </a>{' '}
      to report known or suspected violations of fisheries, wildlife, or
      environmental protection laws, except salmon-related violations.
    </p>
    <Image
      src={rapp_logo}
      alt="Report All Poachers and Polluters (RAPP) program logo"
    />
  </section>
);

const NaturalResourceViolationSection: React.FC = () => (
  <section className="contact-page__section contact-page__details">
    <h3 className="contact-page__details-title">
      Report a Natural Resource Violation
    </h3>
    <p className="contact-page__details-desc">
      Use the{' '}
      <a
        href="https://forms.gov.bc.ca/industry/report-a-natural-resource-violation"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Natural Resource Violation reporting form (opens in new window)"
      >
        Natural Resource Violation form
      </a>{' '}
      if you wish to report an unauthorized activity (a contravention of the
      law) or a contravention of an authorization (licence, lease, etc.).
    </p>
  </section>
);

export const renderContactDetails = ({
  topic,
  emailLink,
}: ContactDetailsProps): React.ReactNode => {
  switch (topic) {
    case CONTACT_TOPICS.RESERVATIONS:
      return <ReservationsSection />;
    case CONTACT_TOPICS.SITE_OR_TRAIL:
    case CONTACT_TOPICS.CANNOT_FIND:
      return <EmailSection emailLink={emailLink} />;
    case CONTACT_TOPICS.WILDFIRES:
      return <WildfiresSection />;
    case CONTACT_TOPICS.RAPP:
      return <RAPPSection />;
    case CONTACT_TOPICS.NATURAL_RESOURCE_VIOLATION:
      return <NaturalResourceViolationSection />;
  }
};
