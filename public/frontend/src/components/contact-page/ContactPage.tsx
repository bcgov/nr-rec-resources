import { SectionHeading } from '@/components/landing-page/components';
import PageMenu from '@/components/layout/PageMenu';
import { useEffect, useMemo, useRef, useState } from 'react';
import useScrollSpy from 'react-use-scrollspy';
import './ContactPage.scss';
import { Form, Stack, Container, Row, Col, Image } from 'react-bootstrap';
import rapp_logo from './assets/rapp_logo.jpg';
import bc_wildfire_app_logo from './assets/bc_wildfire_app_logo.png';
import { getContactEmailLink } from '@/utils/getContactEmailLink';

export const ContactPage = () => {
  const [selectedTopic, setSelectedTopic] = useState(
    'Reservations, fees, and discounts',
  );

  const renderContactDetails = () => {
    switch (selectedTopic) {
      case 'Reservations, fees, and discounts':
        return (
          <section className="contact-page__section contact-page__details">
            <h4 className="contact-page__details-title">
              Reservations, fees, and discounts
            </h4>
            <p className="contact-page__details-desc">
              <strong>
                The majority of recreation sites are on a "first come, first
                served" basis and cannot be booked ahead of time.
              </strong>
            </p>
            <p className="contact-page__details-desc">
              Check the description section of the site you're interested in to
              get more details about fees and reservations.
            </p>
            <Stack gap={3}>
              <a href="#">Reservations, fees, and discounts</a>
              <a href="#">Search for a site or trail</a>
            </Stack>
          </section>
        );
      case 'Site or Trail':
        return (
          <section className="contact-page__section contact-page__details">
            <Stack gap={3}>
              <h4 className="contact-page__email-title">Email</h4>
              <p className="mb-0">
                We answer emails weekdays from 8:30am to 4:30pm Pacific Time. We
                make every effort to respond within a week, but it may take
                longer during peak summer season.
              </p>
              <a href={getContactEmailLink()}>recinfo@gov.bc.ca</a>
            </Stack>
          </section>
        );
      case 'I cannot find what I’m looking for':
        return (
          <section className="contact-page__section contact-page__details">
            <Stack gap={3}>
              <h4 className="contact-page__email-title">Email</h4>
              <p className="mb-0">
                We answer emails weekdays from 8:30am to 4:30pm Pacific Time. We
                make every effort to respond within a week, but it may take
                longer during peak summer season.
              </p>
              <a href={getContactEmailLink()}>recinfo@gov.bc.ca</a>
            </Stack>
          </section>
        );
      case 'Wildfires and Campfire Bans':
        return (
          <section className="contact-page__section contact-page__details">
            <h3 className="contact-page__details-title">
              Wildfires and Campfire Bans
            </h3>
            <p className="contact-page__details-desc">
              <Stack gap={3}>
                <Image src={bc_wildfire_app_logo} width={78} height={78} />
                <div>
                  <strong>WildfireBC</strong>
                  <div>
                    Visit{' '}
                    <a
                      href="https://wildfiresituation.nrs.gov.bc.ca/map"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WildfireBC
                    </a>{' '}
                    for more information.
                  </div>
                </div>
                <div>
                  <strong>Report a Wildfire</strong>
                  <br />
                  <a href="tel:18006635555">1 800 663-5555</a> or{' '}
                  <a href="tel:*5555">*5555 on a cell</a>
                </div>
                <div>
                  <strong>Wildfire Information Line</strong>
                  <br />
                  <a href="tel:18883367378">1 888 336-7378</a>
                </div>
                <div>
                  <strong>Burn Registration Line</strong>
                  <br />
                  <a href="tel:18887971717">1 888 797-1717</a>
                </div>
                <div>
                  <strong>Campfire Bans</strong>
                  <br />
                  <a
                    href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn more about fire prohibitions and restrictions
                  </a>
                </div>
              </Stack>
            </p>
          </section>
        );
      case 'Report All Poachers and Polluters':
        return (
          <section className="contact-page__section contact-page__details">
            <h3 className="contact-page__details-title">
              Report All Poachers and Polluters (RAPP)
            </h3>
            <p className="contact-page__details-desc">
              Use the{' '}
              <a href="https://forms.gov.bc.ca/environment/rapp/">RAPP form</a>{' '}
              to report known or suspected violations of fisheries, wildlife, or
              environmental protection laws, except salmon-related violations.
            </p>
            <Image src={rapp_logo} />
          </section>
        );
      case 'Report a Natural Resource Violation':
        return (
          <section className="contact-page__section contact-page__details">
            <h3 className="contact-page__details-title">
              Report a Natural Resource Violation
            </h3>
            <p className="contact-page__details-desc">
              Use the{' '}
              <a href="https://forms.gov.bc.ca/industry/report-a-natural-resource-violation">
                Natural Resource Violation form
              </a>{' '}
              if you wish to report an unauthorized activity (a contravention of
              the law) or a contravention of an authorization (licence, lease,
              etc.).
            </p>
          </section>
        );
      default:
        return null;
    }
  };

  // Page sections for PageMenu
  const pageSections = [
    { sectionIndex: 0, href: '#popular-inquiries', title: 'Popular inquiries' },
    { sectionIndex: 1, href: '#contact-us', title: 'Contact us' },
  ];

  // Refs for scroll spy
  const popularInquiriesRef = useRef<HTMLElement>(null!);
  const contactUsRef = useRef<HTMLElement>(null!);
  const sectionRefs = useMemo(() => [popularInquiriesRef, contactUsRef], []);
  const activeScrollSection = useScrollSpy({
    sectionElementRefs: sectionRefs,
    offsetPx: -100,
  });

  // todo: move all this logic into pageview
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    setActiveSection(activeScrollSection ?? 0);
  }, [activeScrollSection]);

  const handleMenuClick = (sectionIndex: number) => {
    setActiveSection(sectionIndex);
    const sectionRef = sectionRefs[sectionIndex];
    console.log(`Navigating to section: ${sectionIndex}`);
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-container">
      <Container className="page contact-page">
        <h1 className="contact-page__title">
          Contact Recreation Sites and Trails
        </h1>
        <Row>
          <Col md={3} className="contact-page__sidebar">
            <PageMenu
              pageSections={pageSections}
              activeSection={activeSection}
              onMenuClick={handleMenuClick}
            />
          </Col>
          <Col md={9} className="contact-page__main">
            <section
              id="popular-inquiries"
              className="contact-page__section"
              ref={popularInquiriesRef}
            >
              <SectionHeading>Popular inquiries</SectionHeading>
              <p className="contact-page__section-desc">
                If you have a quick question, these links might provide your
                answer.
              </p>
              <h3 className="contact-page__topics-title">Popular topics</h3>
              <Stack gap={3} className="contact-page__topics-list">
                <a href="#">Reservations, fees, and discounts</a>
                <a href="#">Rules and etiquette</a>
                <a href="#">Campfires</a>
                <a href="#">Planning your trip</a>
              </Stack>
            </section>
            <section
              id="contact-us"
              className="contact-page__section"
              ref={contactUsRef}
            >
              <SectionHeading>Contact us</SectionHeading>

              <p className="contact-page__section-desc">
                If you're unable to find the answer to your questions, or if you
                have a specific question or comment, please fill out the
                following information.
              </p>
              <Form className="contact-page__form">
                <Form.Group
                  controlId="topic"
                  className="contact-page__form-group"
                >
                  <Form.Label className="contact-page__form-label">
                    Topic
                  </Form.Label>
                  <Form.Select
                    className="contact-page__form-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    required
                  >
                    <optgroup label="General">
                      <option>Reservations, fees, and discounts</option>
                      <option>Site or Trail</option>
                      <option>I cannot find what I’m looking for</option>
                      <option>Wildfires and Campfire Bans</option>
                    </optgroup>
                    <optgroup label="Report a violation">
                      <option>Report All Poachers and Polluters</option>
                      <option>Report a Natural Resource Violation</option>
                    </optgroup>
                  </Form.Select>
                </Form.Group>
              </Form>
              {renderContactDetails()}
            </section>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
