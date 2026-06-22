import { Stack } from 'react-bootstrap';
import { EditableGuard } from '@/components/auth';
import { RecResourceFeesTable } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable';
import { ROUTE_PATHS } from '@/constants/routes';
import { RecreationFeeUIModel } from '@/services';
import { Link } from '@tanstack/react-router';

export const RecResourceFeesContent = ({
  fees,
  recResourceId,
  isArchived,
}: {
  fees: RecreationFeeUIModel[];
  recResourceId?: string;
  isArchived?: boolean;
}) => {
  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Fees</h2>
        <Stack direction="horizontal" gap={2}>
          <EditableGuard isArchived={isArchived}>
            {recResourceId ? (
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_FEES_ADD.replace(
                  '$id',
                  recResourceId,
                )}
                className="btn btn-primary"
              >
                Add Fee
              </Link>
            ) : null}
          </EditableGuard>
        </Stack>
      </div>
      <div className="rounded">
        <div className="fw-bold mb-4">Current Fee Information</div>
        <RecResourceFeesTable
          fees={fees}
          recResourceId={recResourceId}
          isArchived={isArchived}
        />
      </div>
    </Stack>
  );
};
