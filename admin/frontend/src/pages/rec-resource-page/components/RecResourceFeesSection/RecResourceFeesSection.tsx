import { useGetRecreationResourceFees } from '@/services';
import { Spinner } from 'react-bootstrap';
import { RecResourceFeesTable } from './RecResourceFeesTable';

interface RecResourceFeesSectionProps {
  recResourceId: string;
}

export const RecResourceFeesSection = ({
  recResourceId,
}: RecResourceFeesSectionProps) => {
  const {
    data: fees = [],
    isLoading,
    error,
  } = useGetRecreationResourceFees(recResourceId);

  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading fees...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger py-3">
        Error loading fees. Please try again later.
      </div>
    );
  }

  return (
    <div className="rounded">
      <div className="fw-bold mb-4">Current Fee Information</div>
      <RecResourceFeesTable fees={fees} />
    </div>
  );
};
