import { Stack } from 'react-bootstrap';
import { Route } from '@/routes/rec-resource/$id/fees/index';
import { FeatureFlagGuard } from '@/contexts/feature-flags';
import { RecResourceFeesTable } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { ROUTE_PATHS } from '@/constants/routes';

export const RecResourceFeesSection = () => {
  const { fees } = Route.useLoaderData();
  const params = Route.useParams();
  const recResourceId = params?.id;

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Fees</h2>
        <Stack direction="horizontal" gap={2}>
          <FeatureFlagGuard requiredFlags={['enable_full_features']}>
            <LinkWithQueryParams
              to={ROUTE_PATHS.REC_RESOURCE_FEES_ADD.replace(
                '$id',
                recResourceId,
              )}
              className="btn btn-primary"
            >
              Add Fee
            </LinkWithQueryParams>
          </FeatureFlagGuard>
        </Stack>
      </div>
      <div className="rounded">
        <div className="fw-bold mb-4">Current Fee Information</div>
        <RecResourceFeesTable fees={fees} />
      </div>
    </Stack>
  );
};
