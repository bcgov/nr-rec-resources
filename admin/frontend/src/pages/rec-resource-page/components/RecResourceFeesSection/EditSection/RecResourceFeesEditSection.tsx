import { Stack } from 'react-bootstrap';
import { ROUTE_PATHS } from '@/constants/routes';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { Route } from '@/routes/rec-resource/$id/fees/add';
import { RecResourceFeesTable } from '@/pages/rec-resource-page/components/RecResourceFeesSection/RecResourceFeesTable';
import { AddFees } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/AddFees';

export const RecResourceFeesEditSection = () => {
  const { fees } = Route.useLoaderData();
  const params = Route.useParams();
  const recResourceId = params?.id;

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Fees</h2>
        <Stack direction="horizontal" gap={2}>
          <LinkWithQueryParams
            to={ROUTE_PATHS.REC_RESOURCE_FEES.replace('$id', recResourceId)}
            className="btn btn-outline-primary"
            activeOptions={{ exact: true }}
          >
            Cancel
          </LinkWithQueryParams>
        </Stack>
      </div>

      <div className="rounded">
        <div className="fw-bold mb-4">Current Fee Information</div>
        <RecResourceFeesTable fees={fees} />
      </div>

      <AddFees />
    </Stack>
  );
};
