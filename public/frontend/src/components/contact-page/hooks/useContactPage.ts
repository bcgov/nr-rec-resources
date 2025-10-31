import { useCallback, useMemo, useState } from 'react';
import { getContactEmailLink } from '@/utils/getContactEmailLink';
import {
  type ContactTopic,
  renderContactDetails,
} from '@/components/contact-page/utils/contactDetailsRenderer';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { CONTACT_TOPICS } from '@/components/contact-page/constants';
import { ROUTE_TITLES } from '@/constants/routes';

interface UseContactPageReturn {
  // Contact form state
  selectedTopic: ContactTopic;
  setSelectedTopic: (topic: ContactTopic) => void;
  contactDetailsComponent: React.ReactNode;

  // Computed values
  emailLink: string;
  pageTitle: string;
}

/**
 * Comprehensive hook that manages all business logic for the ContactPage component
 * Handles contact form state and page structure
 */
export const useContactPage = (
  recResource: RecreationResourceDetailModel,
): UseContactPageReturn => {
  // Contact form state
  const [selectedTopic, setSelectedTopic] = useState<ContactTopic>(
    CONTACT_TOPICS.RESERVATIONS,
  );

  // Compute email link
  const emailLink = useMemo(
    () => getContactEmailLink(recResource),
    [recResource],
  );

  // Render contact details component
  const contactDetailsComponent = useMemo(
    () => renderContactDetails({ topic: selectedTopic, emailLink }),
    [selectedTopic, emailLink],
  );

  // Optimize topic change handler
  const handleTopicChange = useCallback((topic: ContactTopic) => {
    setSelectedTopic(topic);
  }, []);

  // Compute page title
  const pageTitle = useMemo(
    () => ROUTE_TITLES.REC_RESOURCE_CONTACT(recResource?.name),
    [recResource?.name],
  );

  return {
    // Contact form state
    selectedTopic,
    setSelectedTopic: handleTopicChange,
    contactDetailsComponent,

    // Computed values
    emailLink,
    pageTitle,
  };
};
