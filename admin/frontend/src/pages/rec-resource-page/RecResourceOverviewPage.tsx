import { RecResourceOverviewSection } from '@/pages/rec-resource-page/components/RecResourceOverviewSection';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = () => (
  <div className="rec-resource-page__loading-container">
    <Spinner
      animation="border"
      className="rec-resource-page__loading-spinner"
      role="status"
      aria-label="Loading recreation resource"
    />
  </div>
);

export const RecResourceOverviewPage = () => {
  const { recResource, isLoading, error } = useRecResource();

  if (error) {
    return null;
  }

  if (isLoading || !recResource) {
    return <LoadingSpinner />;
  }

  return <RecResourceOverviewSection recResource={recResource} />;
};
