import { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { useGetRecreationResourceById } from '@/service/queries/recreation-resource/recreationResourceQueries';
import { useBreadcrumbs } from '@shared/components/breadcrumbs';
import { getContactEmailLink } from '@/utils/getContactEmailLink';
import {
  type ContactTopic,
  renderContactDetails,
} from '../utils/contactDetailsRenderer';
import { CONTACT_TOPICS } from '../constants';
import { ROUTE_TITLES } from '@/routes';

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
 * Handles resource data, breadcrumbs, contact form state, and page structure
 */
export const useContactPage = (): UseContactPageReturn => {
  // Get resource ID from URL params
  const { id: rec_resource_id } = useParams();

  // Fetch resource data
  const { data: recResource } = useGetRecreationResourceById({
    id: rec_resource_id,
  });

  // Set up breadcrumbs based on context
  useBreadcrumbs({
    context: { resourceName: recResource?.name, resourceId: rec_resource_id },
  });

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
