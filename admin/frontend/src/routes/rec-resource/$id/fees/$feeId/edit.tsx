import { createFileRoute } from '@tanstack/react-router';
import { recResourceFeesLoader } from '@/services/loaders/recResourceFeesLoader';
import { RecResourceFeesEditSection } from '@/pages/rec-resource-page/components/RecResourceFeesSection/EditSection/RecResourceFeesEditSection';
import { ROUTE_PATHS } from '@/constants/routes';
import { FeeFormRouteGuard, feeFormBeforeLoad } from '../-feeFormRoute';

export const Route = createFileRoute('/rec-resource/$id/fees/$feeId/edit')({
  component: RecResourceFeeEditRoute,
  loader: recResourceFeesLoader,
  beforeLoad: feeFormBeforeLoad((params: { id: string; feeId: string }) => ({
    label: 'Edit fee',
    href: ROUTE_PATHS.REC_RESOURCE_FEE_EDIT.replace('$id', params.id).replace(
      '$feeId',
      params.feeId,
    ),
  })),
});

function RecResourceFeeEditRoute() {
  const { id } = Route.useParams();

  return (
    <FeeFormRouteGuard id={id}>
      <RecResourceFeesEditSection />
    </FeeFormRouteGuard>
  );
}
