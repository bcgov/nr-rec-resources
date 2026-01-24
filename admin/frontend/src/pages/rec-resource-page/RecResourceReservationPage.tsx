import { RecResourceReservationSection } from '@/pages/rec-resource-page/components/RecResourceReservationSection';
import { Spinner } from 'react-bootstrap';
import { useRecResourceReservation } from './hooks/useRecResourceReservation';
import { Route } from '@/routes/rec-resource/$id/reservation';

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

export const RecResourceReservationPage = () => {
  const params = Route.useParams();
  const recResourceId = params?.id;
  const { reservationInfo, isLoading, error } =
    useRecResourceReservation(recResourceId);

  if (error) {
    return null;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <RecResourceReservationSection
      reservationInfo={reservationInfo !== undefined ? reservationInfo : null}
    />
  );
};
