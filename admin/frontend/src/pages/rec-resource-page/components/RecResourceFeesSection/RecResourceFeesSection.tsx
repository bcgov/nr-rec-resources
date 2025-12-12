import { RecreationFeeUIModel } from '@/services';
import { RecResourceFeesTable } from './RecResourceFeesTable';

interface RecResourceFeesSectionProps {
  fees: RecreationFeeUIModel[];
}

export const RecResourceFeesSection = ({
  fees,
}: RecResourceFeesSectionProps) => {
  return (
    <div className="rounded">
      <div className="fw-bold mb-4">Current Fee Information</div>
      <RecResourceFeesTable fees={fees} />
    </div>
  );
};
