import { SectionHeading } from '@/components/landing-page/components';
import { PageWithScrollMenu } from '@/components/layout/PageWithScrollMenu';
import './ContactPage.scss';
import { Form, Stack } from 'react-bootstrap';
import { useEffect } from 'react';
import { trackEvent } from '@shared/utils';
import { MATOMO_TRACKING_CATEGORY_CONTACT_PAGE } from '@/data/analytics';
import PageTitle from '@/components/layout/PageTitle';
import { Breadcrumbs } from '@shared/components/breadcrumbs';
import { type ContactTopic } from './utils/contactDetailsRenderer';
import { useContactPage } from './hooks/useContactPage';
import {
  CONTACT_PAGE_PAGE_SECTIONS,
  CONTACT_PAGE_POPULAR_TOPIC_LINKS,
  CONTACT_TOPIC_LABELS,
  CONTACT_TOPICS,
} from '@/components/contact-page/constants';

export const ContactPage = () => {
  const {
    selectedTopic,
    setSelectedTopic,
    contactDetailsComponent,
    pageTitle,
  } = useContactPage();

  useEffect(() => {
    trackEvent({
      category: MATOMO_TRACKING_CATEGORY_CONTACT_PAGE,
      action: `${MATOMO_TRACKING_CATEGORY_CONTACT_PAGE} - Page Load`,
    });
  }, []);

  return (
    <div className="page-container">
      <PageTitle title={pageTitle} />
      <div className="page contact-page">
        <Breadcrumbs className="mb-4" />
        <Stack gap={4} direction="vertical">
          <h1>Contact Recreation Sites and Trails</h1>
          <PageWithScrollMenu
            sections={CONTACT_PAGE_PAGE_SECTIONS}
            className="contact-page__page-menu"
          >
            {(sectionRefs) => (
              <>
                <section
                  id="popular-inquiries"
                  className="contact-page__section"
                  ref={sectionRefs[0]}
                >
                  <SectionHeading>Popular inquiries</SectionHeading>
                  <p className="contact-page__section-desc">
                    If you have a quick question, these links might provide your
                    answer.
                  </p>
                  <h3 className="contact-page__topics-title">Popular topics</h3>
                  <Stack gap={3} className="contact-page__topics-list">
                    {CONTACT_PAGE_POPULAR_TOPIC_LINKS.map(({ text, url }) => (
                      <a
                        key={text}
                        target="_blank"
                        href={url}
                        rel="noopener noreferrer"
                      >
                        {text}
                      </a>
                    ))}
                  </Stack>
                </section>
                <section
                  id="contact-us"
                  className="contact-page__section"
                  ref={sectionRefs[1]}
                >
                  <SectionHeading>Contact us</SectionHeading>

                  <p className="contact-page__section-desc">
                    If you're unable to find the answer to your questions, or if
                    you have a specific question or comment, please fill out the
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
                        onChange={(e) => {
                          setSelectedTopic(e.target.value as ContactTopic);
                          trackEvent({
                            category: MATOMO_TRACKING_CATEGORY_CONTACT_PAGE,
                            action: `${MATOMO_TRACKING_CATEGORY_CONTACT_PAGE} - Dropdown Selection`,
                            name: e.target.value,
                          });
                        }}
                        required
                      >
                        <optgroup label="General">
                          <option value={CONTACT_TOPICS.RESERVATIONS}>
                            {CONTACT_TOPIC_LABELS[CONTACT_TOPICS.RESERVATIONS]}
                          </option>
                          <option value={CONTACT_TOPICS.SITE_OR_TRAIL}>
                            {CONTACT_TOPIC_LABELS[CONTACT_TOPICS.SITE_OR_TRAIL]}
                          </option>
                          <option value={CONTACT_TOPICS.CANNOT_FIND}>
                            {CONTACT_TOPIC_LABELS[CONTACT_TOPICS.CANNOT_FIND]}
                          </option>
                          <option value={CONTACT_TOPICS.WILDFIRES}>
                            {CONTACT_TOPIC_LABELS[CONTACT_TOPICS.WILDFIRES]}
                          </option>
                        </optgroup>
                        <optgroup label="Report a violation">
                          <option value={CONTACT_TOPICS.RAPP}>
                            {CONTACT_TOPIC_LABELS[CONTACT_TOPICS.RAPP]}
                          </option>
                          <option
                            value={CONTACT_TOPICS.NATURAL_RESOURCE_VIOLATION}
                          >
                            {
                              CONTACT_TOPIC_LABELS[
                                CONTACT_TOPICS.NATURAL_RESOURCE_VIOLATION
                              ]
                            }
                          </option>
                        </optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Form>
                  {contactDetailsComponent}
                </section>
              </>
            )}
          </PageWithScrollMenu>
        </Stack>
      </div>
    </div>
  );
};
