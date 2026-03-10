import { Stack } from 'react-bootstrap';
import { RoleGuard } from '@/components/auth';
import { RecResourceFeesTable } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable';
import { ROUTE_PATHS } from '@/constants/routes';
import { RecreationFeeUIModel } from '@/services';
import { ROLES } from '@/hooks/useAuthorizations';
import { Link } from '@tanstack/react-router';

export const RecResourceFeesContent = ({
  fees,
  recResourceId,
}: {
  fees: RecreationFeeUIModel[];
  recResourceId?: string;
}) => {
  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Fees</h2>
        <Stack direction="horizontal" gap={2}>
          <RoleGuard requireAll={[ROLES.ADMIN]}>
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
          </RoleGuard>
        </Stack>
      </div>
      <div className="rounded">
        <div className="fw-bold mb-4">Current Fee Information</div>
        <RecResourceFeesTable fees={fees} recResourceId={recResourceId} />
      </div>
    </Stack>
  );
};
