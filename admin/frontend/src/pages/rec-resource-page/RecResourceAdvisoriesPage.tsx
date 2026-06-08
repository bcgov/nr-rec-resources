import { RecResourceAdvisoriesSection } from '@/pages/rec-resource-page/components/RecResourceAdvisoriesSection/RecResourceAdvisoriesSection';
import { Spinner } from 'react-bootstrap';
import { useRecResourceAdvisories } from './hooks/useRecResourceAdvisories';
import { Route } from '@/routes/rec-resource/$id/advisories';

const LoadingSpinner = () => (
  <div className="rec-resource-page__loading-container">
    <Spinner
      animation="border"
      className="rec-resource-page__loading-spinner"
      role="status"
      aria-label="Loading advisories"
    />
  </div>
);

export const RecResourceAdvisoriesPage = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { advisories, isLoading, error } =
    useRecResourceAdvisories(recResourceId);

  if (error) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <RecResourceAdvisoriesSection advisories={advisories ?? []} />;
};
